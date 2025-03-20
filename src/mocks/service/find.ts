/* eslint-disable @typescript-eslint/no-explicit-any */
import { Prisma, PrismaClient } from '@prisma/client';
import { CustomerFind, MoverFind } from '../types/type';
import { errorMsg, passMsg } from '../lib/msg';

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
        if (data) passMsg(`${model} 테이블 조회 //`, `조회 Length: ${data.length}`);
        resolve(data);
      } catch (err) {
        errorMsg(`${model} (find)`, err);
        reject(err);
      }
    }, leanTime ?? 50);
  });
};

const userMoverFind = async () => {
  try {
    const result = await prismaClient.user.findMany({
      where: {
        userType: 'MOVER',
      },
    });
    if (result.length === 0) throw errorMsg(`user mover 없음`, {});
    return result;
  } catch (err) {
    throw errorMsg(`user mover 찾기`, err);
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
    throw errorMsg(`user customer 찾기`, err);
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
          errorMsg(`customerFind 찾기`, err);
          reject(err);
        }
      },
      leanTime ?? 0 + 10,
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
          errorMsg(`moverFind 찾기`, err);
          reject(err);
        }
      },
      leanTime ?? 0 + 10,
    );
  });
};

export { find, userMoverFind, userCustomerFind, customerFind, moverFind };
