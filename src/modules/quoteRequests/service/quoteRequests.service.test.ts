import { PrismaClient } from '@prisma/client';
import QuoteRequestsRepository from '../repository/quoteRequests.repository';
import MoverQuotesRepository from '@/modules/moverQuotes/repository/moverQuotesRepository';
import QuoteRequestsService from './quoteRequests.service';

jest.mock('@/modules/quoteRequests/repository/quoteRequests.repository');
jest.mock('@/modules/moverQuotes/repository/moverQuotesRepository');
const prismaClient = new PrismaClient();

describe('quoteRequestsService test', () => {
  const quoteRequestRepository = new QuoteRequestsRepository(prismaClient);
  const moverQuotesRepository = new MoverQuotesRepository(prismaClient);
  const quoteRequestService = new QuoteRequestsService(
    quoteRequestRepository,
    moverQuotesRepository,
  );
});
