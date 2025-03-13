import { Request, Response } from 'express';
import * as reviewService from '../service/reviewService';

export async function getPendingReviews(req: Request, res: Response) {
  try {
    const pendingReviews = await reviewService.getPendingReviews();
    res.status(200).json(pendingReviews);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: '데이터 조회 실패' });
  }
}
