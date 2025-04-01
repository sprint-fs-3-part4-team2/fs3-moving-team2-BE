import { Response } from 'express';
import { Pool } from 'pg';

const clients = new Map<string, Response[]>(); // userId별 SSE 연결 저장

// PostgreSQL 연결 설정
const pool = new Pool({
  connectionString: process.env.DATABASE_URL, // .env에서 DB 정보 가져오기
  ssl: {
    rejectUnauthorized: false, // SSL 연결 허용 (Render에서 필수)
  },
  idleTimeoutMillis: 30000, // 30초 후 유휴 연결 해제
  connectionTimeoutMillis: 5000, // 5초 안에 연결되지 않으면 에러
});
// 주기적으로 DB 연결 유지 (매 10초마다)
setInterval(async () => {
  try {
    const client = await pool.connect();
    await client.query('SELECT 1'); // 연결 유지
    client.release();
  } catch (err) {
    console.error('PostgreSQL Keep-Alive 실패:', err);
  }
}, 10000); // 10초마다 실행

// PostgreSQL LISTEN 이벤트 수신
export const startNotificationListener = async () => {
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

// SSE 연결 엔드포인트
export const handleSSEConnection = (req: any, res: Response) => {
  const userId = req.user?.userId || 'cm8r03ll90000iuux1x0r69ce';

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
};
