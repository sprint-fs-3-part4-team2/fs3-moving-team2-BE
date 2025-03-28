import QuoteRequestsRepository from '@/modules/quoteRequests/repository/quoteRequests.repository';
import TargetedQuoteRejectionRepository from '../repository/targetedQuoteRejection.repository';
import TargetedQuoteRequestRepository from '../repository/targetedQuoteRequest.repository';
import { PrismaClient } from '@prisma/client';

export default class TargetedQuoteRequestService {
  constructor(
    private prismaClient: PrismaClient,
    private targetedQuoteRequestRepository: TargetedQuoteRequestRepository,
    private targetedQuoteRejectionRepository: TargetedQuoteRejectionRepository,
    private quoteRequestsRepository: QuoteRequestsRepository,
  ) {}

  async rejectQuoteByMover(quoteId: string, moverId: string, rejectionReason: string) {
    console.log('log', quoteId, moverId, rejectionReason);
    await this.prismaClient.$transaction(async (tx) => {
      // 1. 견적 요청(QuoteRequest) 조회 및 검증
      const quote = await this.quoteRequestsRepository.findUniqueQuoteWithStatus(quoteId, tx);
      if (!quote) throw new Error('Quote not found');

      if (quote.currentStatus !== 'QUOTE_REQUESTED') {
        throw new Error('견적 요청 현재 상태 필드의 Quote status is not QUOTE_REQUESTED');
      }

      // 1-1. 해당 견적의 최근 견적 상태가 QUOTE_REQUEST 요청인지 검증
      const latestStatus = quote.quoteStatusHistories[0]?.status;
      if (latestStatus !== 'QUOTE_REQUESTED') {
        throw new Error('견적 상태 테이블의 Quote status is not QUOTE_REQUESTED');
      }

      // 3. 지정 견적 요청(TargetedQuoteRequest) 조회 (기사님 id와 견적 요청 id 기준)
      const targetedQuoteRequest = await this.targetedQuoteRequestRepository.findOneByQuoteAndMover(
        quoteId,
        moverId,
        tx,
      );
      if (!targetedQuoteRequest) {
        throw new Error('Targeted quote request not found');
      }

      // 3. 지정 견적 반려 기록(TargetedQuoteRejection) 생성
      await this.targetedQuoteRejectionRepository.createRejection(
        {
          targetedQuoteRequestId: targetedQuoteRequest.id,
          rejectionReason,
        },
        tx,
      );
    });

    return { message: '지정 견적 거절 완료' };
  }
}
