import { Router, Request, Response } from 'express';
import { Pool } from 'pg';
import * as notificationController from './controller/notificationController';

const router = Router();
const clients = new Map<string, Response[]>(); // userId별 SSE 연결 저장

// PostgreSQL 연결 설정
const pool = new Pool({
  connectionString: process.env.DATABASE_URL, // .env에서 DB 정보 가져오기
});

// PostgreSQL LISTEN 이벤트 수신
const startNotificationListener = async () => {
  try {
    const client = await pool.connect();
    console.log('PostgreSQL LISTEN 등록됨');

    client.query('LISTEN new_notification');

    client.on('notification', (msg) => {
      if (msg.channel === 'new_notification') {
        const payload = JSON.parse(msg.payload!);
        const userId = payload.userId;

        // 해당 userId의 클라이언트들에게만 알림 전송
        if (clients.has(userId)) {
          clients.get(userId)?.forEach((res) => {
            res.write(`data: ${JSON.stringify(payload)}\n\n`);
          });
        }
      }
    });

    // 프로세스 종료 시 클라이언트 해제
    process.on('exit', () => {
      client.release();
    });
  } catch (err) {
    console.error('PostgreSQL 연결 실패:', err);
  }
};

startNotificationListener();

// SSE 연결 엔드포인트
router.get('/events', (req: Request, res: Response) => {
  const userId = req.user?.userId;

  if (!userId) {
    res.status(400).send('userId가 필요합니다.');
    return;
  }

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  // userId별로 SSE 연결 저장
  if (!clients.has(userId)) {
    clients.set(userId, []);
  }
  clients.get(userId)?.push(res);

  console.log(
    `새로운 SSE 클라이언트 연결 (유저 ID: ${userId}, 총 ${clients.get(userId)?.length}개 연결)`,
  );

  // 클라이언트가 연결을 끊으면 clients에서 제거
  req.on('close', () => {
    const userClients = clients.get(userId) || [];
    const updatedClients = userClients.filter((clientRes) => clientRes !== res);

    if (updatedClients.length > 0) {
      clients.set(userId, updatedClients);
    } else {
      clients.delete(userId);
    }

    res.end(); // 명확하게 종료
    console.log(
      `SSE 클라이언트 연결 해제 (유저 ID: ${userId}, 남은 연결: ${updatedClients.length})`,
    );
  });
});

// 알림 조회
router.get('/', notificationController.getNotifications);

// 알림 읽음 업데이트
router.patch('/:id', notificationController.updateToRead);

export default router;
