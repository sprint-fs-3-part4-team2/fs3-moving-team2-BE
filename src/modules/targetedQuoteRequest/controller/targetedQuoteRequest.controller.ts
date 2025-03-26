import { Request, Response } from 'express';
import TargetedQuoteRequestService from '../service/targetedQuoteRequest.service';

export default class TargetedQuoteRequestController {
  constructor(private targetedQuoteRequestService: TargetedQuoteRequestService) {}

  rejectQuoteByMover = async (req: Request, res: Response) => {
    const moverId = 'cm8p9c6sa005iwsm9fikr4asm';
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
