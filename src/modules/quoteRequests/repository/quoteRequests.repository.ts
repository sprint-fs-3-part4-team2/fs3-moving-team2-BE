import { Prisma, PrismaClient } from '@prisma/client';
import { CreateQuoteRequestData } from '../dto/createQuoteRequest.dto';
import { QuoteStatus } from '@/types/quoteStatus.types';

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

  // 견적 요청 상태 기록 중 active 상태를 갖는 경우만 필터링

  // 견적 요청 상태가 이사 완료이면 새로운 견적 요청을 할 수 있도록 구현됨 -> 확장시 수정 필요
  // const activeStatuses = ['QUOTE_REQUESTED', 'MOVER_SUBMITTED', 'QUOTE_CONFIRMED'];
  private CANCEL_QUOTE_STATUS_HISTORY_CLAUSE = {
    quoteStatusHistories: {
      some: {
        status: {
          in: ['QUOTE_REQUESTED', 'MOVER_SUBMITTED'], // active 상태(견적 요청, 견적 제출)인 경우
        },
      },
      none: {
        status: {
          notIn: ['QUOTE_REQUESTED', 'MOVER_SUBMITTED'], // active 상태가 아닌 경우(견적 확정, 이사 완료)
        },
      },
    },
  };

  async createQuoteRequest(data: CreateQuoteRequestData) {
    return await this.prismaClient.quoteRequest.create({
      data: {
        ...data,
        currentStatus: 'QUOTE_REQUESTED',
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

  async updateQuoteRequestStatus(
    quoteId: string,
    status: QuoteStatus,
    tx?: Prisma.TransactionClient,
  ) {
    const client = tx || this.prismaClient;
    return await client.quoteRequest.update({
      where: { id: quoteId },
      data: {
        currentStatus: status,
        quoteStatusHistories: {
          create: [{ status }],
        },
      },
    });
  }

  async getLatestQuoteRequestForCustomer(customerId: string) {
    return await this.prismaClient.quoteRequest.findFirst({
      where: {
        customerId,
        // 견적 상태 기록 중 active 상태를 갖는 경우만 필터링(QUOTE_REQUESTED", "QUOTE_CONFIRMED")에 해당하는 요청만 반환)
        // ...this.CANCEL_QUOTE_STATUS_HISTORY_CLAUSE,
        currentStatus: {
          in: ['QUOTE_REQUESTED', 'QUOTE_CONFIRMED'],
        },
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

  async getAllQuoteRequests(page: number, pageSize: number, whereClause?: any, orderBy?: any) {
    const skip = (page - 1) * pageSize;

    const filteredWhere = {
      AND: [
        whereClause || {},
        {
          currentStatus: 'QUOTE_REQUESTED',
        },
      ],
    };

    const totalCount = await this.prismaClient.quoteRequest.count({
      where: filteredWhere,
    });

    const list = await this.prismaClient.quoteRequest.findMany({
      skip,
      take: pageSize,
      orderBy,
      where: filteredWhere,
      include: {
        quoteRequestAddresses: true,
        quoteStatusHistories: {
          orderBy: {
            createdAt: 'desc',
          },
        },
        targetedQuoteRequests: true,
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

  // findUniqueQuoteWithStatus: 특정 견적 요청을 id로 조회하며, 상태 내역 등 관련 정보를 포함함
  async findUniqueQuoteWithStatus(quoteId: string, tx?: Prisma.TransactionClient) {
    const client = tx || this.prismaClient;
    return await client.quoteRequest.findUnique({
      where: { id: quoteId },
      include: {
        // 상태 내역을 최신순으로 정렬하여 포함
        quoteStatusHistories: {
          orderBy: { createdAt: 'desc' },
        },
      },
    });
  }

  // 특정 견적 요청을 id로 조회하며, 상태 내역 등 관련 정보를 포함함
  async findQuoteRequestById(quoteId: string, tx?: Prisma.TransactionClient) {
    const client = tx || this.prismaClient;
    return await client.quoteRequest.findUnique({
      where: { id: quoteId },
      include: {
        quoteStatusHistories: {
          orderBy: { createdAt: 'desc' },
        },
      },
    });
  }
}
