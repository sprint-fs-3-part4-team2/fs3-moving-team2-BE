import { Router } from 'express';
import { MoverController } from './controller/moverController';

const router = Router();
const moverController = new MoverController();

// 기사님 목록 조회
router.get('/', moverController.getMovers);

// 지역 목록 조회
router.get('/regions', moverController.getRegions);

// 서비스 목록 조회
router.get('/service', moverController.getServices);

// 기사님 검색
router.get('/search', moverController.searchMovers);

export default router;
