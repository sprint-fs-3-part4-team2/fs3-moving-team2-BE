import { Router } from 'express';
import { MoverController } from './controller/moverController';

const router = Router();
const moverController = new MoverController();

// 기사님 목록 조회
router.get('/', (req, res) => moverController.getMovers(req, res));

// 기사님 검색
router.get('/search', async (req, res) => await moverController.searchMovers(req, res));

export default router;
