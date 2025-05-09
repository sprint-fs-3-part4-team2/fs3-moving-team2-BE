import { Request, Response } from 'express';
import TargetedQuoteRequestService from '../service/targetedQuoteRequest.service';

export default class TargetedQuoteRequestController {
  constructor(private targetedQuoteRequestService: TargetedQuoteRequestService) {}

  createTargetedQuoteRequest = async (req: Request, res: Response) => {
    const customerId = req.userInfo?.roleId ?? '';
    const { moverId } = req.body;

    if (!customerId) {
      return res.status(400).json({ error: 'Customer ID is required' });
    }

    if (!moverId) {
      return res.status(400).json({ error: 'Mover ID is required' });
    }

    const result = await this.targetedQuoteRequestService.createTargetedQuoteRequest(
      customerId,
      moverId,
    );

    return res.status(201).json(result);
  };

  rejectQuoteByMover = async (req: Request, res: Response) => {
    const moverId = req.userInfo?.roleId ?? '';
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
