import { Request, Response, RequestHandler } from 'express';
import { MoverService } from '../service/moverService';
import { PrismaClient } from '@prisma/client';
import { Prisma } from '@prisma/client';

const moverService = new MoverService();

export class MoverController {
  // 기사님 목록 조회 API
  getMovers: RequestHandler = async (req, res) => {
    try {
      const { sortBy, area, service } = req.query;
      const userId = req.user?.userId;

      // 정렬 옵션 검증
      const validSortOptions = ['reviews', 'rating', 'confirmed', 'experience'];
      const sortOption = (sortBy as string) || 'reviews';

      if (!validSortOptions.includes(sortOption)) {
        res.status(400).json({
          error: '잘못된 정렬 옵션',
          message: '지원하지 않는 정렬 옵션입니다.',
        });
        return;
      }

      // area와 service 파라미터 검증
      if (area && typeof area !== 'string') {
        res.status(400).json({
          error: '잘못된 지역 파라미터',
          message: '지역 파라미터는 문자열이어야 합니다.',
        });
        return;
      }

      if (service && typeof service !== 'string') {
        res.status(400).json({
          error: '잘못된 서비스 파라미터',
          message: '서비스 파라미터는 문자열이어야 합니다.',
        });
        return;
      }

      const movers = await moverService.getMovers(
        sortOption,
        userId,
        area as string,
        service as string,
      );

      res.status(200).json({
        message: '기사님 목록 조회 성공',
        data: movers,
      });
    } catch (error) {
      console.error('기사님 목록 조회 중 오류 발생:', error);

      // Prisma 에러 처리
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        res.status(400).json({
          error: '데이터베이스 오류',
          message: '잘못된 파라미터가 전달되었습니다.',
        });
        return;
      }

      res.status(500).json({
        error: '서버 오류 발생',
        message: '기사님 목록을 불러오는 중 오류가 발생했습니다.',
      });
    }
  };

  // 기사님 검색 API
  searchMovers: RequestHandler = async (req, res) => {
    try {
      const { keyword } = req.query;
      const userId = req.user?.userId;

      if (!keyword || typeof keyword !== 'string' || keyword.trim().length < 2) {
        res.status(400).json({
          error: '잘못된 검색어',
          message: '검색어는 2자 이상이어야 합니다.',
        });
        return;
      }

      const movers = await moverService.searchMovers(keyword.trim(), userId);

      res.status(200).json({
        message: '기사님 검색 성공',
        data: movers,
      });
    } catch (error) {
      console.error('기사님 검색 중 오류 발생:', error);
      res.status(500).json({
        error: '서버 오류 발생',
        message: '기사님 검색 중 오류가 발생했습니다.',
      });
    }
  };
}
