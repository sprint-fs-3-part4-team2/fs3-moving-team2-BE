import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import swaggerUi from 'swagger-ui-express';
import { swaggerSpec } from './core/docs/swagger';
import imageRouter from './modules/upload/routes';
import userRouter from './modules/users/routes';
import reviewRouter from './modules/reviews/routes';
import quotesRouter from './modules/quotes/routes';
import { extractUserMiddleware } from './core/middleware/auth/extractUser';
import favoriteRouter from './modules/favorites/routes';
import authRouter from './modules/auth/routes';
import profileRouter from './modules/profile/routes';

dotenv.config();

// 환경 변수 설정
const port = process.env.PORT || 8080;
const allowedOrigins: string[] = [
  process.env.DEPLOYED_URL ?? '',
  process.env.LOCALHOST_URL ?? '',
].filter((origin) => origin.trim() !== '');

const app = express();

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
app.use('/quotes', quotesRouter);
app.use('/favorites', favoriteRouter);
app.use('/auth', authRouter);
app.use('/profile', profileRouter);

// 서버 실행
app.listen(port, () => {
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
