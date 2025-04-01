import { PrismaClient } from '@prisma/client';
import { MOVE_TYPE } from '@/constants/serviceType';
const prisma = new PrismaClient();

export default async function getReviewsByUserId(userId: string) {
  const reviews = await prisma.review.findMany({
    where: {
      quoteMatch: {
        moverQuote: {
          quoteRequest: {
            customer: {
              id: userId,
            },
          },
        },
      },
    },
    include: {
      quoteMatch: {
        include: {
          moverQuote: {
            select: {
              price: true,
              targetedQuoteRequestId: true,
              mover: {
                select: {
                  id: true,
                  profileImage: true,
                  user: {
                    select: {
                      name: true,
                    },
                  },
                },
              },
              quoteRequest: {
                select: {
                  moveDate: true,
                  moveType: true,
                },
              },
            },
          },
        },
      },
    },
  });

  return reviews.map((review) => ({
    // id: review.id,
    writtenAt: review.createdAt.toISOString().split('T')[0],
    id: review.quoteMatch.moverQuote.mover.id,
    moverName: review.quoteMatch.moverQuote.mover.user.name,
    imageUrl: review.quoteMatch.moverQuote.mover.profileImage,
    movingDate: review.quoteMatch.moverQuote.quoteRequest.moveDate.toISOString().split('T')[0],
    movingType: [MOVE_TYPE[review.quoteMatch.moverQuote.quoteRequest.moveType]],
    price: review.quoteMatch.moverQuote.price,
    rating: review.rating,
    reviewContent: review.content,
    isCustomQuote: review.quoteMatch.moverQuote.targetedQuoteRequestId !== null,
  }));
}
