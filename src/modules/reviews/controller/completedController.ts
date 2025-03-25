import { Request, Response } from 'express';
import getReviewsByUserId from '../service/completedService';

export async function getSubmittedReviews(req: Request, res: Response) {
  const { id } = req.params;
  console.log(id);
  try {
    const submittedReviews = await getReviewsByUserId(id);
    res.status(200).json(submittedReviews);
    // console.log(getSubmittedReviews);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: '리뷰 조회에 실패했습니다.' });
  }
}
