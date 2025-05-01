import { Customer, PrismaClient } from '@prisma/client';
import QuoteRequestsRepository from './quoteRequests.repository';
import { createCustomer } from '@/testUtils/factories/customer.factory';
import { cleanupMock } from '@/testUtils/cleanUpMock';
import { createQuoteRequest } from '@/testUtils/factories/quoteRequest.factory';

describe('quoteRequestsRepository test', () => {
  const testPrismaClient = new PrismaClient({
    datasources: {
      db: {
        url: process.env.DATABASE_URL_1,
      },
    },
  });
  const quoteRequestsRepository = new QuoteRequestsRepository(testPrismaClient);

  let customer: Customer | null = null;

  beforeEach(async () => {
    await cleanupMock(testPrismaClient);
    const data = await createCustomer(testPrismaClient);

    customer = data.customer;
  });

  test('createQuoteRequest 테스트', async () => {
    const date = new Date();
    date.setMonth(date.getMonth() + 1);
    const requestedQuote = await quoteRequestsRepository.createQuoteRequest({
      customerId: customer!.id,
      moveType: 'SMALL_MOVE',
      moveDate: date,
      fromRegion: 'SEOUL',
      toRegion: 'BUSAN',
      quoteRequestAddresses: {
        create: [
          {
            type: 'DEPARTURE',
            sido: 'SEOUL',
            sigungu: 'GANGNAM',
            street: 'STREET 1',
            fullAddress: 'FULL ADDRESS 1',
          },
          {
            type: 'ARRIVAL',
            sido: 'BUSAN',
            sigungu: 'HAEUNDAE',
            street: 'STREET 2',
            fullAddress: 'FULL ADDRESS 2',
          },
        ],
      },
    });

    expect(requestedQuote).toBeDefined();
    expect(requestedQuote?.customerId).toBe(customer?.id);
    expect(requestedQuote?.quoteStatusHistories.length).toBe(1);
    expect(requestedQuote?.quoteStatusHistories[0].status).toBe('QUOTE_REQUESTED');
    expect(requestedQuote?.quoteRequestAddresses).toHaveLength(2);
    expect(requestedQuote?.quoteRequestAddresses[0].type).toBe('DEPARTURE');
    expect(requestedQuote?.quoteRequestAddresses[1].type).toBe('ARRIVAL');
  });

  test('getLatestQuoteRequestForCustomer 테스트', async () => {
    const pastDate = new Date();
    pastDate.setMonth(pastDate.getMonth() - 1);
    const pendingQuoteRequest = await createQuoteRequest(testPrismaClient, customer!.id);
    const confirmedQuoteRequest = await createQuoteRequest(testPrismaClient, customer!.id, {
      moveDate: pastDate,
      currentStatus: 'MOVE_COMPLETED',
    });
    testPrismaClient.quoteStatusHistory.createMany({
      data: [
        {
          quoteRequestId: confirmedQuoteRequest.id,
          status: 'QUOTE_CONFIRMED',
        },
        {
          quoteRequestId: confirmedQuoteRequest.id,
          status: 'MOVE_COMPLETED',
        },
      ],
    });

    const quoteRequest = await quoteRequestsRepository.getLatestQuoteRequestForCustomer(
      customer!.id,
    );

    expect(quoteRequest).toBeDefined();
    expect(quoteRequest?.customerId).toBe(customer?.id);
    expect(quoteRequest?.id).toBe(pendingQuoteRequest.id);
    expect(quoteRequest?.quoteRequestAddresses).toHaveLength(2);
    expect(quoteRequest?.quoteRequestAddresses[0].type).toBe('DEPARTURE');
    expect(quoteRequest?.quoteRequestAddresses[1].type).toBe('ARRIVAL');
    expect(quoteRequest?.quoteStatusHistories).toHaveLength(1);
    expect(quoteRequest?.quoteStatusHistories[0].status).toBe('QUOTE_REQUESTED');
  });
});
