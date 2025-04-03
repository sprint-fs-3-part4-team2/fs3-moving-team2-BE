import { AUTH_MESSAGES } from '@/constants/authMessages';
import { NotFoundException } from '@/core/errors';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// 찜한 목록 조회
export async function getFavorites(customerId: string) {
  const customer = await prisma.customer.findUnique({
    where: { id: customerId },
    include: { user: true },
  });
  if (!customer) {
    throw new NotFoundException(AUTH_MESSAGES.needLogin);
  }
  const favorites = await prisma.customerFavorite.findMany({
    where: {
      customerId: customerId,
    },
    include: {
      mover: {
        include: {
          moverServices: true,
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  });
  return favorites;
}

// 찜하기 추가
export async function addFavorite(customerId: string, moverId: string) {
  const result = await prisma.$transaction(async (prisma) => {
    const favorite = await prisma.customerFavorite.create({
      data: {
        customerId: customerId,
        moverId: moverId,
      },
    });
    const mover = await prisma.mover.update({
      where: { id: moverId },
      data: {
        totalCustomerFavorite: {
          increment: 1,
        },
      },
      select: {
        id: true,
        totalCustomerFavorite: true,
      },
    });
    return {
      favorite,
      mover,
    };
  });
  return {
    moverId: result.mover.id,
    totalCustomerFavorite: result.mover.totalCustomerFavorite,
  };
}

// 찜하기 취소
export async function removeFavorite(customerId: string, moverId: string) {
  const result = await prisma.$transaction(async (prisma) => {
    const favorite = await prisma.customerFavorite.delete({
      where: {
        customerId_moverId: {
          customerId: customerId,
          moverId: moverId,
        },
      },
    });
    const mover = await prisma.mover.update({
      where: { id: moverId },
      data: {
        totalCustomerFavorite: {
          decrement: 1,
        },
      },
      select: {
        id: true,
        totalCustomerFavorite: true,
      },
    });
    return {
      favorite,
      mover,
    };
  });
  return {
    moverId: result.mover.id,
    totalCustomerFavorite: result.mover.totalCustomerFavorite,
  };
}

// 찜하기 상태 확인
export async function checkFavoriteStatus(customerId: string, moverId: string) {
  const customer = await prisma.customer.findUnique({
    where: { id: customerId },
    include: { user: true },
  });
  if (!customer) {
    throw new NotFoundException(AUTH_MESSAGES.needLogin);
  }

  const favorite = await prisma.customerFavorite.findUnique({
    where: {
      customerId_moverId: {
        customerId: customerId,
        moverId: moverId,
      },
    },
  });

  return {
    isFavorite: !!favorite,
  };
}
