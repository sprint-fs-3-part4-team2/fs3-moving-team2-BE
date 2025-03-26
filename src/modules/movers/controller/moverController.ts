import { Request, Response } from 'express';
import { MoverService } from '../service/moverService';
import { PrismaClient } from '@prisma/client';

const moverService = new MoverService();
const prisma = new PrismaClient();

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

  // 지역 목록 조회
  async getRegions(req: Request, res: Response) {
    try {
      console.log('📌 지역 목록 API 호출됨');
      const regions = await prisma.moverServiceRegion.findMany({
        select: { region: true },
      });
      console.log('✅ 조회된 지역 목록:', regions);
      res.json(regions.map((r) => r.region));
    } catch (error) {
      console.error('❌ 지역 목록 조회 실패:', error);
      res.status(500).json({ error: '서버 오류 발생' });
    }
  }

  // 서비스 목록 조회
  async getServices(req: Request, res: Response) {
    try {
      const services = await prisma.moverService.findMany({
        select: { serviceType: true },
      });
      res.json(services.map((s) => s.serviceType));
    } catch (error) {
      res.status(500).json({ error: '서버 오류 발생' });
    }
  }

  // 검색 API
  async searchMovers(req: Request, res: Response): Promise<void> {
    try {
      const keyword = req.query.keyword as string;

      // 검색어 길이 검증 추가
      if (!keyword || keyword.trim().length === 0) {
        res.status(400).json({
          error: '검색어를 입력하세요.',
          message: '최소 1자 이상의 검색어가 필요합니다.',
        });
        return;
      }

      // 검색어 길이 제한 (옵션)
      if (keyword.length > 30) {
        res.status(400).json({
          error: '검색어가 너무 깁니다.',
          message: '검색어는 30자 이내로 입력해주세요.',
        });
        return;
      }

      // 서비스 레이어 검색 메서드 호출
      const movers = await moverService.searchMovers(keyword.trim());

      // 검색 결과 없을 때 처리
      if (!movers || movers.length === 0) {
        res.status(404).json({
          error: '검색 결과 없음',
          message: '해당 검색어에 대한 결과가 없습니다.',
        });
        return;
      }

      // 성공 응답
      res.status(200).json({
        message: `${movers.length}건의 검색 결과`,
        data: movers,
      });
    } catch (error) {
      // 에러 로깅 및 상세 에러 응답
      console.error('검색 중 오류 발생:', error);
      res.status(500).json({
        error: '서버 오류 발생',
        message: '검색 중 예상치 못한 오류가 발생했습니다.',
      });
    }
  }
}
