import express from 'express';
import QuoteRequestsRepository from './repository/quoteRequests.repository';
import prismaClient from '@/prismaClient';
import QuoteRequestsService from './service/quoteRequests.service';
import QuoteRequestsController from './controller/quoteRequests.controller';
import asyncRequestHandler from '@/core/handlers/asyncRequestHandler';
import { createAuthMiddleware } from '@/core/middleware/auth/auth';
import MoverQuotesRepository from '../moverQuotes/repository/moverQuotesRepository';

const router = express.Router();

export const quoteRequestsRepository = new QuoteRequestsRepository(prismaClient);
const moverquotesRepository = new MoverQuotesRepository(prismaClient);
const quoteRequestsService = new QuoteRequestsService(
  quoteRequestsRepository,
  moverquotesRepository,
);
const quoteRequestsController = new QuoteRequestsController(quoteRequestsService);
const {
  createQuoteRequest,
  getAllQuoteRequests,
  getLatestQuoteRequestForCustomer,
  cancelQuoteRequest,
} = quoteRequestsController;

// 고객 견적 요청
// router.route('/').post(createAuthMiddleware('customer'), asyncRequestHandler(createQuoteRequest));
router.route('/').post(asyncRequestHandler(createQuoteRequest));

// 기사님 전체 견적 요청 조회
// router.route('/').get(createAuthMiddleware('mover'), asyncRequestHandler(getAllQuoteRequests));
router.route('/').get(asyncRequestHandler(getAllQuoteRequests));

// 고객 신청한 견적 조회
router.route('/latest').get(asyncRequestHandler(getLatestQuoteRequestForCustomer));

router
  .route('/:quoteRequestId')
  .delete(createAuthMiddleware('customer'), asyncRequestHandler(cancelQuoteRequest));

export default router;
