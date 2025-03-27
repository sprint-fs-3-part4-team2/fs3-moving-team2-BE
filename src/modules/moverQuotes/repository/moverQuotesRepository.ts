import { PrismaClient } from '@prisma/client';

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

  // 받은 요청에 대한 기사님 견적 생성
  async submitQuoteByMover(quoteId: string, moverId: string, price: number, comment: string) {
    return await this.prismaClient.$transaction(async (tx) => {
      // 1. 견적 요청(QuoteRequest)와 관련 데이터를 조회
      const quote = await tx.quoteRequest.findUnique({
        where: { id: quoteId },
        include: {
          quoteStatusHistories: {
            orderBy: { createdAt: 'desc' },
          },
        },
      });
      if (!quote) throw new Error('Quote not found');
      // (필요하다면 quote.moverId와 moverId 일치 여부 등 추가 검증)

      // 1-1. 최근 견적 상태가 QUOTE_REQUESTED 인지 검증
      if (quote.currentStatus !== 'QUOTE_REQUESTED') {
        throw new Error('견적 요청 테이블의 현재 상태에서, Quote status is not QUOTE_REQUESTED');
      }
      const latestStatus = quote.quoteStatusHistories[0]?.status;
      if (latestStatus !== 'QUOTE_REQUESTED') {
        throw new Error('견적 상태 테이블, Quote status is not QUOTE_REQUESTED');
      }

      // 2. 견적 상태 MOVER_SUBMITTED 생성
      await tx.quoteRequest.update({
        where: { id: quoteId },
        data: {
          currentStatus: 'MOVER_SUBMITTED',
          quoteStatusHistories: {
            create: { status: 'MOVER_SUBMITTED' },
          },
        },
      });

      // 3. 관련된 이사업자 견적(MoverQuote) 업데이트
      const newMoverQuote = await tx.moverQuote.create({
        data: {
          moverId,
          quoteRequestId: quoteId,
          price,
          comment,
        },
      });

      // 4. 관련 견적 정보 및 상태 내역 등 전체 정보 재조회
      const completeQuote = await tx.moverQuote.findUnique({
        where: { id: newMoverQuote.id },
        include: {
          // 견적 요청 정보 및 그에 따른 상태 내역과 주소
          quoteRequest: {
            include: {
              quoteStatusHistories: true,
              quoteRequestAddresses: true,
            },
          },
          // 이사업자 정보 및 견적 매칭 정보 (필요에 따라 선택)
          mover: true,
          quoteMatch: true,
        },
      });

      return completeQuote;
    });
  }
}
