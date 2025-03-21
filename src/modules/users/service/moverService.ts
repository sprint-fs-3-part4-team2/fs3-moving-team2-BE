import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function getMovers() {
  const movers = await prisma.mover.findMany({
    include: {
      user: true, // 사용자 정보 포함
    },
  });

  return movers.map((mover) => ({
    id: mover.id,
    userId: mover.userId,
    profileImage: mover.profileImage,
    experienceYears: mover.experienceYears,
    introduction: mover.introduction,
    description: mover.description,
    averageRating: mover.averageRating,
    totalReviews: mover.totalReviews,
    totalCustomerFavorite: mover.totalCustomerFavorite,
    totalConfirmedCount: mover.totalConfirmedCount,
    createdAt: mover.createdAt.toISOString().split('T')[0], // YYYY-MM-DD 형식
  }));
}
