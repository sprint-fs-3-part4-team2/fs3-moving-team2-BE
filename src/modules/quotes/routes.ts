import express from 'express';
import QuotesService from './service/quotesService';
import prismaClient from '@/prismaClient';
import QuotesRepository from './repository/quotesRepository';
import QuotesController from './controller/quotesController';
import asyncRequestHandler from '../../core/handlers/asyncRequestHandler';
import { createAuthMiddleware } from '../../core/middleware/auth/auth';
import { AUTH_MESSAGES } from '@/constants/authMessages';

const router = express.Router();

const quotesRepository = new QuotesRepository(prismaClient);
const quoteService = new QuotesService(quotesRepository);
const quoteController = new QuotesController(quoteService);
const { getQuoteByIdForCustomer, getQuoteByIdForMover, getQuotesListByMover, createQuoteRequest } =
  quoteController;

router.route('/request').post(asyncRequestHandler(createQuoteRequest));
router
  .route('/:quoteId/customer')
  .get(createAuthMiddleware('customer'), asyncRequestHandler(getQuoteByIdForCustomer));
router
  .route('/:quoteId/mover')
  .get(createAuthMiddleware('mover'), asyncRequestHandler(getQuoteByIdForMover));
router
  .route('/submitted')
  .get(createAuthMiddleware('mover'), asyncRequestHandler(getQuotesListByMover));

export default router;
