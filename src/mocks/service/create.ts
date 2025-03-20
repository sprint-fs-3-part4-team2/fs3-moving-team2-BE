/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  Prisma,
  PrismaClient,
  QuoteRequest,
  MoverQuote,
  TargetedQuoteRequest,
  QuoteMatch,
} from '@prisma/client';
import { enArea } from '../types/resion.type';
import { Region, ServiceType, UserType } from '@prisma/client';
import { customerFind, find, moverFind, userCustomerFind, userMoverFind } from './find';
import { random } from '../lib/lib';
// mock data
import userMock from '../data/common/user.json';
import customerMock from '../data/customer/customer.json';
import moverMock from '../data/mover/mover.json';
import notiMock from '../data/common/notification.json';
import customerServiceMock from '../data/customer/customerService.json';
import quotesRequestMock from '../data/quote/quoteRequest.json';
import moverQuoteMock from '../data/quote/moverQuote.json';
import moverServiceMock from '../data/mover/moverService.json';
import moverServiceRegionMock from '../data/mover/moverServiceRegion.json';
import quoteRequestAddressMock from '../data/quote/quoteRequestAddress.json';
import quoteStatusHistoryMock from '../data/quote/quoteStatusHistory.json';
import targetedQuoteRejectionMock from '../data/quote/targetedQuoteRejection.json';
import reviewMock from '../data/Review.json';
import { errorMsg, passMsg, startMsg } from '../lib/msg';

const prismaClient = new PrismaClient();
const leanTime = 10;

type ModelWithCreateMany = {
  [K in keyof PrismaClient]: PrismaClient[K] extends { createMany: (...args: any) => any }
    ? K
    : never;
}[keyof PrismaClient];
type CreateManyFn = (args: { data: any[] }) => Promise<any>;
type DeleteManyFn = (args?: { where?: any }) => Promise<any>;

const create = async <T extends ModelWithCreateMany>(model: T, data: any[]) => {
  try {
    const delegate = prismaClient[model] as unknown as {
      createMany: CreateManyFn;
      deleteMany: DeleteManyFn;
    };
    const deletes = await delegate.deleteMany({});
    if (deletes) passMsg(`${model} 테이블 정리`);
    const createData = await delegate.createMany({
      data: data,
    });
    if (createData) passMsg(`${model} 테이블 데이터 생성`);
  } catch (err) {
    errorMsg(`${model} (create fn)`, err);
  }
};

const createUser = async () => {
  startMsg('user create');
  try {
    await create(
      'user',
      userMock.map((user, i: number): Prisma.UserCreateInput => {
        return {
          userType: i % 2 === 0 ? 'CUSTOMER' : 'MOVER',
          email: user.email,
          name: user.name,
          phoneNumber: user.phone_number,
          password: user.password,
          createdAt: new Date(user.created_at),
          updatedAt: new Date(user.updated_at),
        };
      }),
    );
  } catch (err) {
    errorMsg(`user mock 데이터 생성`, err);
  }
};

const createCustomer = async () => {
  startMsg('customer create');
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
    errorMsg(`customer mock 데이터 생성`, err);
  }
};

const createMover = async () => {
  startMsg('mover create');
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
    errorMsg(`mover mock 데이터 생성`, err);
  }
};

const createNotification = async () => {
  startMsg('notification create');

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
    errorMsg(`notification mock 데이터 생성`, err);
  }
};

const createCustomerService = async () => {
  startMsg('customerService create');
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
    errorMsg(`customerService mock 데이터 생성`, err);
  }
};

const createCustomerFavorite = async () => {
  startMsg('customerFavorite create');
  try {
    const customer = await customerFind({}, leanTime);
    const mover = await moverFind({}, leanTime);

    await create(
      'customerFavorite',
      customer.map((val): Prisma.CustomerFavoriteCreateManyInput => {
        const moverIndex = random(mover);
        return {
          customerId: val.id,
          moverId: mover[moverIndex].id,
        };
      }),
    );
  } catch (err) {
    errorMsg(`customerFavorite mock 데이터 생성`, err);
  }
};

const createQuoteRequest = async () => {
  startMsg('quoteRequest create');
  try {
    const customer = await customerFind({}, leanTime);
    await create(
      'quoteRequest',
      customer.map((val, i: number): Prisma.QuoteRequestCreateManyInput => {
        const qrmIndex = random(quotesRequestMock);
        const { moveDate } = quotesRequestMock[qrmIndex];
        const { id } = val;
        const region = Object.values(Region);
        const regionIndex = random(region);
        const serviceType = Object.values(ServiceType);
        const serviceTypeIndex = random(serviceType);
        return {
          customerId: id,
          moveType: serviceType[serviceTypeIndex],
          fromRegion: region[regionIndex],
          toRegion: region[regionIndex + 1 >= region.length ? 0 : regionIndex + 1],
          moveDate: moveDate,
        };
      }),
    );
  } catch (err) {
    errorMsg(`quoteRequest mock 데이터 생성`, err);
  }
};

const createMoverQuote = async () => {
  startMsg('moverQuote create');
  try {
    const mover = await moverFind({}, leanTime);
    const quoteRequest: QuoteRequest[] = await find('quoteRequest', {});
    await create(
      'moverQuote',
      mover.map((val, i: number): Prisma.MoverQuoteCreateManyInput => {
        const mqmIndex = random(moverQuoteMock);
        const { price } = moverQuoteMock[mqmIndex];
        const { id: quoteRequestId } = quoteRequest[i];
        const { id: moverId } = val;
        return {
          quoteRequestId: quoteRequestId,
          moverId,
          price,
        };
      }),
    );
  } catch (err) {
    errorMsg(`moverQuote mock 데이터 생성`, err);
  }
};

const createQuoteMatch = async () => {
  startMsg('quoteMatch create');
  try {
    const moverQuote: MoverQuote[] = await find('moverQuote', {});
    await create(
      'quoteMatch',
      moverQuote.map((val, i): Prisma.QuoteMatchCreateManyInput => {
        return {
          moverQuoteId: val.id,
          isCompleted: i % 2 === 0 ? true : false,
        };
      }),
    );
  } catch (err) {
    errorMsg(`quoteMatch mock 데이터 생성`, err);
  }
};

const createMoverService = async () => {
  startMsg('moverService create');
  try {
    const mover = await moverFind({}, leanTime);
    await create(
      'moverService',
      moverServiceMock.map((val, i: number): Prisma.MoverServiceCreateManyInput => {
        const serviceTypes = Object.values(ServiceType);
        return {
          moverId: mover[Math.floor(i / serviceTypes.length)].id,
          serviceType: val.serviceType as ServiceType,
        };
      }),
    );
  } catch (err) {
    errorMsg(`moverService mock 데이터 생성`, err);
  }
};

const createMoverServiceResion = async () => {
  startMsg('moverServiceResion create');
  try {
    const mover = await moverFind({}, leanTime);
    await create(
      'moverServiceRegion',
      moverServiceRegionMock.map((val, i: number): Prisma.MoverServiceRegionCreateManyInput => {
        const len = Object.values(Region).length;
        const { region } = val;
        return {
          moverId: mover[Math.floor(i / len)].id,
          region: region as Region,
        };
      }),
    );
  } catch (err) {
    errorMsg(`moverServiceRegion mock 데이터 생성`, err);
  }
};

const createQuoteRequestAddress = async () => {
  startMsg('quoteRequestAddress create');
  try {
    const quoteRequest: QuoteRequest[] = await find('quoteRequest', {});
    const toFrom = quoteRequest.map((v) => {
      const { toRegion, fromRegion } = v;
      const to = quoteRequestAddressMock.find((x) => x.resion === toRegion);
      const from = quoteRequestAddressMock.find((x) => x.resion === fromRegion);
      return [to, from];
    });

    await create(
      'quoteRequestAddress',
      toFrom.map((val, i: number): Prisma.QuoteRequestAddressCreateManyInput => {
        const { sido, sigungu, street } = val[i % 2 === 0 ? 0 : 1] ?? {
          sido: '',
          sigungu: '',
          street: '',
        };

        return {
          quoteRequestId: quoteRequest[Math.floor(i / 2)].id,
          type: i % 2 === 0 ? 'DEPARTURE' : 'ARRIVAL',
          sido,
          sigungu,
          street,
          fullAddress: `${sido} ${sigungu} ${street}`,
        };
      }),
    );
  } catch (err) {
    errorMsg(`quoteRequestAddress mock 데이터 생성`, err);
  }
};

const createQuoteStatusHistory = async () => {
  startMsg('quoteStatusHistory create');
  try {
    const quoteRequest: QuoteRequest[] = await find('quoteRequest', {});

    await create(
      'quoteStatusHistory',
      quoteRequest.map((val, i: number): Prisma.QuoteStatusHistoryCreateManyInput => {
        const index = random(quoteStatusHistoryMock);
        const { status } = quoteStatusHistoryMock[index];
        const { id: quoteRequestId } = val;
        return {
          quoteRequestId,
          status,
        };
      }),
    );
  } catch (err) {
    errorMsg(`QuoteStatusHistory mock 데이터 생성`, err);
  }
};

const createTargetedQuoteRequest = async () => {
  startMsg('targetedQuoteRequest create');
  try {
    const mover = await moverFind({}, leanTime);
    const quoteRequest: QuoteRequest[] = await find('quoteRequest', {});

    await create(
      'targetedQuoteRequest',
      quoteRequest.map((req, i: number): Prisma.TargetedQuoteRequestCreateManyInput => {
        const { id: quoteRequestId } = req;
        const { id: moverId } = mover[i];
        return {
          moverId,
          quoteRequestId,
        };
      }),
    );
  } catch (err) {
    errorMsg(`targetedQuoteRequest mock 데이터 생성`, err);
  }
};

const createTargetedQuoteReject = async () => {
  startMsg('targetQuoteReject create');
  try {
    const tqr: TargetedQuoteRequest[] = await find('targetedQuoteRequest', {});
    await create(
      'targetedQuoteRejection',
      tqr.map((req): Prisma.TargetedQuoteRejectionCreateManyInput => {
        const ranIndex = random(targetedQuoteRejectionMock);
        const { rejectionReason } = targetedQuoteRejectionMock[ranIndex];
        const { id: targetedQuoteRequestId } = req;
        return {
          targetedQuoteRequestId,
          rejectionReason,
        };
      }),
    );
  } catch (err) {
    errorMsg(`targetedQuoteRejection mock 데이터 생성`, err);
  }
};

const createReview = async () => {
  startMsg('createReview create');
  try {
    const quoteMatch: QuoteMatch[] = await find('quoteMatch', {
      where: {
        isCompleted: true,
      } as Prisma.QuoteMatchWhereInput,
    });
    await create(
      'review',
      quoteMatch.map((val): Prisma.ReviewCreateManyInput => {
        const { id: quoteMatchId } = val;
        const ranIndex = random(reviewMock);
        const { rating, content } = reviewMock[ranIndex];
        return {
          quoteMatchId,
          rating,
          content,
        };
      }),
    );
  } catch (err) {
    errorMsg(`createReview mock 데이터 생성`, err);
  }
};

export {
  createUser,
  createCustomer,
  createMover,
  createNotification,
  createCustomerService,
  createCustomerFavorite,
  createQuoteRequest,
  createMoverQuote,
  createQuoteMatch,
  createMoverService,
  createMoverServiceResion,
  createQuoteRequestAddress,
  createQuoteStatusHistory,
  createTargetedQuoteRequest,
  createTargetedQuoteReject,
  createReview,
};
export default create;
