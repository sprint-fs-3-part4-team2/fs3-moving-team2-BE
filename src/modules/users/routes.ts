import { Router } from 'express';
import { createAuthMiddleware } from '@/core/middleware/auth/auth';
import UserRepository from './repository/user.repository';
import prismaClient from '@/prismaClient';
import UserService from './service/user.service';
import UserController from './controller/user.controller';

const userRouter = Router();

export const userRepository = new UserRepository(prismaClient);
const userService = new UserService(userRepository);
const userController = new UserController(userService);

const { moverBasicInfoEdit } = userController;

// 기사 - 기본 정보 수정
userRouter.post('/mover/baiscinfo/edit', createAuthMiddleware('mover'), moverBasicInfoEdit);

export default userRouter;
