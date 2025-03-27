import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import swaggerUi from 'swagger-ui-express';
import { swaggerSpec } from './core/docs/swagger';
import imageRouter from './modules/upload/routes';
import userRouter from './modules/users/routes';
import reviewRouter from './modules/reviews/routes';
import moverQuotesRouter from './modules/moverQuotes/routes';
import quoteRequestRouter from './modules/quoteRequests/routes';
import { extractUserMiddleware } from './core/middleware/auth/extractUser';
import favoriteRouter from './modules/favorites/routes';
import authRouter from './modules/auth/routes';
import notificationRouter from './modules/notification/routes';
import rejectionRouter from './modules/rejection/routes';
import profileRouter from './modules/profile/routes';
import targetedQuoteRequestRouter from './modules/targetedQuoteRequest/routes';
import moverRouter from './modules/movers/routes';
import chatRouter from './modules/chat/routes';
import { createServer } from 'http';
import { Server } from 'socket.io';
import ChatIo from './chatSocket';

dotenv.config();

// 환경 변수 설정
const port = process.env.PORT || 8080;
const allowedOrigins: string[] = [
  process.env.DEPLOYED_URL ?? '',
  process.env.LOCALHOST_URL ?? '',
].filter((origin) => origin.trim() !== '');

const app = express();
// 채팅 기능용 소켓
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: allowedOrigins.length > 0 ? allowedOrigins : '*', // 빈 배열 방지
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    credentials: true, // 쿠키 전달 가능하도록 설정 (필요하면 추가)
  },
});
ChatIo(io);

// 미들웨어 설정
app.use(
  cors({
    origin: allowedOrigins,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    credentials: true,
  }),
);
app.use(cookieParser());
app.use(express.json());
app.use(extractUserMiddleware);
app.use(express.urlencoded({ extended: true })); // 필요한거야?  // body-parser 대체
app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec)); // swagger 설정

// 기본 라우터 설정
app.get('/', (req: Request, res: Response) => {
  res.send('<h1>Hello World!</h1>');
});

// 라우터 설정 (여기에 라우터를 추가하세요)
app.use('/upload', imageRouter);
app.use('/users', userRouter);
app.use('/reviews', reviewRouter);
app.use('/mover-quotes', moverQuotesRouter);
app.use('/favorites', favoriteRouter);
app.use('/auth', authRouter);
app.use('/quote-requests', quoteRequestRouter);
app.use('/targeted-quote-requests', targetedQuoteRequestRouter);
app.use('/notification', notificationRouter);
app.use('/rejection', rejectionRouter);
app.use('/profile', profileRouter);
app.use('/movers', moverRouter);
app.use('/chat', chatRouter);

// 서버 실행
server.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});

// 전역 에러 핸들러 설정
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});
