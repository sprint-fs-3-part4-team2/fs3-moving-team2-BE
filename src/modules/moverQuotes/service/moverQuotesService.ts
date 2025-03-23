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
}
