import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function getMoverReviews(moverId: string) {
  const reviews = await prisma.review.findMany({
    where: {
      quoteMatch: {
        moverQuote: {
          moverId: moverId,
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
                      id: true, // 유저 닉네임
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

  // 별점 평균계산
  const averageResult = await prisma.review.aggregate({
    where: {
      quoteMatch: {
        moverQuote: {
          moverId: moverId,
        },
      },
    },
    _avg: {
      rating: true,
    },
  });

  const averageRating = averageResult._avg.rating ?? 0;

  return {
    averageRating,
    reviews: reviews.map((review) => ({
      rating: review.rating,
      content: review.content,
      writtenAt: review.createdAt.toISOString().split('T')[0],
      nickname: review.quoteMatch.moverQuote.mover.user.id,
    })),
  };
}

//별점평균
//유저이름
//작성일
//별점
//리뷰내용
