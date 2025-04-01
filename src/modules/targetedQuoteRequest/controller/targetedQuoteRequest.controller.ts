import { Request, Response } from 'express';
import TargetedQuoteRequestService from '../service/targetedQuoteRequest.service';

export default class TargetedQuoteRequestController {
  constructor(private targetedQuoteRequestService: TargetedQuoteRequestService) {}

  createTargetedQuoteRequest = async (req: Request, res: Response) => {
    // 테스트용 하드코딩 ID
    const customerId = 'cm8x9599b00016eysge93owzb'; // 테스트용 고객 ID
    const { quoteId, moverId } = req.body;

    console.log('테스트 요청 데이터:', {
      customerId,
      quoteId,
      moverId,
    });

    const result = await this.targetedQuoteRequestService.createTargetedQuoteRequest(
      quoteId,
      customerId,
      moverId,
    );

    return res.status(201).json(result);
  };

  rejectQuoteByMover = async (req: Request, res: Response) => {
    const moverId = req.user?.roleId ?? '';
    const quoteId = req.params.quoteId;
    const rejectionReason = req.body.rejectionReason;

    const rejectQuote = await this.targetedQuoteRequestService.rejectQuoteByMover(
      quoteId,
      moverId,
      rejectionReason,
    );

    res.status(201).json(rejectQuote);
  };
}
