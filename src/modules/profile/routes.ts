import { Router } from 'express';
import * as profileController from './controller/profileController';

const router = Router();

// 고객 프로필 등록
router.post('/user/register', profileController.postCustomerProfileInfo);

// 고객 프로필 수정
router.patch('/user/edit', profileController.patchCustomerProfileInfo);

// 기사 프로필 등록
router.post('/mover/register', profileController.postMoverProfileInfo);

// 기사 프로필 수정
router.patch('/mover/edit', profileController.patchMoverProfileInfo);

export default router;
