import { ForbiddenException, NotFoundException } from '@/core/errors';
import MoverQuotesRepository from '../repository/moverQuotesRepository';
import { EXCEPTION_MESSAGES } from '@/constants/exceptionMessages';
import QuoteMapper from '../mapper/moverQuote.mapper';
import { AUTH_MESSAGES } from '@/constants/authMessages';
import { quoteRequestsRepository } from '@/modules/quoteRequests/routes';
import { PrismaClient } from '@prisma/client';

export default class QuotesService {
  constructor(
    private quotesRepository: MoverQuotesRepository,
    private prismaClient: PrismaClient,
  ) {}

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

  // 견적 제출
  async submitQuoteByMover(quoteId: string, moverId: string, price: number, comment: string) {
    return await this.prismaClient.$transaction(async (tx) => {
      // 1. 견적 요청 조회
      const quote = await quoteRequestsRepository.findQuoteRequestById(quoteId, tx);
      if (!quote) {
        throw new NotFoundException(EXCEPTION_MESSAGES.quoteNotFound);
      }

      // 2. 현재 상태 확인 (예를 들어, "QUOTE_REQUESTED" 상태여야 함)
      if (quote.currentStatus !== 'QUOTE_REQUESTED') {
        throw new ForbiddenException('견적 요청 상태가 견적 제출 가능한 상태가 아닙니다.');
      }
      // const latestStatus = quote.quoteStatusHistories[0]?.status;
      // if (latestStatus !== 'QUOTE_REQUESTED') {
      //   throw new ForbiddenException('견적 상태 이력 상 제출 가능한 상태가 아닙니다.');
      // }

      // 3. MoverQuote 생성
      const newMoverQuote = await this.quotesRepository.createMoverQuote(
        { moverId, quoteRequestId: quoteId, price, comment },
        tx,
      );

      // 4. 결과 조회
      const completeQuote = await this.quotesRepository.getMoverQuoteById(newMoverQuote.id, tx);
      console.log(completeQuote);
      return { message: `견적을 제출했습니다.` };
    });
  }
}
