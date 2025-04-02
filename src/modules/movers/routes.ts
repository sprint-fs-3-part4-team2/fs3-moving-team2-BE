import { Router } from 'express';
import { MoverController } from './controller/moverController';

const router = Router();
const moverController = new MoverController();

// 기사님 목록 조회
router.get('/', moverController.getMovers);

// 기사님 검색
router.get('/search', moverController.searchMovers);

// 기사님 상세 정보 조회
router.get('/:id', moverController.getMoverById);

export default router;
