import { Customer, Mover, PrismaClient } from '@prisma/client';
import MoverQuotesRepository from '@/modules/moverQuotes/repository/moverQuotesRepository';
import { createPendingQuoteRequest } from '@/testUtils/factories/quoteRequest.factory';
import { cleanupMock } from '@/testUtils/cleanUpMock';
import { createCustomer } from '@/testUtils/factories/customer.factory';
import { createMover } from '@/testUtils/factories/mover.factory';

describe('moverQuotesRepository', () => {
  const testPrismaClient = new PrismaClient({
    datasources: {
      db: {
        url: process.env.DATABASE_URL_2,
      },
    },
  });
  const moverQuotesRepository = new MoverQuotesRepository(testPrismaClient);
  let customer: Customer | null = null;
  let mover: Mover | null = null;

  beforeEach(async () => {
    await cleanupMock(testPrismaClient);
    const data = await createCustomer(testPrismaClient);
    const moverData = await createMover(testPrismaClient);
    customer = data.customer;
    mover = moverData.mover;
  });

  test('getQuoteForCustomer 테스트', async () => {
    const quoteRequest = await createPendingQuoteRequest(testPrismaClient, customer!.id);
    const moverQuote = await testPrismaClient.moverQuote.create({
      data: {
        quoteRequestId: quoteRequest.id,
        moverId: mover!.id,
        price: 10000,
        comment: 'test comment',
      },
    });
    const foundMoverQuote = await moverQuotesRepository.getQuoteForCustomer(moverQuote.id);

    expect(foundMoverQuote).toBeDefined();
    expect(foundMoverQuote?.id).toBe(moverQuote.id);
    expect(foundMoverQuote?.moverId).toBe(mover!.id);
    expect(foundMoverQuote?.quoteRequestId).toBe(quoteRequest.id);
    expect(foundMoverQuote?.price).toBe(moverQuote.price);
    expect(foundMoverQuote?.comment).toBe(moverQuote.comment);
    expect(foundMoverQuote?.quoteRequest).toBeDefined();
  });
});
