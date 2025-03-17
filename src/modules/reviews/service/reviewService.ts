import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function getPendingReviews() {
  // 확정된 견적 중 리뷰가 없는 데이터를 조회
  const quoteMatchesWithoutReview = await prisma.quoteMatch.findMany({
    where: {
      isCompleted: true,
      review: null, // 리뷰가 없는 경우
    },
    include: {
      moverQuote: {
        include: {
          quoteRequest: true,
          mover: {
            include: {
              user: true, // driverName
            },
          },
          targetedQuoteRequest: true,
        },
      },
    },
    orderBy: {
      moverQuote: {
        quoteRequest: {
          moveDate: 'asc',
        },
      },
    },
  });

  // 프론트엔드가 원하는 형식으로 데이터 가공
  const formattedData = quoteMatchesWithoutReview.map((quoteMatch) => ({
    id: quoteMatch.id,
    driverName: quoteMatch.moverQuote.mover.user.name,
    driverProfileImage: quoteMatch.moverQuote.mover.profileImage,
    serviceDate: quoteMatch.moverQuote.quoteRequest.moveDate.toISOString().split('T')[0], // YYYY-MM-DD 형식
    estimatePrice: quoteMatch.moverQuote.price,
    moveType: quoteMatch.moverQuote.quoteRequest.moveType,
    isTargeted: !!quoteMatch.moverQuote.targetedQuoteRequest, // 지정견적요청 여부
  }));

  return formattedData;
}

export async function createReview(reviewData: {
  estimateId: string;
  rating: number;
  comment: string;
}) {
  const { estimateId, rating, comment } = reviewData;
  const review = await prisma.review.create({
    data: {
      quoteMatchId: estimateId, // QuoteMatch.id와 연결
      rating,
      content: comment, // 스키마의 content 필드에 매핑
    },
  });
  return review;
}
