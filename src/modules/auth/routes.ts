import express from 'express';
import AuthService from './service/service';
import AuthController from './controller/controller';
import asyncRequestHandler from '@/core/handlers/asyncRequestHandler';

const router = express.Router();

const authService = new AuthService();
const authController = new AuthController(authService);

const { fakeSignIn, snsLogin } = authController;

router.route('/fakeSignIn').get(asyncRequestHandler(fakeSignIn));
router.route('/:provider').get(asyncRequestHandler(snsLogin));

export default router;
