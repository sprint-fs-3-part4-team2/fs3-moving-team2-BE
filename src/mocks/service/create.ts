/* eslint-disable @typescript-eslint/no-explicit-any */
import { Prisma, PrismaClient } from '@prisma/client';
import { enArea } from '../types/resion.type';
import { Region, ServiceType } from '@prisma/client';
import customerMock from '../data/customer/customer.json';
import moverMock from '../data/mover/mover.json';
import notiMock from '../data/common/notification.json';
import customerServiceMock from '../data/customer/customerService.json';
import { customerFind, userCustomerFind, userMoverFind } from './find';
import random from './random';

const prismaClient = new PrismaClient();
const leanTime = 1000;

type ModelWithCreateMany = {
  [K in keyof PrismaClient]: PrismaClient[K] extends { createMany: (...args: any) => any }
    ? K
    : never;
}[keyof PrismaClient];
type CreateManyFn = (args: { data: any[] }) => Promise<any>;
type DeleteManyFn = (args?: { where?: any }) => Promise<any>;

const create = async <T extends ModelWithCreateMany>(model: T, data: any[], del?: boolean) => {
  try {
    const delegate = prismaClient[model] as unknown as {
      createMany: CreateManyFn;
      deleteMany: DeleteManyFn;
    };
    if (del === false) {
      const deletes = await delegate.deleteMany({});
      if (deletes) console.log(`✅ ${model} 테이블 정리`);
    }
    setTimeout(async () => {
      const createData = await delegate.createMany({
        data: data,
      });
      if (createData) console.log(`✅ ${model} 테이블 데이터 생성`);
    }, leanTime);
  } catch (err) {
    console.error(`❌ ${model} (create fn) Error: ${err}`);
  }
};

const createCustomer = async () => {
  try {
    const customer = await userCustomerFind();
    await create(
      'customer',
      customer.map((user): Prisma.CustomerCreateManyInput => {
        const { id } = user;
        return {
          userId: id,
          profileImage: customerMock[random(customerMock)].profile_image,
          location: enArea[random(enArea)] as Region,
        };
      }),
    );
  } catch (err) {
    console.error(`❌ mover mock 데이터 생성 Error: ${err}`);
  }
};

const createMover = async () => {
  try {
    const mover = await userMoverFind();
    await create(
      'mover',
      mover.map((user): Prisma.MoverCreateManyInput => {
        const randomMover = random(moverMock);
        const { id } = user;
        const { profile_image, experience_years, introduction, description } =
          moverMock[randomMover];
        return {
          userId: id,
          profileImage: profile_image || 'profile_img_error',
          experienceYears: experience_years || 0,
          introduction: introduction || '',
          description: description || '',
        };
      }),
    );
  } catch (err) {
    console.error(`❌ mover mock 데이터 생성 Error: ${err}`);
  }
};

const createNotification = async () => {
  try {
    const customer = await userCustomerFind();
    await create(
      'notification',
      notiMock.map((val): Prisma.NotificationCreateManyInput => {
        const customerIndex = random(customer as any[]);
        const { id } = customer[customerIndex];
        const { message, url, is_read } = val;
        return {
          userId: id || customer[0].id,
          message: message,
          url,
          isRead: is_read,
        };
      }),
    );
  } catch (err) {
    console.error(`❌ notification mock 데이터 생성 Error: ${err}`);
  }
};

const createCustomerService = async () => {
  try {
    const customer = await customerFind({}, leanTime);
    if (customer)
      await create(
        'customerService',
        customerServiceMock.map((val): Prisma.CustomerServiceCreateManyInput => {
          const customerIndex = random(customer);
          const { id } = customer[customerIndex];
          const { service_type } = val;
          return {
            customerId: id,
            serviceType: service_type as ServiceType,
          };
        }),
      );
  } catch (err) {
    console.error(`❌ customerService mock 데이터 생성 Error: ${err}`);
  }
};

export { createCustomer, createMover, createNotification, createCustomerService };
export default create;
