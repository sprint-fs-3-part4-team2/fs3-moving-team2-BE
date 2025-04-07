import express from 'express';
import * as quoteListController from './controller/quoteListController';
import { createAuthMiddleware } from '@/core/middleware/auth/auth';
import asyncRequestHandler from '@/core/handlers/asyncRequestHandler';

const router = express.Router();

// 내 견적요청 목록 조회 API
router.get(
  '/quote-customer-requests',
  createAuthMiddleware('customer'),
  asyncRequestHandler(quoteListController.getQuoteRequests),
);

// 기사님에게 받은 견적 목록 조회 API
router.get(
  '/quotes-from-drivers/:quoteRequestId',
  createAuthMiddleware('customer'),
  asyncRequestHandler(quoteListController.getQuotesFromDrivers),
);

export default router;
