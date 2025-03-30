import { Request, Response, RequestHandler } from 'express';
import { MoverService } from '../service/moverService';
import { PrismaClient } from '@prisma/client';

const moverService = new MoverService();

export class MoverController {
  // 기사님 목록 조회 API
  getMovers: RequestHandler = async (req, res) => {
    try {
      const { sortBy } = req.query;
      const userId = req.user?.userId; // 로그인한 사용자 ID

      // 정렬 옵션 검증
      const validSortOptions = ['reviews', 'rating', 'price', 'experience'];
      const sortOption = (sortBy as string) || 'reviews';

      if (!validSortOptions.includes(sortOption)) {
        res.status(400).json({
          error: '잘못된 정렬 옵션',
          message: '지원하지 않는 정렬 옵션입니다.',
        });
        return;
      }

      const movers = await moverService.getMovers(sortOption, userId);
      res.status(200).json({
        message: '기사님 목록 조회 성공',
        data: movers,
      });
    } catch (error) {
      console.error('기사님 목록 조회 중 오류 발생:', error);
      res.status(500).json({
        error: '서버 오류 발생',
        message: '기사님 목록을 불러오는 중 오류가 발생했습니다.',
      });
    }
  };

  // 검색 API
  searchMovers: RequestHandler = async (req, res) => {
    try {
      const keyword = req.query.keyword as string;
      const userId = req.user?.userId; // 로그인한 사용자 ID

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
      const movers = await moverService.searchMovers(keyword.trim(), userId);

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
  };
}
