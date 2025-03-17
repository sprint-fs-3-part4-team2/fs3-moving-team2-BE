import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function getPendingReviews() {
  // 확정된 견적 중 리뷰가 없는 데이터를 조회
  const quoteMatchesWithoutReview = await prisma.quoteMatch.findMany({
    where: {
      is_completed: true,
      review: null, // 리뷰가 없는 경우
    },
    include: {
      mover_quote: {
        include: {
          quote_request: true,
          mover: {
            include: {
              user: true, // driverName
            },
          },
          targeted_quote_request: true,
        },
      },
    },
    orderBy: {
      mover_quote: {
        quote_request: {
          move_date: 'asc',
        },
      },
    },
  });

  // 프론트엔드가 원하는 형식으로 데이터 가공
  const formattedData = quoteMatchesWithoutReview.map((quoteMatch) => ({
    id: quoteMatch.id,
    driverName: quoteMatch.mover_quote.mover.user.name,
    driverProfileImage: quoteMatch.mover_quote.mover.profile_image,
    serviceDate: quoteMatch.mover_quote.quote_request.move_date.toISOString().split('T')[0], // YYYY-MM-DD 형식
    estimatePrice: quoteMatch.mover_quote.price,
    moveType: quoteMatch.mover_quote.quote_request.move_type,
    isTargeted: !!quoteMatch.mover_quote.targeted_quote_request, // 지정견적요청 여부
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
      quote_match_id: estimateId, // QuoteMatch.id와 연결
      rating,
      content: comment, // 스키마의 content 필드에 매핑
    },
  });
  return review;
}
