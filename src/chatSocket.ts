import { Server as HttpServer, IncomingMessage } from 'http';
import { WebSocket, WebSocketServer } from 'ws';

// 현재 연결된 클라이언트들을 추적하는 Set
const clients = new Set<WebSocket>();

export function setupChatSocket(server: HttpServer): void {
  const wss = new WebSocketServer({ noServer: true });

  // 웹소켓 연결 이벤트 처리
  wss.on('connection', (ws: WebSocket, req: IncomingMessage) => {
    console.log('✅ 웹소켓 연결됨:', req.url);
    clients.add(ws); // 클라이언트 목록에 추가

    ws.on('message', (message: string) => {
      console.log('📩 메시지 수신:', message);
      ws.send(`서버 응답: ${message}`);
    });

    ws.on('close', () => {
      console.log('❌ 웹소켓 연결 종료');
      clients.delete(ws); // 클라이언트 목록에서 제거
    });

    ws.on('error', (error) => {
      console.error('🚨 웹소켓 오류 발생:', error);
    });
  });

  // HTTP 업그레이드 요청을 감지하여 /chat 경로에서만 웹소켓 연결 처리
  server.on('upgrade', (request: IncomingMessage, socket, head) => {
    if (request.url === '/chat') {
      wss.handleUpgrade(request, socket, head, (ws: WebSocket) => {
        wss.emit('connection', ws, request);
      });
    } else {
      socket.destroy();
    }
  });

  // 서버가 종료될 때 모든 클라이언트 연결 닫기
  process.on('SIGINT', () => {
    console.log('🛑 서버 종료 중... 모든 웹소켓 연결 닫기');
    clients.forEach((ws) => ws.close());
    process.exit();
  });
}
