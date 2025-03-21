import { Request, Response } from 'express';
import QuoteRequestsService from '../service/quoteRequests.service';

export default class QuoteRequestsController {
  constructor(private quoteRequestsService: QuoteRequestsService) {}

  createQuoteRequest = async (req: Request, res: Response) => {
    // 고객인지 확인하는 코드 필요
    // 데이터 유효성 검사 필요
    const customerId = 'cm8h58x7b000uws8j7ivn6ihf';

    const quoteRequest = await this.quoteRequestsService.createQuoteRequest(customerId, req.body);
    res.status(201).json(quoteRequest);
  };

  getLatestQuoteForCustomer = async (req: Request, res: Response) => {
    const customerId = 'cm8h58x7b000uws8j7ivn6ihf';
    const quote = await this.quoteRequestsService.getLatestQuoteForCustomer(customerId);

    res.status(200).json(quote);
  };
}
