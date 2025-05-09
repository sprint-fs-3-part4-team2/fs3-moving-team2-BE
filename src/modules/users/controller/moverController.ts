import { Request, Response } from 'express';
import { getMoverProfileDetail } from '../service/moverService';

export async function getMoverProfile(req: Request, res: Response) {
  const userId = req?.userInfo?.userId ?? '';
  try {
    const moverProfile = await getMoverProfileDetail(userId);
    res.status(200).json(moverProfile);
    return;
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: '기사 정보를 불러오는 중 오류가 발생했습니다.' });
  }
}
