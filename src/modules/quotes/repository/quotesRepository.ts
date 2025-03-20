import { PrismaClient, ServiceType, Region } from '@prisma/client';

export default class QuotesRepository {
  constructor(private prismaClient: PrismaClient) {}

  async getQuoteForCustomer(quoteId: string) {
    return await this.prismaClient.moverQuote.findUnique({
      where: {
        id: quoteId,
      },
      include: {
        mover: {
          select: {
            user: {
              select: {
                name: true,
              },
            },
            experienceYears: true,
            profileImage: true,
            description: true,
            totalConfirmedCount: true,
            totalCustomerFavorite: true,
            totalReviews: true,
            averageRating: true,
          },
        },
        quoteMatch: {
          select: {
            id: true,
          },
        },
        quoteRequest: {
          include: {
            quoteRequestAddresses: true,
          },
        },
      },
    });
  }

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
}
