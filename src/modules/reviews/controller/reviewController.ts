import { RequestHandler } from 'express';
import * as reviewService from '../service/reviewService';

export const getPendingReviews: RequestHandler = async (req, res) => {
  // const userId = req.user?.userId;
  const userId = 'cm8drul0h0000wam0p9an4cv2';
  if (!userId) {
    res.status(401).json({ message: '로그인 필요' });
    return;
  }
  try {
    const pendingReviews = await reviewService.getPendingReviews(userId);
    res.status(200).json(pendingReviews);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: '데이터 조회 실패' });
  }
};

export const submitReview: RequestHandler = async (req, res) => {
  // const userId = req.user?.userId;
  const userId = 'cm8drul0h0000wam0p9an4cv2';
  if (!userId) {
    res.status(401).json({ message: '로그인 필요' });
    return;
  }
  try {
    const { estimateId, rating, comment } = req.body;
    const newReview = await reviewService.createReview({ userId, estimateId, rating, comment });
    res.status(201).json({
      message: '리뷰가 성공적으로 제출되었습니다.',
      data: newReview,
    });
  } catch (error: unknown) {
    console.error(error);
    const errorMessage = error instanceof Error ? error.message : '알 수 없는 에러';
    res.status(errorMessage === '해당 견적에 대한 리뷰 작성 권한이 없습니다.' ? 403 : 500).json({
      error: errorMessage || '리뷰 제출에 실패했습니다.',
    });
  }
};
