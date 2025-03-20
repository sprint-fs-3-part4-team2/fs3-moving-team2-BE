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

// 고정 경로를 먼저 선언
router.route('/request').post(asyncRequestHandler(quoteController.createQuoteRequest));

// 가장 마지막에 파라미터 라우팅을 선언
router.route('/:quoteId').get(asyncRequestHandler(quoteController.getQuoteByIdForCustomer));

export default router;
