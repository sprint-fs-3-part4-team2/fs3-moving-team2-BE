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

const { snsLogin, signIn, signUp, signOut, refreshToken, fakeSignIn, oAuthCallback } =
  authController;

router.route('/fakeSignIn').get(asyncRequestHandler(fakeSignIn));
router.route('/sign-out').post(asyncRequestHandler(signOut));
router.route('/refresh-token').post(asyncRequestHandler(refreshToken));

router.route('/:provider').get(asyncRequestHandler(snsLogin));

router
  .route('/sign-in/:userType')
  .post(validateBody(signInRequestStruct), asyncRequestHandler(signIn));
router
  .route('/sign-up/:userType')
  .post(validateBody(SignUpRequestStruct), asyncRequestHandler(signUp));
router.route('/callback/:provider').get(asyncRequestHandler(oAuthCallback));

export default router;
