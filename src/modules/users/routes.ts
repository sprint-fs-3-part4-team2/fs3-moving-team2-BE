import { Router } from 'express';
import userControlelr from './controller/controller';
import { createAuthMiddleware } from '@/core/middleware/auth/auth';
import { getMoverProfile } from './controller/moverController';
const userRouter = Router();

// 기사 - 기본 정보 수정
userRouter.post(
  '/mover/baiscinfo/edit',
  createAuthMiddleware('mover'),
  userControlelr.MoverBaiscInfoEdit,
);
userRouter.get('/mover/profile/:id', createAuthMiddleware('mover'), getMoverProfile);

export default userRouter;
