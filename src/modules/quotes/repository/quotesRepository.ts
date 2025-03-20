import { PrismaClient, ServiceType, Region } from '@prisma/client';

export default class QuotesRepository {
  constructor(private prismaClient: PrismaClient) {}

  private MOVER_INCLUDE_CLAUSE = {
    mover: {
      select: {
        user: {
          select: {
            name: true,
          },
        },
        experienceYears: true,
        profileImage: true,
        introduction: true,
        totalConfirmedCount: true,
        totalCustomerFavorite: true,
        totalReviews: true,
        averageRating: true,
      },
    },
  };

  private CUSTOMER_INCLUDE_CLAUSE = {
    customer: {
      select: {
        user: {
          select: {
            name: true,
          },
        },
      },
    },
  };

  //   private makeQuoteClause(includeCustomer: boolean) {
  //     const quoteRequestInclude: any = {
  //       quoteRequestAddress: true,
  //       quoteStatusHistory: true,
  //     };

  //     if (includeCustomer) quoteRequestInclude.customer = this.CUSTOMER_INCLUDE_CLAUSE;

  //     return {
  //       quoteMatch: {
  //         select: {
  //           id: true,
  //         },
  //       },
  //       quoteRequest: {
  //         include: quoteRequestInclude,
  //       },
  //     };
  //   }

  async getQuoteForCustomer(quoteId: string) {
    return await this.prismaClient.moverQuote.findUnique({
      where: {
        id: quoteId,
      },
      include: {
        ...this.MOVER_INCLUDE_CLAUSE,
        quoteMatch: {
          select: {
            id: true,
          },
        },
        quoteRequest: {
          select: {
            moveType: true,
            moveDate: true,
            createdAt: true,
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

  async getQuoteForMover(quoteId: string) {
    return await this.prismaClient.moverQuote.findUnique({
      where: {
        id: quoteId,
      },
      include: {
        quoteMatch: {
          select: {
            id: true,
          },
        },
        quoteRequest: {
          select: {
            moveType: true,
            moveDate: true,
            createdAt: true,
            ...this.CUSTOMER_INCLUDE_CLAUSE,
            quoteRequestAddresses: true,
          },
        },
      },
    });
  }

  async getQuotesListByMover(page: number, pageSize: number, moverId: string) {
    const skip = (page - 1) * pageSize;
    const whereClause = {
      moverId,
      quoteMatch: {
        isNot: null,
      },
    };

    const [list, totalCount] = await Promise.all([
      this.prismaClient.moverQuote.findMany({
        skip,
        take: pageSize,
        orderBy: {
          createdAt: 'desc',
        },
        where: whereClause,
        include: {
          quoteMatch: {
            select: {
              id: true,
            },
          },
          quoteRequest: {
            select: {
              moveType: true,
              moveDate: true,
              createdAt: true,
              ...this.CUSTOMER_INCLUDE_CLAUSE,
              quoteRequestAddresses: true,
            },
          },
        },
      }),
      this.prismaClient.moverQuote.count({
        where: whereClause,
      }),
    ]);

    return {
      list,
      totalCount,
      page,
      pageSize,
      totalPages: Math.ceil(totalCount / pageSize),
    };
  }
}
