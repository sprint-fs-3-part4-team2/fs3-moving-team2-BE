import { Request, Response } from 'express';
import * as reviewService from '../service/reviewService';
import * as completedService from '../service/completedService'; // 이 부분 수정했습니다 확인 부탁드려요

export async function getPendingReviews(req: Request, res: Response) {
  try {
    const pendingReviews = await reviewService.getPendingReviews();
    res.status(200).json(pendingReviews);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: '데이터 조회 실패' });
  }
}

export async function submitReview(req: Request, res: Response) {
  try {
    const { estimateId, rating, comment } = req.body;
    const newReview = await reviewService.createReview({ estimateId, rating, comment });
    res.status(201).json({
      message: '리뷰가 성공적으로 제출되었습니다.',
      data: newReview,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: '리뷰 제출에 실패했습니다.' });
  }
}
