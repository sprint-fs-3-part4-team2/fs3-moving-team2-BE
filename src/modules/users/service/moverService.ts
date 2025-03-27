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
    totalReviews: total,
    ratingCount: total,
    experienceYears: user.mover.experienceYears,
    quoteCount: user.mover.totalConfirmedCount,
    favoriteCount,
    movingType: user.mover.moverServices.map((s) => MOVE_TYPE[s.serviceType]),
    regions: user.mover.moverServiceRegions.map((r) => reverseRegionMap[r.region]),
  };
}

// imageUrl, //프로필사진  555
// rating, // 평점  중복 555
// ratingCount, //평점 수 555
// experienceYears, //경력 555
// moverName = '김코드', //기사이름    555
// favoriteCount, //찜 개수  추가해야함
// quoteCount, //견적확정 수  555
// isFavoriteMoverList,  기사님 찾기 페이지에서 찜한 기사님 목록에 사용할 경우 true
// introduction, //기사소개 555
// movingType, // 이사종류 555
// regions, //지역 555
