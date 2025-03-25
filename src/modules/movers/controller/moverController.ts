import { Request, Response } from 'express';
import { MoverService } from '../service/moverService';

const moverService = new MoverService();

export class MoverController {
  // 기사님 목록 조회 API
  async getMovers(req: Request, res: Response) {
    try {
      const { sortBy } = req.query;
      const movers = await moverService.getMovers(sortBy as string);
      res.json(movers);
    } catch (error) {
      res.status(500).json({ error: '서버 오류 발생' });
    }
  }

  // 검색 API
  async searchMovers(req: Request, res: Response) {
    try {
      const { keyword } = req.query;
      if (!keyword) {
        return res.status(400).json({ error: '검색어를 입력하세요.' });
      }

      const movers = await moverService.searchMovers(keyword as string);
      res.json(movers);
    } catch (error) {
      res.status(500).json({ error: '서버 오류 발생' });
    }
  }
}
