import { Request, Response } from 'express';
import QuotesService from '../service/quotesService';

export default class QuotesController {
  constructor(private quoteService: QuotesService) {}

  getQuoteByIdForCustomer = async (req: Request, res: Response) => {
    const quoteId = req.params.quoteId;
    const quote = await this.quoteService.getQuoteByIdForCustomer(quoteId);

    res.status(200).json(quote);
  };

  createQuoteRequest = async (req: Request, res: Response) => {
    // 고객인지 확인하는 코드 필요
    // 데이터 유효성 검사 필요
    const customerId = 'cm8e6lmmu0001wsy4r6wsyv1h';

    const quoteRequest = await this.quoteService.createQuoteRequest(customerId, req.body);
    res.status(201).json(quoteRequest);
  };

  getQuoteByIdForMover = async (req: Request, res: Response) => {
    const quoteId = req.params.quoteId;
    const quote = await this.quoteService.getQuoteByIdForMover(quoteId);

    res.status(200).json(quote);
  };

  getQuotesListByMover = async (req: Request, res: Response) => {
    const moverId = req.params.moverId;
    const { page, pageSize } = req.query;
    const numberedPage = page !== undefined ? Number(page) : 1;
    const numberedPageSize = pageSize !== undefined ? Number(pageSize) : 10;

    const data = await this.quoteService.getQuotesListByMover(
      numberedPage,
      numberedPageSize,
      moverId,
    );

    res.status(200).json(data);
  };
}
