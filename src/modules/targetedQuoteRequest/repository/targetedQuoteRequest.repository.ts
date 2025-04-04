import { Prisma, PrismaClient } from '@prisma/client';
import TargetedQuoteRejectionRepository from './targetedQuoteRejection.repository';

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

  async findByQuoteId(quoteId: string, tx?: Prisma.TransactionClient) {
    const client = tx || this.prismaClient;
    return await client.targetedQuoteRequest.findMany({
      where: {
        quoteRequestId: quoteId,
      },
    });
  }

  async create(data: { quoteRequestId: string; moverId: string; tx?: Prisma.TransactionClient }) {
    const client = data.tx || this.prismaClient;
    return await client.targetedQuoteRequest.create({
      data: {
        quoteRequestId: data.quoteRequestId,
        moverId: data.moverId,
      },
    });
  }
}
