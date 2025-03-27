import asyncRequestHandler from '@/core/handlers/asyncRequestHandler';
import express from 'express';
import prismaClient from '@/prismaClient';
import TargetedQuoteRequestService from './service/targetedQuoteRequest.service';
import TargetedQuoteRequestRepository from './repository/targetedQuoteRequest.repository';
import TargetedQuoteRejectionRepository from './repository/targetedQuoteRejection.repository';
import TargetedQuoteRequestController from './controller/targetedQuoteRequest.controller';
import QuoteRequestsRepository from '../quoteRequests/repository/quoteRequests.repository';

const router = express.Router();

const targetedQuoteRejectionRepository = new TargetedQuoteRejectionRepository(prismaClient);
const targetedQuoteRequestRepository = new TargetedQuoteRequestRepository(
  prismaClient,
  targetedQuoteRejectionRepository,
);
const quoteRequestsRepository = new QuoteRequestsRepository(prismaClient);

const targetedQuoteRequestService = new TargetedQuoteRequestService(
  prismaClient,
  targetedQuoteRequestRepository,
  targetedQuoteRejectionRepository,
  quoteRequestsRepository,
);

const targetedQuoteRequestController = new TargetedQuoteRequestController(
  targetedQuoteRequestService,
);
const { rejectQuoteByMover } = targetedQuoteRequestController;

router.route('/reject/:quoteId').post(asyncRequestHandler(rejectQuoteByMover));

export default router;
