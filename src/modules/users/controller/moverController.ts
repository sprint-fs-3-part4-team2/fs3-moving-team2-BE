import { Request, Response } from 'express';
import * as moverService from '../service/moverService';

export async function getMovers(req: Request, res: Response) {
  try {
    const movers = await moverService.getMovers();
    res.status(200).json(movers);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: '기사님 정보 조회에 실패했습니다.' });
  }
}
