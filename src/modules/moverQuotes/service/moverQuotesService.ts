import { ConflictException, ForbiddenException, NotFoundException } from '@/core/errors';
import MoverQuotesRepository from '../repository/moverQuotesRepository';
import { EXCEPTION_MESSAGES } from '@/constants/exceptionMessages';
import QuoteMapper from '../mapper/moverQuote.mapper';
import { AUTH_MESSAGES } from '@/constants/authMessages';
import { quoteRequestsRepository } from '@/modules/quoteRequests/routes';
import { PrismaClient } from '@prisma/client';
import { createNotification } from '@/modules/notification/service/notificationService';
import { moverRepository } from '@/modules/movers/service/moverService';

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

      // 2. 현재 기사(moverId)가 이미 해당 견적 요청에 대해 견적을 제출했는지 확인
      const existingMoverQuote = await this.quotesRepository.findFirstMoverQuote(
        moverId,
        quoteId,
        tx,
      );
      if (existingMoverQuote) {
        throw new ConflictException(EXCEPTION_MESSAGES.alreadySubmittedQuote);
      }

      // 3. MoverQuote 생성
      const newMoverQuote = await this.quotesRepository.createMoverQuote(
        { moverId, quoteRequestId: quoteId, price, comment },
        tx,
      );

      // 4. moverId에 해당하는 기사의 이름을 조회
      const mover = await moverRepository.getMoverNameById(moverId, tx);
      if (!mover) {
        throw new NotFoundException(EXCEPTION_MESSAGES.moverNotFound);
      }

      // 5. 견적 요청 알림 생성
      await createNotification({
        userId: quote.customer.userId,
        messageType: 'quoteArrive',
        moverName: mover.user.name,
        moveType: quote.moveType,
        url: `/quote-requests/${quoteId}`,
      });

      // 5. 결과 조회
      const completeQuote = await this.quotesRepository.getMoverQuoteById(newMoverQuote.id, tx);
      console.log(completeQuote);
      return { message: `견적을 제출했습니다.` };
    });
  }
}
