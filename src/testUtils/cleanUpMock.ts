import { PrismaClient } from '@prisma/client';

export const cleanupMock = async (prismaClient: PrismaClient) => {
  await prismaClient.$transaction([
    prismaClient.review.deleteMany(),
    prismaClient.quoteMatch.deleteMany(),
    prismaClient.targetedQuoteRejection.deleteMany(),
    prismaClient.moverQuote.deleteMany(),
    prismaClient.targetedQuoteRequest.deleteMany(),
    prismaClient.quoteStatusHistory.deleteMany(),
    prismaClient.quoteRequestAddress.deleteMany(),
    prismaClient.quoteRequest.deleteMany(),

    prismaClient.moverServiceRegion.deleteMany(),
    prismaClient.moverService.deleteMany(),
    prismaClient.customerService.deleteMany(),
    prismaClient.customerFavorite.deleteMany(),

    prismaClient.notification.deleteMany(),
    prismaClient.socialLogin.deleteMany(),
    prismaClient.mover.deleteMany(),
    prismaClient.customer.deleteMany(),
    prismaClient.user.deleteMany(),
  ]);
};
