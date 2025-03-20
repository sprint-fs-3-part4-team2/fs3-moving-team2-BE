import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// 찜한 목록 조회
export async function getFavorites(customerId: string) {
  try {
    const favorites = await prisma.customerFavorite.findMany({
      where: {
        customerId: customerId,
      },
      include: {
        mover: true,
      },
    });
    return favorites;
  } catch (error) {
    throw new Error('찜한 목록 조회 실패');
  }
}

// 찜하기 추가
export async function addFavorite(customerId: string, moverId: string) {
  try {
    const favorite = await prisma.customerFavorite.create({
      data: {
        customerId: customerId,
        moverId: moverId,
      },
    });
    await prisma.mover.update({
      where: { id: moverId },
      data: {
        totalCustomerFavorite: {
          increment: 1,
        },
      },
    });
    return favorite;
  } catch (error) {
    throw new Error('찜하기 추가 실패');
  }
}

// 찜하기 취소
export async function removeFavorite(customerId: string, moverId: string) {
  try {
    await prisma.customerFavorite.delete({
      where: {
        customerId_moverId: {
          customerId: customerId,
          moverId: moverId,
        },
      },
    });
    await prisma.mover.update({
      where: { id: moverId },
      data: {
        totalCustomerFavorite: {
          decrement: 1,
        },
      },
    });
    return { message: '찜하기 취소 완료' };
  } catch (error) {
    throw new Error('찜하기 취소 실패');
  }
}
