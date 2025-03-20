import express from 'express';
import { getFavorites, addFavorite, removeFavorite } from './controller/favoriteController';

const router = express.Router();

// 찜한 목록 조회 (GET 요청 추가)
router.get('/', getFavorites);
// 찜하기 추가
router.post('/create', addFavorite);
// 찜하기 취소
router.delete('/delete', removeFavorite);

export default router;
