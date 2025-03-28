import { Router } from 'express';
import { createAuthMiddleware } from '@/core/middleware/auth/auth';
import { getMoverProfile } from './controller/moverController';
import prismaClient from '@/prismaClient';
import UserService from './service/user.service';
import UserRepository from './repository/user.repository';
import UserController from './controller/user.controller';

const userRouter = Router();

export const userRepository = new UserRepository(prismaClient);
const userService = new UserService(userRepository);
const userController = new UserController(userService);

const { moverBasicInfoEdit } = userController;

// 기사 - 기본 정보 수정
userRouter.post(
  '/mover/baiscinfo/edit',
  //   createAuthMiddleware('mover'),
  moverBasicInfoEdit,
);
userRouter.get('/mover/profile', createAuthMiddleware('mover'), getMoverProfile);

export default userRouter;
