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

  const result = await prisma.$transaction(async (tx) => {
    const quoteMatch = await tx.quoteMatch.findUnique({
      where: { id: estimateId },
      include: {
        moverQuote: {
          include: {
            quoteRequest: { include: { customer: true } },
            mover: true,
          },
        },
      },
    });
    if (!quoteMatch || quoteMatch.moverQuote.quoteRequest.customer.userId !== userId) {
      throw new Error('해당 견적에 대한 리뷰 작성 권한이 없습니다.');
    }

    const review = await tx.review.create({
      data: {
        quoteMatchId: estimateId,
        rating,
        content: comment,
      },
    });

    const mover = await tx.mover.findUnique({
      where: { id: quoteMatch.moverQuote.moverId },
      select: { averageRating: true, totalReviews: true, userId: true },
    });
    if (!mover) {
      throw new Error('해당 기사님을 찾을 수 없습니다.');
    }

    const newTotalReviews = mover.totalReviews + 1;
    const newAverageRating = (mover.averageRating * mover.totalReviews + rating) / newTotalReviews;

    await tx.mover.update({
      where: { id: quoteMatch.moverQuote.moverId },
      data: {
        averageRating: newAverageRating,
        totalReviews: newTotalReviews,
      },
    });

    return { ...review, moverId: quoteMatch.moverQuote.moverId };
  });

  const mover = await prisma.mover.findUnique({
    where: { id: result.moverId },
    select: { userId: true },
  });
  if (!mover) {
    throw new Error('알림 생성 실패: 기사님을 찾을 수 없습니다.');
  }
  await createNotification({
    userId: mover.userId,
    messageType: 'newReview',
    url: `/mover/profile`,
  });

  return result;
}
