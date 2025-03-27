import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function getMoverReviews(moverId: string) {
  const reviews = await prisma.review.findMany({
    where: {
      quoteMatch: {
        moverQuote: {
          moverId,
        },
      },
    },
    select: {
      rating: true,
      content: true,
      createdAt: true,
      quoteMatch: {
        select: {
          moverQuote: {
            select: {
              mover: {
                select: {
                  user: {
                    select: {
                      id: true,
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  // 별점 평균 + 리뷰 수
  const aggregateResult = await prisma.review.aggregate({
    where: {
      quoteMatch: {
        moverQuote: {
          moverId,
        },
      },
    },
    _avg: {
      rating: true,
    },
    _count: {
      rating: true,
    },
  });

  // ⭐️ 별점 분포 계산 (1~5점)
  const ratingCounts: Record<number, number> = {
    1: 0,
    2: 0,
    3: 0,
    4: 0,
    5: 0,
  };

  for (const review of reviews) {
    const rating = review.rating;
    if (rating >= 1 && rating <= 5) {
      ratingCounts[rating] += 1;
    }
  }

  const averageRating = aggregateResult._avg.rating ?? 0;
  const ratingCount = aggregateResult._count.rating ?? 0;

  return {
    averageRating,
    ratingCount,
    ratingCounts,
    reviews: reviews.map((review) => ({
      rating: review.rating,
      content: review.content,
      writtenAt: review.createdAt.toISOString().split('T')[0],
      nickname: review.quoteMatch.moverQuote.mover.user.id,
    })),
  };
}
