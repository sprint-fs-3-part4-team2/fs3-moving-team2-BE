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
    // 1. 찜 데이터 생성
    const favorite = await prisma.customerFavorite.create({
      data: {
        customerId: customerId,
        moverId: moverId,
      },
    });
    console.log('확인?');
    // 2. Mover의 totalCustomerFavorite를 증가
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
    console.log(`Favorite added for moverId: ${mover.id}`); // 디버깅용 로그
    return {
      favorite,
      mover,
    };
  });
  console.log(`Favorite added for moverId: ${result.mover.id}`); // 디버깅용 로그
  return {
    moverId: result.mover.id,
    totalCustomerFavorite: result.mover.totalCustomerFavorite,
  };
}

// 찜하기 취소
export async function removeFavorite(customerId: string, moverId: string) {
  const result = await prisma.$transaction(async (prisma) => {
    // 1. 찜 데이터 삭제
    const favorite = await prisma.customerFavorite.delete({
      where: {
        customerId_moverId: {
          customerId: customerId,
          moverId: moverId,
        },
      },
    });
    // 2. Mover의 totalCustomerFavorite를 감소
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
    console.log(`Favorite removed for moverId: ${mover.id}`); // 디버깅용 로그
    return {
      favorite,
      mover,
    };
  });
  console.log(`Favorite removed for moverId: ${result.mover.id}`); // 디버깅용 로그
  return {
    moverId: result.mover.id,
    totalCustomerFavorite: result.mover.totalCustomerFavorite,
  };
}
