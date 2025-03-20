import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function getSubmittedReviews() {
  const reviews = await prisma.review.findMany({
    include: {
      quoteMatch: {
        include: {
          moverQuote: {
            include: {
              quoteRequest: true,
              mover: {
                include: {
                  user: true, // 기사님 정보 가져오기
                },
              },
            },
          },
        },
      },
    },
    orderBy: {
      createdAt: 'desc', // 최신 리뷰 순으로 정렬
    },
  });

  // 프론트엔드가 원하는 형식으로 데이터 가공
  return reviews.map((review) => ({
    id: review.id,
    estimateId: review.quoteMatchId,
    driverName: review.quoteMatch.moverQuote.mover.user.name,
    driverProfileImage: review.quoteMatch.moverQuote.mover.profileImage,
    serviceDate: review.quoteMatch.moverQuote.quoteRequest.moveDate.toISOString().split('T')[0], // YYYY-MM-DD 형식
    estimatePrice: review.quoteMatch.moverQuote.price,
    moveType: review.quoteMatch.moverQuote.quoteRequest.moveType,
    rating: review.rating,
    comment: review.content,
    writtenAt: review.createdAt.toISOString().split('T')[0], // 리뷰 작성 날짜
  }));
}
