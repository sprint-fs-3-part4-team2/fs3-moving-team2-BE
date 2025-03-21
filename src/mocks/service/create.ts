/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  Prisma,
  PrismaClient,
  QuoteRequest,
  MoverQuote,
  TargetedQuoteRequest,
  QuoteMatch,
  Region,
  ServiceType,
} from '@prisma/client';
import { enArea } from '../types/resion.type';
import { customerFind, find, moverFind, userCustomerFind, userMoverFind } from './find';
import { random } from '../lib/lib';
// mock data
import userMock from '../data/common/user.json';
import moverMock from '../data/mover/mover.json';
import notiMock from '../data/common/notification.json';
import quotesRequestMock from '../data/quote/quoteRequest.json';
import moverQuoteMock from '../data/quote/moverQuote.json';
import quoteRequestAddressMock from '../data/quote/quoteRequestAddress.json';
import quoteStatusHistoryMock from '../data/quote/quoteStatusHistory.json';
import targetedQuoteRejectionMock from '../data/quote/targetedQuoteRejection.json';
import reviewMock from '../data/Review.json';
import { errorMsg, passMsg, startMsg } from '../lib/msg';
import { update } from './update';
import bcrypt from 'bcrypt';

const prismaClient = new PrismaClient();
const leanTime = 10;

type ModelWithCreateMany = {
  [K in keyof PrismaClient]: PrismaClient[K] extends { createMany: (...args: any) => any }
    ? K
    : never;
}[keyof PrismaClient];
type CreateManyFn = (args: { data: any[] }) => Promise<any>;
type DeleteManyFn = (args?: { where?: any }) => Promise<any>;

const create = async <T extends ModelWithCreateMany>(model: T, data: any[], noMsg?: boolean) => {
  try {
    const delegate = prismaClient[model] as unknown as {
      createMany: CreateManyFn;
      deleteMany: DeleteManyFn;
    };
    const deletes = await delegate.deleteMany({});
    if (deletes && !noMsg) passMsg(`${model} 테이블 정리`);
    const createData = await delegate.createMany({
      data: data,
    });
    if (createData && !noMsg) passMsg(`${model} 테이블 데이터 생성`);
  } catch (err) {
    errorMsg(`${model} (create fn)`, err);
  }
};

const createUser = async () => {
  startMsg('user create');
  try {
    const saltRounds = 10;
    const password = 'qwer1234!';
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    await create(
      'user',
      userMock.map((user, i: number): Prisma.UserCreateInput => {
        return {
          userType: i % 5 !== 0 ? 'CUSTOMER' : 'MOVER',
          email: user.email,
          name: user.name,
          phoneNumber: user.phone_number,
          password: hashedPassword,
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
        const imgPath =
          'd3h2ixicz4w2p.cloudfront.net/uploads/1742216810416-스크린샷 2025-01-03 131708.png';
        return {
          userId: id,
          profileImage: imgPath,
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
        const { experience_years, introduction, description } = moverMock[randomMover];
        const imgPath =
          'd3h2ixicz4w2p.cloudfront.net/uploads/1742216810416-스크린샷 2025-01-03 131708.png';
        return {
          userId: id,
          profileImage: imgPath,
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
    const user = await find('user', {});
    user.forEach(async (v) => {
      const { id: userId } = v;
      const renIndex = random(notiMock);
      await create(
        'notification',
        Array.from({ length: renIndex }).map((_, i2): Prisma.NotificationCreateManyInput => {
          const { message, url, is_read: isRead } = notiMock[i2];
          return {
            userId,
            message,
            url,
            isRead,
          };
        }),
        true,
      );
    });
    passMsg('notification 테이블 데이터 생성');
  } catch (err) {
    errorMsg(`notification mock 데이터 생성`, err);
  }
};

const createCustomerService = async () => {
  startMsg('customerService create');
  try {
    const customer = await customerFind({}, leanTime);
    const serviceType = Object.values(ServiceType);
    if (customer)
      await create(
        'customerService',
        customer.map((val): Prisma.CustomerServiceCreateManyInput => {
          const serviceIndex = random(serviceType);
          const { id: customerId } = val;
          return {
            customerId,
            serviceType: serviceType[serviceIndex],
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
    customer.forEach(async (v, i) => {
      const { id: customerId } = v;
      const moverLength = random(mover);
      await create(
        'customerFavorite',
        Array.from({ length: moverLength }).map((_, i2): Prisma.CustomerFavoriteCreateManyInput => {
          return {
            customerId,
            moverId: mover[i2].id,
          };
        }),
        true,
      );
    });
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
      customer.map((val): Prisma.QuoteRequestCreateManyInput => {
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
    quoteRequest.forEach(async (v) => {
      const { id: quoteRequestId } = v;
      const requestMoverLength = random(mover);
      await create(
        'moverQuote',
        Array.from({ length: requestMoverLength }).map((_, i): Prisma.MoverQuoteCreateManyInput => {
          const mqmIndex = random(moverQuoteMock);
          const { price } = moverQuoteMock[mqmIndex];
          const { id: moverId } = mover[i];

          return {
            quoteRequestId,
            moverId,
            price,
          };
        }),
        true,
      );
    });
    passMsg(`moverQuote 테이블 데이터 생성`);
  } catch (err) {
    errorMsg(`moverQuote mock 데이터 생성`, err);
  }
};

const createQuoteMatch = async () => {
  startMsg('quoteMatch create');
  try {
    const quoteRequest: QuoteRequest[] = await find('quoteRequest', {});

    const target = (
      await Promise.all(
        quoteRequest.map(async (v) => {
          const moverQuote: MoverQuote[] = await find(
            'moverQuote',
            {
              where: {
                quoteRequestId: v.id,
              } as Prisma.MoverQuoteWhereInput,
            },
            true,
          );

          const ranIndex = random(moverQuote);
          return moverQuote[ranIndex]; // moverQuote가 비어 있으면 undefined 가능
        }),
      )
    ).filter(Boolean); // <-- 여기에서 필터링 적용

    await create(
      'quoteMatch',
      await Promise.all(
        target.map(async (val, i): Promise<Prisma.QuoteMatchCreateManyInput> => {
          return {
            moverQuoteId: val.id,
            isCompleted: i % 2 === 0 ? true : false,
          };
        }),
      ),
    );
  } catch (err) {
    errorMsg(`quoteMatch mock 데이터 생성`, err);
  }
};

const createMoverService = async () => {
  startMsg('moverService create');
  try {
    const mover = await moverFind({}, leanTime);
    const serviceType = Object.values(ServiceType);
    mover.forEach(async (v) => {
      const { id: moverId } = v;
      const ranIndex = random(serviceType);
      await create(
        'moverService',
        Array.from({ length: ranIndex !== 0 ? ranIndex : 1 }).map(
          (_, i2): Prisma.MoverServiceCreateManyInput => {
            return { moverId, serviceType: serviceType[i2] };
          },
        ),
        true,
      );
    });
    passMsg('moverService 테이블 데이터 생성');
  } catch (err) {
    errorMsg(`moverService mock 데이터 생성`, err);
  }
};

const createMoverServiceResion = async () => {
  startMsg('moverServiceResion create');
  try {
    const mover = await moverFind({}, leanTime);
    const regionArr = Object.values(Region);

    await create(
      'moverServiceRegion',
      Array.from({ length: mover.length * 3 }, (_, i) => ({
        moverId: Math.floor(i / 3),
      })).map((info, i): Prisma.MoverServiceRegionCreateManyInput => {
        const { moverId } = info;
        return {
          moverId: mover[moverId].id,
          region: regionArr[i % 3],
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
      quoteRequest.map((val): Prisma.QuoteStatusHistoryCreateManyInput => {
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
    const quoteRequest = await prismaClient.quoteRequest.findMany({
      where: {
        moverQuotes: {
          some: {},
        },
      },
      include: {
        moverQuotes: {
          select: {
            moverId: true,
          },
        },
      },
    });
    passMsg(`quoteRequest 테이블 조회`, `${quoteRequest.length}`);
    await create(
      'targetedQuoteRequest',
      Array.from({ length: quoteRequest.length / 2 }).map(
        (_, i: number): Prisma.TargetedQuoteRequestCreateManyInput => {
          const { id: quoteRequestId, moverQuotes } = quoteRequest[i];
          const { moverId } = moverQuotes[0];
          return {
            moverId,
            quoteRequestId,
          };
        },
      ),
    );
  } catch (err) {
    errorMsg(`targetedQuoteRequest mock 데이터 생성`, err);
  } finally {
    try {
      const tqr: TargetedQuoteRequest[] = await find('targetedQuoteRequest', {});
      await Promise.all(
        tqr.map(async (v) => {
          const { quoteRequestId, id, moverId } = v;
          const args: Prisma.MoverQuoteUpdateManyArgs = {
            where: { quoteRequestId, moverId },
            data: { targetedQuoteRequestId: id },
          };
          await update('moverQuote', args);
        }),
      );
      passMsg('moverQuote update', `Length ${tqr.length}`);
    } catch (error) {
      errorMsg('moverQuote update ', error);
    }
  }
};

const createTargetedQuoteReject = async () => {
  startMsg('targetQuoteReject create');
  try {
    const tqr: TargetedQuoteRequest[] = await find('targetedQuoteRequest', {});
    await create(
      'targetedQuoteRejection',
      Array.from({ length: tqr.length / 2 }).map(
        (_, i): Prisma.TargetedQuoteRejectionCreateManyInput => {
          const ranIndex = random(targetedQuoteRejectionMock);
          const { rejectionReason } = targetedQuoteRejectionMock[ranIndex];
          const { id: targetedQuoteRequestId } = tqr[i];
          return {
            targetedQuoteRequestId,
            rejectionReason,
          };
        },
      ),
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
