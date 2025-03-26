import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function getMoverProfileDetail(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      name: true,
      mover: {
        select: {
          profileImage: true,
          experienceYears: true,
          introduction: true,
          totalConfirmedCount: true,
          moverServices: {
            select: {
              serviceType: true,
            },
          },
          moverServiceRegions: {
            select: {
              region: true,
            },
          },
        },
      },
    },
  });

  if (!user || !user.mover) return null;

  const average = await prisma.review.aggregate({
    _avg: {
      rating: true,
    },
    where: {
      quoteMatch: {
        moverQuote: {
          mover: {
            userId: userId,
          },
        },
      },
    },
  });

  const total = await prisma.review.count({
    where: {
      quoteMatch: {
        moverQuote: {
          mover: {
            userId: userId,
          },
        },
      },
    },
  });
  console.log(user);
  console.log(average);
  console.log(total);
  return {
    name: user.name,
    introduction: user.mover.introduction,
    profileImage: user.mover.profileImage,
    averageRating: parseFloat((average._avg.rating ?? 0).toFixed(1)),
    totalReviews: total,
    experienceYears: user.mover.experienceYears,
    totalConfirmedCount: user.mover.totalConfirmedCount,
    services: user.mover.moverServices.map((s) => s.serviceType),
    regions: user.mover.moverServiceRegions.map((r) => r.region),
  };
}
