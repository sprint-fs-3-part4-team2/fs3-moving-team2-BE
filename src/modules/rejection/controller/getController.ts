import { RequestHandler } from 'express';
import { getRejectedTargetedQuoteRequestsByMover } from '../service/getService';

export const getRejectedQuotes: RequestHandler = async (req, res) => {
  const userId = req.user?.userId;
  if (!userId) {
    res.status(401).json({ message: '로그인 필요' });
    return;
  }
  try {
    const rejectedQuotes = await getRejectedTargetedQuoteRequestsByMover(userId);
    res.status(200).json(rejectedQuotes);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: '서버 오류 발생' });
  }
};
