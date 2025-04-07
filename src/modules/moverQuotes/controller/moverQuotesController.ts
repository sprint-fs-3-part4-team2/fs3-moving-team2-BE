import { Request, Response } from 'express';
import QuotesService from '../service/moverQuotesService';

export default class QuotesController {
  constructor(private quoteService: QuotesService) {}

  getQuoteByIdForCustomer = async (req: Request, res: Response) => {
    const quoteId = req.params.quoteId;
    const quote = await this.quoteService.getQuoteByIdForCustomer(quoteId);

    res.status(200).json(quote);
  };

  getQuoteByIdForMover = async (req: Request, res: Response) => {
    const quoteId = req.params.quoteId;
    const quote = await this.quoteService.getQuoteByIdForMover(quoteId);

    res.status(200).json(quote);
  };

  getQuotesListByMover = async (req: Request, res: Response) => {
    const moverId = req.user?.roleId ?? '';
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

  submitQuoteByMover = async (req: Request, res: Response) => {
    const moverId = req.user?.roleId ?? '';
    const quoteId = req.params.quoteId;
    const price = req.body.price;
    const comment = req.body.comment;

    console.log('test', quoteId, price, comment);

    const quote = await this.quoteService.submitQuoteByMover(quoteId, moverId, price, comment);

    res.status(201).json(quote);
  };
}
