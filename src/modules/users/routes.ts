import { Router } from 'express';
import userControlelr from './controller/controller';

const userRouter = Router();

// 기사 - 기본 정보 수정
userRouter.post('/mover/baiscinfo/edit', userControlelr.MoverBaiscInfoEdit);

export default userRouter;
