'use client';

import { PrismaClient } from '@prisma/client';
import { NotFoundException } from '@/core/errors/notFoundException';
import { AUTH_MESSAGES } from '@/constants/authMessages';
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

// 내 견적 요청 목록 조회
export async function getQuoteRequests(userId: string, roleId: string) {
  const customer = await prisma.customer.findUnique({
    where: { id: roleId },
    include: { user: true },
  });
  if (!customer) {
    throw new NotFoundException(AUTH_MESSAGES.needLogin);
  }
  const quoteRequests = await prisma.quoteRequest.findMany({
    where: {
      customerId: roleId,
      currentStatus: {
        in: ['QUOTE_CONFIRMED', 'MOVE_COMPLETED', 'QUOTE_CANCELED', 'REQUEST_EXPIRED'],
      },
    },
    include: {
      quoteRequestAddresses: true,
      quoteStatusHistories: true,
      moverQuotes: {
        include: {
          mover: {
            include: {
              user: true,
              moverServices: true,
            },
          },
        },
      },
      targetedQuoteRequests: {
        include: {
          moverQuote: true,
          mover: {
            include: {
              user: true,
              moverServices: true,
            },
          },
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  });
  return quoteRequests;
}

// 기사님에게 받은 견적 목록 조회
export async function getQuotesFromDrivers(userId: string, quoteRequestedId: string) {
  const quotes = await prisma.moverQuote.findMany({
    where: {
      quoteRequestId: quoteRequestedId,
      quoteRequest: {
        customerId: userId,
      },
    },
    include: {
      quoteMatch: true,
    },
    orderBy: {
      createdAt: 'desc',
    },
  });
  return quotes;
}
