import { MOVE_TYPE, regionMap } from '@/constants/serviceType';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const reverseRegionMap: Record<string, string> = Object.entries(regionMap).reduce(
  (acc, [kor, eng]) => {
    acc[eng] = kor;
    return acc;
  },
  {} as Record<string, string>,
);

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

  const [average, total, favoriteCount] = await Promise.all([
    prisma.review.aggregate({
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
    }),
    prisma.review.count({
      where: {
        quoteMatch: {
          moverQuote: {
            mover: {
              userId: userId,
            },
          },
        },
      },
    }),
    prisma.customerFavorite.count({
      where: {
        mover: {
          userId: userId,
        },
      },
    }),
  ]);

  return {
    moverName: user.name,
    introduction: user.mover.introduction,
    imageUrl: user.mover.profileImage,
    averageRating: parseFloat((average._avg.rating ?? 0).toFixed(1)),
    ratingCount: total, //총리뷰수
    experienceYears: user.mover.experienceYears,
    quoteCount: user.mover.totalConfirmedCount,
    favoriteCount,
    movingType: user.mover.moverServices.map((s) => MOVE_TYPE[s.serviceType]),
    regions: user.mover.moverServiceRegions.map((r) => reverseRegionMap[r.region]),
  };
}
