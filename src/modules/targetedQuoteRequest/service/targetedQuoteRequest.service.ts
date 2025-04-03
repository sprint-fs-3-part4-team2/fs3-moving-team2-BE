import QuoteRequestsRepository from '@/modules/quoteRequests/repository/quoteRequests.repository';
import TargetedQuoteRejectionRepository from '../repository/targetedQuoteRejection.repository';
import TargetedQuoteRequestRepository from '../repository/targetedQuoteRequest.repository';
import { PrismaClient } from '@prisma/client';
import { createNotification } from '@/modules/notification/service/notificationService';
import { moverRepository } from '@/modules/movers/service/moverService';
import { ConflictException, NotFoundException } from '@/core/errors';
import { EXCEPTION_MESSAGES } from '@/constants/exceptionMessages';

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
      const quote = await this.quoteRequestsRepository.findQuoteRequestById(quoteId, tx);

      if (!quote) throw new Error('Quote not found');

      if (quote.currentStatus !== 'QUOTE_REQUESTED') {
        throw new ConflictException(
          'current_status is not QUOTE_REQUESTED (견적 요청 상태가 아닙니다.)',
        );
      }

      // 1-1. 해당 견적의 최근 견적 상태가 QUOTE_REQUEST 요청인지 검증
      const latestStatus = quote.quoteStatusHistories[0]?.status;
      if (latestStatus !== 'QUOTE_REQUESTED') {
        throw new ConflictException('견적 상태 테이블의 Quote status is not QUOTE_REQUESTED');
      }

      // 2. 지정 견적 요청(TargetedQuoteRequest) 조회 (기사님 id와 견적 요청 id 기준)
      const targetedQuoteRequest = await this.targetedQuoteRequestRepository.findOneByQuoteAndMover(
        quoteId,
        moverId,
        tx,
      );
      if (!targetedQuoteRequest) {
        throw new Error('Targeted quote request not found');
      }

      // 3. 지정 견적 반려 기록이 있는지 확인
      const existingRejection =
        await this.targetedQuoteRejectionRepository.findRejectionByTargetedQuoteRequestId(
          targetedQuoteRequest.id,
          tx,
        );
      if (existingRejection) {
        throw new Error('Targeted quote rejection already exists');
      }

      // 4. 지정 견적 반려 기록(TargetedQuoteRejection) 생성
      await this.targetedQuoteRejectionRepository.createRejection(
        {
          targetedQuoteRequestId: targetedQuoteRequest.id,
          rejectionReason,
        },
        tx,
      );

      // 5. 기사님 이름 정보 조회
      const mover = await moverRepository.getMoverNameById(moverId, tx);
      if (!mover) {
        throw new NotFoundException(EXCEPTION_MESSAGES.moverNotFound);
      }

      // 6. 지정 견적 요청 알람
      await createNotification({
        userId: quote.customer.userId, // 견적 요청한 고객
        messageType: 'quoteRefuse', // 견적 요청 거절 알림
        moverName: mover.user.name, // 기사님 이름
      });
    });

    return { message: '지정 견적 거절 완료' };
  }
}
