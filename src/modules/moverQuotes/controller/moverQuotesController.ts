import { Request, Response } from 'express';
import QuotesService from '../service/moverQuotesService';

export default class QuotesController {
  constructor(private quoteService: QuotesService) {}

  getQuoteByIdForCustomer = async (req: Request, res: Response) => {
    const userId = req.user?.userId ?? '';
    const quoteId = req.params.quoteId;
    const quote = await this.quoteService.getQuoteByIdForCustomer(quoteId, userId);

    res.status(200).json(quote);
  };

  getQuoteByIdForMover = async (req: Request, res: Response) => {
    const moverId = req.user?.userId ?? '';
    const quoteId = req.params.quoteId;
    const quote = await this.quoteService.getQuoteByIdForMover(quoteId, moverId);

    res.status(200).json(quote);
  };

  getQuotesListByMover = async (req: Request, res: Response) => {
    const moverId = req.user?.userId ?? '';
    const { page, pageSize } = req.query;
    const numberedPage = page !== undefined ? Number(page) : 1;
    const numberedPageSize = pageSize !== undefined ? Number(pageSize) : 4;

    const data = await this.quoteService.getQuotesListByMover(
      numberedPage,
      numberedPageSize,
      moverId,
    );

    res.status(200).json(data);
  };
}
