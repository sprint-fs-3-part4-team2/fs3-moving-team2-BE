import { Request, Response } from 'express';
import QuoteRequestsService from '../service/quoteRequests.service';

export default class QuoteRequestsController {
  constructor(private quoteRequestsService: QuoteRequestsService) {}

  createQuoteRequest = async (req: Request, res: Response) => {
    // 고객인지 확인하는 코드 필요
    // 데이터 유효성 검사 필요
    const customerId = 'cm8h58x7b000uws8j7ivn6ihf';

    const quoteRequest = await this.quoteRequestsService.createQuoteRequest(customerId, req.body);
    return res.status(201).json(quoteRequest);
  };

  getLatestQuoteRequestForCustomer = async (req: Request, res: Response) => {
    const customerId = 'cm8h58x7b000uws8j7ivn6ihf';
    const quote = await this.quoteRequestsService.getLatestQuoteRequestForCustomer(customerId);

    res.status(200).json(quote);
  };

  getAllQuoteRequests = async (req: Request, res: Response) => {
    // query 파라미터로부터 페이지와 페이지 크기 추출, 기본값 설정
    const { page, pageSize } = req.query;
    const numberedPage = page !== undefined ? Number(page) : 1;
    const numberedPageSize = pageSize !== undefined ? Number(pageSize) : 10;

    const data = await this.quoteRequestsService.getAllQuoteRequests(
      numberedPage,
      numberedPageSize,
    );
    res.status(200).json(data);
  };
}
