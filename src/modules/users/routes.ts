import { NextFunction, Request, Response, Router } from 'express';
import userControlelr from './controller/controller';

const userRouter = Router();

// 기사 - 기본 정보 수정
userRouter.post(
  '/mover/baiscinfo/edit',
  (req: Request, res: Response, next: NextFunction) => {
    // auth 미들웨어
    next();
  },
  userControlelr.MoverBaiscInfoEdit,
);

export default userRouter;
