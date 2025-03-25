import { PrismaClient } from '@prisma/client';
import { NotFoundException } from '@/core/errors/notFoundException';
import { AUTH_MESSAGES } from '@/constants/authMessages';
import { EXCEPTION_MESSAGES } from '@/constants/exceptionMessages';
import { UnauthorizedException } from '@/core/errors/unauthorizedException';

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
export async function getPendingQuotes(customerId: string) {
  await checkCustomerExistence(customerId);
  const pendingQuotes = await prisma.quoteRequest.findMany({
    where: {
      customerId,
      quoteStatusHistories: {
        some: { status: 'QUOTE_REQUESTED' },
      },
    },
    include: {
      quoteStatusHistories: true,
      quoteRequestAddresses: true,
    },
  });
  if (!pendingQuotes || pendingQuotes.length === 0) {
    throw new NotFoundException(EXCEPTION_MESSAGES.quoteNotFound);
  }
  return pendingQuotes;
}

// 견적 확정
export async function confirmQuote(quoteRequestId: string, moverQuoteId: string) {
  const quoteRequest = await prisma.quoteRequest.findUnique({
    where: { id: quoteRequestId },
  });
  if (!quoteRequest) {
    throw new NotFoundException(EXCEPTION_MESSAGES.quoteNotFound);
  }
  await prisma.quoteRequest.update({
    where: { id: quoteRequestId },
    data: {
      quoteStatusHistories: {
        create: {
          status: 'QUOTE_CONFIRMED',
          updatedAt: new Date(),
        },
      },
    },
  });
  await prisma.moverQuote.update({
    where: { id: moverQuoteId },
    data: {
      quoteMatch: {
        create: {
          isCompleted: false,
        },
      },
    },
  });
}
