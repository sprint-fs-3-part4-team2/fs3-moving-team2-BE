import express from 'express';
import QuotesService from './service/quotesService';
import prismaClient from '@/prismaClient';
import QuotesRepository from './repository/quotesRepository';
import QuotesController from './controller/quotesController';
import asyncRequestHandler from '../../core/handlers/asyncRequestHandler';

const router = express.Router();

const quotesRepository = new QuotesRepository(prismaClient);
const quoteService = new QuotesService(quotesRepository);
const quoteController = new QuotesController(quoteService);

const { getQuoteByIdForCustomer, getQuoteByIdForMover } = quoteController;

router.route('/:quoteId/customer').get(asyncRequestHandler(getQuoteByIdForCustomer));
router.route('/:quoteId/mover').get(asyncRequestHandler(getQuoteByIdForMover));

export default router;
