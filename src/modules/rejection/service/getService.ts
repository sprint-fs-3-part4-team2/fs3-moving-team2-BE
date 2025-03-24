import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function getRejectedTargetedQuoteRequestsByMover(moverId: string) {
  const rejectedQuoteRequests = await prisma.targetedQuoteRejection.findMany({
    where: { targetedQuoteRequest: { moverId } },
    include: {
      targetedQuoteRequest: {
        include: {
          quoteRequest: {
            include: {
              customer: { include: { user: true } },
              quoteRequestAddresses: true,
            },
          },
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  return rejectedQuoteRequests.map((rejection) => {
    const departureAddress = rejection.targetedQuoteRequest.quoteRequest.quoteRequestAddresses.find(
      (addr) => addr.type === 'DEPARTURE',
    );
    const arrivalAddress = rejection.targetedQuoteRequest.quoteRequest.quoteRequestAddresses.find(
      (addr) => addr.type === 'ARRIVAL',
    );

    return {
      moveType: rejection.targetedQuoteRequest.quoteRequest.moveType,
      isTargeted: true,
      customerName: rejection.targetedQuoteRequest.quoteRequest.customer.user.name,
      serviceDate: rejection.targetedQuoteRequest.quoteRequest.moveDate.toISOString().split('T')[0],
      fromRegion: departureAddress
        ? `${departureAddress.sido} ${departureAddress.sigungu}`
        : rejection.targetedQuoteRequest.quoteRequest.fromRegion,
      toRegion: arrivalAddress
        ? `${arrivalAddress.sido} ${arrivalAddress.sigungu}`
        : rejection.targetedQuoteRequest.quoteRequest.toRegion,
    };
  });
}
