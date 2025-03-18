/* eslint-disable @typescript-eslint/no-explicit-any */
import { Prisma, PrismaClient } from '@prisma/client';
import { CustomerFind, MoverFind } from '../types/type';

const prismaClient = new PrismaClient();

type ModelWithFindMany = {
  [K in keyof PrismaClient]: PrismaClient[K] extends { findMany: (...args: any) => any }
    ? K
    : never;
}[keyof PrismaClient];

type FindManyFn = (args?: { where?: any }) => Promise<any>;

const find = <T extends ModelWithFindMany>(
  model: T,
  args?: { where?: any },
  leanTime?: number,
): Promise<any[]> => {
  return new Promise((resolve, reject) => {
    setTimeout(async () => {
      try {
        const delegate = prismaClient[model] as unknown as { findMany: FindManyFn };
        const data = await delegate.findMany(args);
        if (data) console.log(`✅ ${model} 테이블 조회 완료`, `조회 Length: ${data.length}`);
        resolve(data);
      } catch (err) {
        console.error(`❌ ${model} (find) Error: ${err}`);
        reject(err);
      }
    }, leanTime ?? 500);
  });
};

const userMoverFind = async () => {
  try {
    const result = await prismaClient.user.findMany({
      where: {
        userType: 'MOVER',
      },
    });
    if (result.length === 0) throw console.error(`❌ user mover 없음 `);
    return result;
  } catch (err) {
    throw console.error(`❌ user mover 찾기 Error: ${err}`);
  }
};

const userCustomerFind = async () => {
  try {
    const result = await prismaClient.user.findMany({
      where: {
        userType: 'CUSTOMER',
      },
    });
    if (result.length === 0) throw console.error(`❌ user customer 없음 `);
    return result;
  } catch (err) {
    throw console.error(`❌ user customer 찾기 Error: ${err}`);
  }
};

const customerFind = async (
  { where }: { where?: Prisma.CustomerWhereInput },
  leanTime: number,
): Promise<CustomerFind[]> => {
  return new Promise((resolve, reject) => {
    setTimeout(
      async () => {
        try {
          const result = await prismaClient.customer.findMany({ where });
          if (result.length === 0) {
            return reject(new Error('❌ customer 없음'));
          }
          resolve(result);
        } catch (err) {
          console.error(`❌ customerFind 찾기 Error: ${err}`);
          reject(err);
        }
      },
      leanTime ?? 0 + 100,
    );
  });
};

const moverFind = async (
  { where }: { where?: Prisma.MoverWhereInput },
  leanTime: number,
): Promise<MoverFind[]> => {
  return new Promise((resolve, reject) => {
    setTimeout(
      async () => {
        try {
          const result = await prismaClient.mover.findMany({ where });
          if (result.length === 0) {
            return reject(new Error('❌ customer 없음'));
          }
          resolve(result);
        } catch (err) {
          console.error(`❌ customerFind 찾기 Error: ${err}`);
          reject(err);
        }
      },
      leanTime ?? 0 + 100,
    );
  });
};

export { find, userMoverFind, userCustomerFind, customerFind, moverFind };
