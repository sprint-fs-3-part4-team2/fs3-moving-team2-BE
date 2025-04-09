import { PrismaClient } from '@prisma/client';
import { createNotification } from '@/modules/notification/service/notificationService';

const prisma = new PrismaClient();

export async function getPendingReviews(userId: string) {
  const quoteMatchesWithoutReview = await prisma.quoteMatch.findMany({
    where: {
      isCompleted: true,
      review: null,
      moverQuote: {
        quoteRequest: {
          customer: { userId },
        },
      },
    },
    include: {
      moverQuote: {
        include: {
          quoteRequest: true,
          mover: { include: { user: true } },
          targetedQuoteRequest: true,
        },
      },
    },
    orderBy: {
      moverQuote: {
        quoteRequest: { moveDate: 'asc' },
      },
    },
  });

  return quoteMatchesWithoutReview.map((quoteMatch) => ({
    id: quoteMatch.id,
    driverName: quoteMatch.moverQuote.mover.user.name,
    driverProfileImage: quoteMatch.moverQuote.mover.profileImage,
    serviceDate: quoteMatch.moverQuote.quoteRequest.moveDate.toISOString().split('T')[0],
    estimatePrice: quoteMatch.moverQuote.price,
    moveType: quoteMatch.moverQuote.quoteRequest.moveType,
    isTargeted: !!quoteMatch.moverQuote.targetedQuoteRequest,
  }));
}

export async function createReview(reviewData: {
  userId: string;
  estimateId: string;
  rating: number;
  comment: string;
}) {
  const { userId, estimateId, rating, comment } = reviewData;

  const quoteMatch = await prisma.quoteMatch.findUnique({
    where: { id: estimateId },
    include: {
      moverQuote: {
        include: {
          quoteRequest: {
            include: { customer: true },
          },
          mover: { include: { user: true } },
        },
      },
    },
  });
  if (!quoteMatch || quoteMatch.moverQuote.quoteRequest.customer.userId !== userId) {
    throw new Error('해당 견적에 대한 리뷰 작성 권한이 없습니다.');
  }

  const review = await prisma.review.create({
    data: {
      quoteMatchId: estimateId,
      rating,
      content: comment,
    },
  });

  const moverUserId = quoteMatch.moverQuote.mover.user.id;
  await createNotification({
    userId: moverUserId,
    messageType: 'newReview',
    url: `/mover/profile`,
  });

  return {
    ...review,
    moverId: quoteMatch.moverQuote.mover.id,
  };
}
