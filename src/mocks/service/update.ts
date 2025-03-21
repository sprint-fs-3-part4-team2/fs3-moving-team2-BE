/* eslint-disable @typescript-eslint/no-explicit-any */
import { PrismaClient } from '@prisma/client';
import { errorMsg, passMsg } from '../lib/msg';

const prismaClient = new PrismaClient();

type ModelWithUpdate = {
  [K in keyof PrismaClient]: PrismaClient[K] extends { updateMany: (...args: any) => any }
    ? K
    : never;
}[keyof PrismaClient];

type UpdateManyFn = (args?: { where?: any; data?: any }) => Promise<any>;

const update = <T extends ModelWithUpdate>(
  model: T,
  args?: { where?: any; data?: any },
  leanTime?: number,
): Promise<any> => {
  return new Promise((resolve, reject) => {
    setTimeout(async () => {
      try {
        const delegate = prismaClient[model] as unknown as { updateMany: UpdateManyFn };
        const data = await delegate.updateMany(args);
        // if (data) passMsg(`${model} 테이블 조회 및 업데이트 //`, `update : ${data[0]}`);
        resolve(data);
      } catch (err) {
        errorMsg(`${model} (update)`, err);
        reject(err);
      }
    }, leanTime ?? 50);
  });
};

export { update };
