import { Prisma, PrismaClient } from '@prisma/client';

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
            customerId: true,
            currentStatus: true,
            moveType: true,
            moveDate: true,
            createdAt: true,
            quoteRequestAddresses: true,
          },
        },
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
            customerId: true,
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
      OR: [
        {
          targetedQuoteRequest: {
            targetedQuoteRejection: null,
          },
        },
        {
          targetedQuoteRequest: null,
        },
      ],
    };

    const [list, totalCount] = await Promise.all([
      this.prismaClient.moverQuote.findMany({
        skip,
        take: pageSize,
        orderBy: {
          quoteRequest: {
            moveDate: 'desc',
          },
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
              customerId: true,
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

  // 해당 기사님 서비스 가능 지역 조회
  async getServiceRegionsForMover(moverId: string) {
    return await this.prismaClient.moverServiceRegion.findMany({
      where: {
        moverId,
      },
    });
  }

  // 견적 요청에 대한 기사님 견적 생성
  async createMoverQuote(
    data: { moverId: string; quoteRequestId: string; price: number; comment: string },
    tx?: Prisma.TransactionClient,
  ) {
    const client = tx || this.prismaClient;
    return await client.moverQuote.create({
      data,
    });
  }

  // 견적 요청에 대한 기사님 견적 조회
  async getMoverQuoteById(quoteId: string, tx?: Prisma.TransactionClient) {
    const client = tx || this.prismaClient;
    return await client.moverQuote.findUnique({
      where: { id: quoteId },
      include: {
        quoteRequest: {
          include: {
            quoteStatusHistories: true,
            quoteRequestAddresses: true,
          },
        },
        mover: true,
        quoteMatch: true,
      },
    });
  }

  // 기사님이 특정 견적 요청에 대해 이미 견적을 제출했는지 확인
  async findFirstMoverQuote(
    moverId: string,
    quoteRequestId: string,
    tx?: Prisma.TransactionClient,
  ) {
    const client = tx || this.prismaClient;
    return await client.moverQuote.findFirst({
      where: {
        moverId,
        quoteRequestId,
      },
    });
  }
}
