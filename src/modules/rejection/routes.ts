import { Router } from 'express';
// import { createRejection } from './controller/creationController';
import { getRejectedQuotes } from './controller/getController';

const router = Router();

// router.post('/반려생성관련_엔드포인트', createRejection);
router.get('/rejected-quotes', getRejectedQuotes);

export default router;
