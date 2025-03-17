import { Prisma, PrismaClient } from '@prisma/client';
import { CustomerFind } from '../types/type';

const prismaClient = new PrismaClient();

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
    setTimeout(async () => {
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
    }, leanTime + 1000);
  });
};

export { userMoverFind, userCustomerFind, customerFind };
