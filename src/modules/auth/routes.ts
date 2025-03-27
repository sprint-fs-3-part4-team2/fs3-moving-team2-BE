import express from 'express';
import AuthService from './service/service';
import AuthController from './controller/controller';
import asyncRequestHandler from '@/core/handlers/asyncRequestHandler';
import { userRepository } from '../users/routes';
import { validateBody } from '@/core/middleware/validate';
import { signInRequestStruct, SignUpRequestStruct } from '@/structs/authStruct';

const router = express.Router();

const authService = new AuthService(userRepository);
const authController = new AuthController(authService);

const { snsLogin, signIn, signUp, fakeSignIn } = authController;

router.route('/fakeSignIn').get(asyncRequestHandler(fakeSignIn));
router.route('/:provider').get(asyncRequestHandler(snsLogin));
router
  .route('/sign-in/:userType')
  .post(validateBody(signInRequestStruct), asyncRequestHandler(signIn));
router
  .route('/sign-up/:userType')
  .post(validateBody(SignUpRequestStruct), asyncRequestHandler(signUp));

export default router;
