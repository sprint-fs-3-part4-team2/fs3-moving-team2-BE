import express from 'express';
import * as quoteController from './controller/userQuotesController';
import { createAuthMiddleware } from '@/core/middleware/auth/auth';
import asyncRequestHandler from '@/core/handlers/asyncRequestHandler';

const router = express.Router();

// 대기 중인 견적 목록 조회 API
router.get(
  '/pending-quotes',
  createAuthMiddleware('customer'),
  asyncRequestHandler(quoteController.getPendingQuotes),
);

// 견적 확정 API
router.post(
  '/confirm-quote',
  createAuthMiddleware('customer'),
  asyncRequestHandler(quoteController.confirmQuote),
);

export default router;
