import { Router } from 'express';
import * as notificationController from './controller/notificationController';
// import { handleSSEConnection } from './controller/sseController';

const router = Router();

// // SSE 연결 엔드포인트
// router.get('/events', handleSSEConnection);

// 알림 조회
router.get('/', notificationController.getNotifications);

// 알림 읽음 업데이트
router.patch('/:id', notificationController.updateToRead);

export default router;
