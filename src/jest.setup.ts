import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';

// 테스트 환경에서는 .env.test 파일을 사용
dotenv.config({ path: '.env.test' });

export const prismaTestClient = new PrismaClient();

beforeAll(async () => {
  await prismaTestClient.$connect();
});

afterAll(async () => {
  await prismaTestClient.$disconnect();
});
