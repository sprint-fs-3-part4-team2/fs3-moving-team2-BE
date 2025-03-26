import { ForbiddenException, NotFoundException } from '@/core/errors';
import QuotesRepository from '../repository/moverQuotesRepository';
import { EXCEPTION_MESSAGES } from '@/constants/exceptionMessages';
import QuoteMapper from '../mapper/moverQuote.mapper';
import { AUTH_MESSAGES } from '@/constants/authMessages';

export default class QuotesService {
  constructor(private quotesRepository: QuotesRepository) {}

  async getQuoteByIdForCustomer(quoteId: string, customerId: string) {
    const quote = await this.quotesRepository.getQuoteForCustomer(quoteId);
    if (!quote) throw new NotFoundException(EXCEPTION_MESSAGES.quoteNotFound);
    if (quote?.quoteRequest.customerId !== customerId)
      throw new ForbiddenException(AUTH_MESSAGES.forbidden);

    return QuoteMapper.toQuoteForCustomerDto(quote);
  }

  async getQuoteByIdForMover(quoteId: string, moverId: string) {
    const quote = await this.quotesRepository.getQuoteForMover(quoteId);
    if (!quote) throw new NotFoundException(EXCEPTION_MESSAGES.quoteNotFound);
    if (quote?.moverId !== moverId) throw new ForbiddenException(AUTH_MESSAGES.forbidden);

    return QuoteMapper.toQuoteForMoverDto(quote);
  }

  async getQuotesListByMover(page: number, pageSize: number, moverId: string) {
    const data = await this.quotesRepository.getQuotesListByMover(page, pageSize, moverId);

    const mappedList = data.list.map((quote) => QuoteMapper.toQuoteForMoverDto(quote));
    return {
      ...data,
      list: mappedList,
    };
  }

  async submitQuoteByMover(quoteId: string, moverId: string, price: number, comment: string) {
    const quote = await this.quotesRepository.submitQuoteByMover(quoteId, moverId, price, comment);

    return quote;
  }

  async rejectQuoteByMover(quoteId: string, moverId: string, rejectionReason: string) {
    const rejectQuote = await this.quotesRepository.rejectQuoteByMover(
      quoteId,
      moverId,
      rejectionReason,
    );

    return { rejectQuote, message: '지정 견적 거절 완료' };
  }
}
