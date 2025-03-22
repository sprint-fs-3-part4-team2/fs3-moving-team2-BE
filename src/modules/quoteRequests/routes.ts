import express from 'express';
import QuoteRequestsRepository from './repository/quoteRequests.repository';
import prismaClient from '@/prismaClient';
import QuoteRequestsService from './service/quoteRequests.service';
import QuoteRequestsController from './controller/quoteRequests.controller';
import asyncRequestHandler from '@/core/handlers/asyncRequestHandler';
import { createAuthMiddleware } from '@/core/middleware/auth/auth';

const router = express.Router();

const quoteRequestsRepository = new QuoteRequestsRepository(prismaClient);
const quoteRequestsService = new QuoteRequestsService(quoteRequestsRepository);
const quoteRequestsController = new QuoteRequestsController(quoteRequestsService);
const { getLatestQuoteForCustomer, createQuoteRequest, getAllQuoteRequests, cancelQuoteRequest } =
  quoteRequestsController;

// 고객 견적 요청
router.route('/').post(createAuthMiddleware('customer'), asyncRequestHandler(createQuoteRequest));

// 기사님 전체 견적 요청 조회
router.route('/').get(createAuthMiddleware('mover'), asyncRequestHandler(getAllQuoteRequests));

router.route('/').delete(createAuthMiddleware('customer'), asyncRequestHandler(cancelQuoteRequest));

// 고객 신청한 견적 조회
router.route('/latest').get(asyncRequestHandler(getLatestQuoteForCustomer));

export default router;
