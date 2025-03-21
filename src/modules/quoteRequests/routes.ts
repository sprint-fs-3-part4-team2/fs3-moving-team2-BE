import express from 'express';
import QuoteRequestsRepository from './repository/quoteRequests.repository';
import prismaClient from '@/prismaClient';
import QuoteRequestsService from './service/quoteRequests.service';
import QuoteRequestsController from './controller/quoteRequests.controller';
import asyncRequestHandler from '@/core/handlers/asyncRequestHandler';

const router = express.Router();

const quoteRequestsRepository = new QuoteRequestsRepository(prismaClient);
const quoteRequestsService = new QuoteRequestsService(quoteRequestsRepository);
const quoteRequestsController = new QuoteRequestsController(quoteRequestsService);
const { getLatestQuoteForCustomer, createQuoteRequest } = quoteRequestsController;

router.route('/').post(asyncRequestHandler(createQuoteRequest));
router.route('/latest').get(asyncRequestHandler(getLatestQuoteForCustomer));

export default router;
