import { PrismaClient, Region, ServiceType } from '@prisma/client';

export default class QuoteRequestsRepository {
  constructor(private prismaClient: PrismaClient) {}

  async createQuoteRequest(data: {
    customerId: string;
    moveType: ServiceType;
    fromRegion: Region;
    toRegion: Region;
    moveDate: Date;
    quoteRequestAddresses: {
      create: Array<{
        type: 'DEPARTURE' | 'ARRIVAL';
        sido: string;
        sigungu: string;
        street: string;
        fullAddress: string;
      }>;
    };
  }) {
    return await this.prismaClient.quoteRequest.create({
      data: {
        ...data,
        quoteStatusHistories: {
          // 견적 요청 상태 기록도 함께 생성
          create: [{ status: 'QUOTE_REQUESTED' }],
        },
      },
      include: {
        quoteRequestAddresses: true,
        quoteStatusHistories: true,
      },
    });
  }

  async getLatestQuoteRequestByCustomer(customerId: string) {
    return await this.prismaClient.quoteRequest.findFirst({
      where: {
        customerId,
      },
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        quoteRequestAddresses: true,
        quoteStatusHistories: {
          orderBy: {
            createdAt: 'desc',
          },
        },
      },
    });
  }
}
