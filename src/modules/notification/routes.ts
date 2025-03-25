import { Router } from 'express';
import * as notificationController from './controller/notificationController';

const router = Router();

// 알람 조회
router.get('/', notificationController.getNotifications);

// 알람 읽음 업데이트
router.patch('/:id', notificationController.updateToRead);

// // 알람 보내기(알람 목록 추가)
// router.post('/:userId', notificationController.createNotification);

export default router;
