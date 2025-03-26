import { PrismaClient, Prisma } from '@prisma/client';

export default class QuoteStatusHistoryRepository {
  constructor(private prismaClient: PrismaClient) {}

  // 주어진 견적 요청 ID와 상태를 사용하여 QuoteStatusHistory 레코드를 생성
  async createQuoteStatusHistory(
    data: { quoteRequestId: string; status: string },
    tx?: Prisma.TransactionClient,
  ) {
    const client = tx || this.prismaClient;
    return await client.quoteStatusHistory.create({
      data,
    });
  }
}
