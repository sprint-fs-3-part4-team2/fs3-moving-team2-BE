import { Request, Response } from 'express';
import TargetedQuoteRequestService from '../service/targetedQuoteRequest.service';

export default class TargetedQuoteRequestController {
  constructor(private targetedQuoteRequestService: TargetedQuoteRequestService) {}

  rejectQuoteByMover = async (req: Request, res: Response) => {
    const moverId = req.user?.roleId ?? '';
    const quoteId = req.params.quoteId;
    const rejectionReason = req.body.rejectionReason;

    if (!moverId) {
      return res.status(400).json({ error: 'Mover ID is required' });
    }

    const rejectQuote = await this.targetedQuoteRequestService.rejectQuoteByMover(
      quoteId,
      moverId,
      rejectionReason,
    );

    res.status(201).json(rejectQuote);
  };
}
