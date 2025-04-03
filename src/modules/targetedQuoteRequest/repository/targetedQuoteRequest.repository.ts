import { Prisma, PrismaClient } from '@prisma/client';
export default class TargetedQuoteRequestRepository {
  constructor(private prismaClient: PrismaClient) {}

  // 견적 요청 상태 기록 중 active 상태를 갖는 경우만 필터링

  async findOneByQuoteAndMover(quoteId: string, moverId: string, tx?: Prisma.TransactionClient) {
    const client = tx || this.prismaClient;
    return await client.targetedQuoteRequest.findFirst({
      where: {
        quoteRequestId: quoteId,
        moverId,
      },
    });
  }
}
