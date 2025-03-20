import { Router } from 'express';
import * as notificationController from './controller/notificationController';

const router = Router();

// 알람 조회
router.get('/', notificationController.getNotifications);

// 알람 읽음 업데이트
router.patch('/read/:id', notificationController.updateToRead);

// 오늘 알림만 조회
// router.get('/today');

export default router;
