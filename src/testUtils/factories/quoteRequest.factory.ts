import { PrismaClient, Region, ServiceType } from '@prisma/client';

interface Address {
  sido: string;
  sigungu: string;
  street: string;
}

interface QuoteRequestData {
  moveType: ServiceType;
  moveDate: Date;
  fromRegion: Region;
  toRegion: Region;
  departure: Address;
  currentStatus: string;
  arrival: Address;
}

export const createQuoteRequest = async (
  prisma: PrismaClient,
  customerId: string,
  quoteData?: Partial<QuoteRequestData>,
) => {
  const date = new Date();
  date.setMonth(date.getMonth() + 1);
  return await prisma.quoteRequest.create({
    data: {
      customerId: customerId,
      moveType: quoteData?.moveType || 'SMALL_MOVE',
      moveDate: quoteData?.moveDate || date,
      fromRegion: quoteData?.fromRegion || 'SEOUL',
      toRegion: quoteData?.toRegion || 'BUSAN',
      currentStatus: quoteData?.currentStatus || 'QUOTE_REQUESTED',
      quoteStatusHistories: {
        create: [{ status: 'QUOTE_REQUESTED' }],
      },
      quoteRequestAddresses: {
        create: [
          {
            type: 'DEPARTURE',
            sido: quoteData?.departure?.sido || '서울시',
            sigungu: quoteData?.departure?.sigungu || '강남구',
            street: quoteData?.departure?.street || '1번길 32',
            fullAddress: quoteData?.departure
              ? Object.values(quoteData?.departure).join(' ')
              : '서울시 강남구 1번길 32',
          },
          {
            type: 'ARRIVAL',
            sido: quoteData?.arrival?.sido || '부산광역시',
            sigungu: quoteData?.arrival?.sigungu || '해운대구',
            street: quoteData?.arrival?.street || '2번길 48',
            fullAddress: quoteData?.arrival
              ? Object.values(quoteData?.arrival).join(' ')
              : '부산광역시 해운대구 2번길 48',
          },
        ],
      },
    },
  });
};
