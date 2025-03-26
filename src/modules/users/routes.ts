import { Router } from 'express';
import userControlelr from './controller/controller';
import { createAuthMiddleware } from '@/core/middleware/auth/auth';

const userRouter = Router();

// 기사 - 기본 정보 수정
userRouter.post(
  '/mover/info/edit',
  // createAuthMiddleware('mover'),
  userControlelr.MoverBaiscInfoEdit,
);

export default userRouter;
