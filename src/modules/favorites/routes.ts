import express from 'express';
import {
  getFavorites,
  addFavorite,
  removeFavorite,
  checkFavoriteStatus,
} from './controller/favoriteController';
import { createAuthMiddleware } from '@/core/middleware/auth/auth';
import asyncRequestHandler from '@/core/handlers/asyncRequestHandler';

const router = express.Router();

// 찜한 목록 조회 (GET 요청 추가)
router.get('/', createAuthMiddleware('customer'), asyncRequestHandler(getFavorites));
// 찜하기 추가
router.post('/create/:moverId', createAuthMiddleware('customer'), asyncRequestHandler(addFavorite));
// 찜하기 취소
router.delete(
  '/delete/:moverId',
  createAuthMiddleware('customer'),
  asyncRequestHandler(removeFavorite),
);
// 찜하기 상태 확인
router.get(
  '/check/:moverId',
  createAuthMiddleware('customer'),
  asyncRequestHandler(checkFavoriteStatus),
);

export default router;
