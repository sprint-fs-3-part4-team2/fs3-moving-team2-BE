import express from 'express';
import QuotesService from './service/moverQuotesService';
import prismaClient from '@/prismaClient';
import QuotesRepository from './repository/moverQuotesRepository';
import QuotesController from './controller/moverQuotesController';
import asyncRequestHandler from '../../core/handlers/asyncRequestHandler';
import { createAuthMiddleware } from '../../core/middleware/auth/auth';

const router = express.Router();

const quotesRepository = new QuotesRepository(prismaClient);
const quoteService = new QuotesService(quotesRepository);
const quoteController = new QuotesController(quoteService);
const {
  getQuoteByIdForCustomer,
  getQuoteByIdForMover,
  getQuotesListByMover,
  submitQuoteByMover,
  rejectQuoteByMover,
} = quoteController;

router
  .route('/:quoteId/customer')
  .get(createAuthMiddleware('customer'), asyncRequestHandler(getQuoteByIdForCustomer));
router
  .route('/:quoteId/mover')
  .get(createAuthMiddleware('mover'), asyncRequestHandler(getQuoteByIdForMover));
router
  .route('/submitted')
  .get(createAuthMiddleware('mover'), asyncRequestHandler(getQuotesListByMover));

router.route('/submit').post(asyncRequestHandler(submitQuoteByMover));

router.route('/reject/:quoteId').post(asyncRequestHandler(rejectQuoteByMover));

export default router;
