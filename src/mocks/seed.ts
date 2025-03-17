import userMock from './data/common/user.json';
import { Prisma } from '@prisma/client';
import create, {
  createCustomer,
  createCustomerService,
  createMover,
  createNotification,
} from './service/create';
import { UserType } from '@prisma/client';

async function main() {
  try {
    // user
    await create(
      'user',
      userMock.map(
        (user): Prisma.UserCreateInput => ({
          userType: user.user_type as UserType,
          email: user.email,
          name: user.name,
          phoneNumber: user.phone_number,
          password: user.password,
          createdAt: new Date(user.created_at),
          updatedAt: new Date(user.updated_at),
        }),
      ),
      false,
    );
    setTimeout(async () => {
      // customer
      await createCustomer();
      // mover
      await createMover();
      // notificaition
      await createNotification();
      // customerService
      await createCustomerService();
    }, 1000);
  } catch (err) {
    console.error(`seed 실패 : ${err}`);
  }
}

main();
