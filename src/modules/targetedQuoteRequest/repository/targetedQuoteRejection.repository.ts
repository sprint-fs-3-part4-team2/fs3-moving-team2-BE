import { Prisma, PrismaClient } from '@prisma/client';

export default class TargetedQuoteRejectionRepository {
  constructor(private prismaClient: PrismaClient) {}

  // 견적 요청 거절 사유 생성
  async createRejection(
    data: { targetedQuoteRequestId: string; rejectionReason: string },
    tx?: Prisma.TransactionClient,
  ) {
    const client = tx || this.prismaClient;
    return await client.targetedQuoteRejection.create({
      data,
    });
  }
}
