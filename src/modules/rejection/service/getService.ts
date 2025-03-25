import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const regionShortMap: { [key: string]: string } = {
  강원도: '강원도',
  강원특별자치도: '강원도',
  경기도: '경기도',
  경상남도: '경남',
  경상북도: '경북',
  광주광역시: '광주시',
  대구광역시: '대구시',
  대전광역시: '대전시',
  부산광역시: '부산시',
  서울특별시: '서울시',
  세종특별자치시: '세종시',
  울산광역시: '울산시',
  인천광역시: '인천시',
  전라남도: '전남',
  전라북도: '전북',
  제주특별자치도: '제주도',
  충청남도: '충남',
  충청북도: '충북',
};

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
        ? `${regionShortMap[departureAddress.sido] || departureAddress.sido} ${departureAddress.sigungu}`
        : rejection.targetedQuoteRequest.quoteRequest.fromRegion,
      toRegion: arrivalAddress
        ? `${regionShortMap[arrivalAddress.sido] || arrivalAddress.sido} ${arrivalAddress.sigungu}`
        : rejection.targetedQuoteRequest.quoteRequest.toRegion,
    };
  });
}
