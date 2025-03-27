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
export async function getPendingQuotes(userId: string, roleId: string) {
  const customer = await prisma.customer.findUnique({
    where: { id: roleId },
    include: { user: true },
  });
  if (!customer) {
    throw new NotFoundException(AUTH_MESSAGES.needLogin);
  }
  const pendingQuotes = await prisma.quoteRequest.findMany({
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
          mover: true,
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
    take: 1,
  });
  if (!pendingQuotes || pendingQuotes.length === 0) {
    throw new NotFoundException(EXCEPTION_MESSAGES.quoteNotFound);
  }
  return pendingQuotes;
}

// // 견적 확정
// export async function confirmQuote(quoteRequestId: string, moverQuoteId: string) {
//   const quoteRequest = await prisma.quoteRequest.findUnique({
//     where: { id: quoteRequestId },
//   });
//   if (!quoteRequest) {
//     throw new NotFoundException(EXCEPTION_MESSAGES.quoteNotFound);
//   }
//   await prisma.quoteRequest.update({
//     where: { id: quoteRequestId },
//     data: {
//       quoteStatusHistories: {
//         create: {
//           status: 'QUOTE_CONFIRMED',
//           updatedAt: new Date(),
//         },
//       },
//     },
//   });
//   await prisma.moverQuote.update({
//     where: { id: moverQuoteId },
//     data: {
//       quoteMatch: {
//         create: {
//           isCompleted: false,
//         },
//       },
//     },
//   });
// }

export async function confirmQuote(quoteRequestId: string, moverQuoteId: string) {
  const quoteRequest = await prisma.quoteRequest.findUnique({
    where: { id: quoteRequestId },
  });
  if (!quoteRequest) {
    throw new NotFoundException(EXCEPTION_MESSAGES.quoteNotFound);
  }
  // 견적 상태를 "QUOTE_CONFIRMED"로 업데이트
  await prisma.quoteRequest.update({
    where: { id: quoteRequestId },
    data: {
      quoteStatusHistories: {
        create: {
          status: 'QUOTE_CONFIRMED', // 견적 확정 상태로 변경
          updatedAt: new Date(),
        },
      },
    },
  });
  // 선택된 견적에 대해 moverQuote 상태를 업데이트
  const moverQuote = await prisma.moverQuote.findUnique({
    where: { id: moverQuoteId },
  });
  if (!moverQuote) {
    throw new NotFoundException(EXCEPTION_MESSAGES.quoteNotFound);
  }
  // 기사님에게 견적을 보내는 상태로 업데이트
  await prisma.moverQuote.update({
    where: { id: moverQuoteId },
    data: {
      quoteMatch: {
        create: {
          isCompleted: false, // 견적이 확정되었으므로 기사님에게 수락을 요청하는 상태로 변경
        },
      },
    },
  });
  return { message: '견적이 확정되었습니다.' };
}
