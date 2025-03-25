import { Request, Response } from 'express';
import { getMoverReviews } from '../service/moverReview';

export async function getMoverSubmittedReviews(req: Request, res: Response) {
  const userId = req?.user?.userId ?? '';

  console.log(userId);
  try {
    const submittedMoverReviews = await getMoverReviews(userId);
    res.status(200).json(submittedMoverReviews);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: '리뷰 조회에 실패했습니다.' });
  }
}
