import express, { Request, Response } from 'express';
import snsController from '../controller/snsController';

const router = express.Router();

// SNS 로그인 요청을 받아서 리다이렉트 처리하는 엔드포인트
router.get('/api/auth/routes/:provider', (req: Request, res: Response) => {
  snsController.snsLogin(req, res);
});
export default router;
