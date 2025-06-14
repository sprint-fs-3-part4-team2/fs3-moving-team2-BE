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
      const userId = req.userInfo?.userId;

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
      const userId = req.userInfo?.userId;

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

  // 기사님 상세 정보 조회 API
  getMoverById: RequestHandler = async (req, res) => {
    try {
      const { id } = req.params;
      const userId = req.userInfo?.userId;

      if (!id) {
        res.status(400).json({
          error: '잘못된 요청',
          message: '기사 ID가 필요합니다.',
        });
        return;
      }

      const mover = await moverService.getMoverById(id, userId);

      if (!mover) {
        res.status(404).json({
          error: '찾을 수 없음',
          message: '해당 기사를 찾을 수 없습니다.',
        });
        return;
      }

      res.status(200).json({
        message: '기사 상세 정보 조회 성공',
        data: mover,
      });
    } catch (error) {
      console.error('기사 상세 정보 조회 중 오류 발생:', error);
      res.status(500).json({
        error: '서버 오류 발생',
        message: '기사 상세 정보를 불러오는 중 오류가 발생했습니다.',
      });
    }
  };

  // 기사님 리뷰 목록 조회 API
  getMoverReviews: RequestHandler = async (req, res) => {
    try {
      const { id } = req.params;
      const { page = '1', limit = '5' } = req.query;

      if (!id) {
        res.status(400).json({
          error: '잘못된 요청',
          message: '기사 ID가 필요합니다.',
        });
        return;
      }

      const pageNum = parseInt(page as string);
      const limitNum = parseInt(limit as string);

      if (isNaN(pageNum) || isNaN(limitNum) || pageNum < 1 || limitNum < 1) {
        res.status(400).json({
          error: '잘못된 요청',
          message: '페이지와 페이지당 항목 수는 1 이상이어야 합니다.',
        });
        return;
      }

      const reviews = await moverService.getMoverReviews(id, pageNum, limitNum);

      res.status(200).json({
        message: '기사 리뷰 목록 조회 성공',
        data: reviews,
      });
    } catch (error) {
      console.error('기사 리뷰 목록 조회 중 오류 발생:', error);
      res.status(500).json({
        error: '서버 오류 발생',
        message: '기사 리뷰 목록을 불러오는 중 오류가 발생했습니다.',
      });
    }
  };
}
