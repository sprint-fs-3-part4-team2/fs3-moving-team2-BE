import { Request, Response } from 'express';
import QuoteRequestsService from '../service/quoteRequests.service';

export default class QuoteRequestsController {
  constructor(private quoteRequestsService: QuoteRequestsService) {}

  createQuoteRequest = async (req: Request, res: Response) => {
    // 고객인지 확인하는 코드 필요
    // 데이터 유효성 검사 필요
    const customerId = req.user?.roleId ?? '';

    const quoteRequest = await this.quoteRequestsService.createQuoteRequest(customerId, req.body);
    res.status(201).json(quoteRequest);
  };

  getLatestQuoteRequestForCustomer = async (req: Request, res: Response) => {
    const customerId = req.user?.roleId ?? '';
    const quote = await this.quoteRequestsService.getLatestQuoteRequestForCustomer(customerId);

    res.status(200).json(quote);
  };

  getAllQuoteRequests = async (req: Request, res: Response) => {
    const moverId = req.user?.roleId ?? '';

    // query 파라미터로부터 페이지와 페이지 크기 추출, 기본값 설정
    const { page, pageSize, search, moveType, isServiceRegionMatch, isTargetedQuote, sortBy } =
      req.query;

    const numberedPage = page !== undefined ? Number(page) : 1;
    const numberedPageSize = pageSize !== undefined ? Number(pageSize) : 10;
    const searchQuery = search !== undefined ? String(search) : '';
    const moveTypeQuery = moveType !== undefined ? String(moveType) : '';
    const isServiceRegionMatchQuery =
      isServiceRegionMatch !== undefined ? Boolean(isServiceRegionMatch) : false;
    const isTargetedQuoteQuery = isTargetedQuote !== undefined ? Boolean(isTargetedQuote) : false;
    const sortByQuery = sortBy !== undefined ? String(sortBy) : '';

    const data = await this.quoteRequestsService.getAllQuoteRequests(
      numberedPage,
      numberedPageSize,
      searchQuery,
      moveTypeQuery,
      isServiceRegionMatchQuery,
      isTargetedQuoteQuery,
      sortByQuery,
      moverId,
    );
    res.status(200).json(data);
  };

  cancelQuoteRequest = async (req: Request, res: Response) => {
    const customerId = req.user?.roleId ?? '';
    const { quoteRequestId } = req.params;

    await this.quoteRequestsService.cancelQuoteRequestById(customerId, quoteRequestId);
    return res.status(204).end();
  };
}
