import { PrismaClient } from '@prisma/client';
import { NotFoundException } from '@/core/errors/notFoundException';
import { AUTH_MESSAGES } from '@/constants/authMessages';
import { EXCEPTION_MESSAGES } from '@/constants/exceptionMessages';
import { UnauthorizedException } from '@/core/errors/unauthorizedException';
import { ForbiddenException } from '@/core/errors';
import { quoteRequestsRepository } from '@/modules/quoteRequests/routes';

const prisma = new PrismaClient();

// 고객 확인
export async function checkCustomerExistence(customerId: string) {
  const customer = await prisma.customer.findUnique({
    where: { id: customerId },
  });
  if (!customer) {
    throw new UnauthorizedException(AUTH_MESSAGES.needLogin);
  }
  return customer;
}

// 대기 중인 견적 목록 조회
export async function getPendingQuotes(userId: string, roleId: string) {
  const customer = await prisma.customer.findUnique({
    where: { id: roleId },
    include: { user: true },
  });
  if (!customer) {
    throw new NotFoundException(AUTH_MESSAGES.needLogin);
  }
  const pendingQuotes = await prisma.quoteRequest.findFirst({
    where: {
      customerId: roleId,
      quoteStatusHistories: {
        some: { status: 'QUOTE_REQUESTED' },
      },
    },
    include: {
      quoteStatusHistories: { orderBy: { createdAt: 'desc' }, take: 1 },
      quoteRequestAddresses: true,
      moverQuotes: {
        include: {
          mover: {
            include: {
              moverServices: true,
            },
          },
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
    take: 1,
  });
  if (!pendingQuotes) {
    throw new NotFoundException(EXCEPTION_MESSAGES.quoteNotFound);
  }
  return pendingQuotes;
}

// 견적 확정
export async function confirmQuote(moverQuoteId: string, customerId: string) {
  const result = await prisma.$transaction(async (prisma) => {
    const moverQuote = await prisma.moverQuote.findUnique({
      where: { id: moverQuoteId },
      select: {
        quoteRequest: {
          select: {
            customerId: true,
            id: true,
          },
        },
      },
    });
    if (moverQuote?.quoteRequest.customerId !== customerId) {
      throw new ForbiddenException(AUTH_MESSAGES.forbidden);
    }
    // 견적 상태를 "QUOTE_CONFIRMED"로 업데이트 이후 "MOVE_COMPLETED"도 같이 업데이트
    const quoteRequestId = moverQuote.quoteRequest.id;
    await quoteRequestsRepository.updateQuoteRequestStatus(
      quoteRequestId,
      'QUOTE_CONFIRMED',
      prisma,
    );
    await quoteRequestsRepository.updateQuoteRequestStatus(
      quoteRequestId,
      'MOVE_COMPLETED',
      prisma,
    );
    await prisma.moverQuote.update({
      where: { id: moverQuoteId },
      data: {
        quoteMatch: {
          create: {
            isCompleted: true,
          },
        },
      },
    });
    return { message: '견적이 확정되었습니다.' };
  });
  return result;
}
