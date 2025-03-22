import { PrismaClient, Region, ServiceType } from '@prisma/client';

export default class QuoteRequestsRepository {
  constructor(private prismaClient: PrismaClient) {}

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

  private CANCEL_QUOTE_STATUS_HISTORY_CLAUSE = {
    quoteStatusHistories: {
      some: {
        status: {
          in: ['QUOTE_REQUESTED', 'MOVER_SUBMITTED'],
        },
      },
      none: {
        status: {
          notIn: ['QUOTE_REQUESTED', 'MOVER_SUBMITTED'],
        },
      },
    },
  };

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

  async getAllQuoteRequests(page: number, pageSize: number) {
    const skip = (page - 1) * pageSize;
    const totalCount = await this.prismaClient.quoteRequest.count();
    const list = await this.prismaClient.quoteRequest.findMany({
      skip,
      take: pageSize,
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
        ...this.CUSTOMER_INCLUDE_CLAUSE,
      },
    });

    return {
      list,
      totalCount,
      page,
      pageSize,
      totalPages: Math.ceil(totalCount / pageSize),
    };
  }

  async findQuoteRequestById(requestId: string) {
    return await this.prismaClient.quoteRequest.findUnique({
      where: {
        id: requestId,
        ...this.CANCEL_QUOTE_STATUS_HISTORY_CLAUSE,
      },
    });
  }

  async cancelQuoteRequest(requestId: string) {
    return await this.prismaClient.quoteRequest.delete({
      where: {
        id: requestId,
        ...this.CANCEL_QUOTE_STATUS_HISTORY_CLAUSE,
      },
    });
  }
}
