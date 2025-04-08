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
import userIdMock from '../data/common/userCuid.json';
import moverMock from '../data/mover/mover.json';
import moverIdMock from '../data/mover/moverCuid.json';
import customerIdMock from '../data/customer/customerCuid.json';
import notiMock from '../data/common/notification.json';
import quotesRequestMock from '../data/quote/quoteRequests/quoteRequest.json';
import quotesRequestByOthersMock from '../data/quote/quoteRequests/quoteRequestByOtherCustomers.json';
import moverQuoteMock from '../data/quote/moverQuotes/moverQuoteForQuoteRequest.json';
import quoteRequestAddressMock from '../data/quote/quoteRequestAddress.json';
import quoteStatusHistoryMock from '../data/quote/quoteStatusHistory.json';
import reviewMock from '../data/Review.json';
import { errorMsg, passMsg, startMsg } from '../lib/msg';
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
const justCreate = async <T extends ModelWithCreateMany>(
  model: T,
  data: any[],
  noMsg?: boolean,
) => {
  try {
    const delegate = prismaClient[model] as unknown as {
      createMany: CreateManyFn;
    };
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
    const password = 'qwerasdf1234!';
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    await create(
      'user',
      userMock.map((user, i: number): Prisma.UserCreateInput => {
        return {
          id: userIdMock[i],
          // userType: user.user_type as UserType,
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
      customer.map((user, i): Prisma.CustomerCreateManyInput => {
        const { id } = user;
        const imgPath = `/img/sample-profile/sample-${random(Array.from({ length: 5 })) + 1}.svg`;
        return {
          id: customerIdMock[i],
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
      mover.map((user, i): Prisma.MoverCreateManyInput => {
        const { id } = user;
        const imgPath = `/img/sample-profile/sample-${random(Array.from({ length: 5 })) + 1}.svg`;
        return {
          id: moverIdMock[i],
          userId: id,
          profileImage: imgPath,
          experienceYears: moverMock[i].experience_years || 0,
          introduction: moverMock[i].introduction || '',
          description: moverMock[i].description || '',
          averageRating: moverMock[i].average_rating,
          totalConfirmedCount: moverMock[i].total_confirmed_count,
          totalReviews: moverMock[i].total_reviews,
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
    customer.forEach(async (v) => {
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
  const customer = await customerFind({}, leanTime);

  try {
    await create('quoteRequest', [
      ...quotesRequestMock.map((val) => ({
        id: val.id,
        customerId: val.customerId,
        moveType: val.moveType,
        moveDate: val.moveDate,
        fromRegion: val.fromRegion,
        toRegion: val.toRegion,
        currentStatus: val.currentStatus,
      })),
      ...quotesRequestByOthersMock.map((val, i) => ({
        customerId: customer[i + 1].id, // 첫번째 고객은 제외(테스트용 고객)
        moveType: val.moveType,
        moveDate: val.moveDate,
        fromRegion: val.fromRegion,
        toRegion: val.toRegion,
        currentStatus: val.currentStatus,
      })),
    ]);
  } catch (err) {
    errorMsg(`quoteRequest mock 데이터 생성`, err);
  }
};

const createMoverQuote = async () => {
  startMsg('moverQuote create');
  try {
    const mover = await moverFind({}, leanTime);
    const quoteRequest: QuoteRequest[] = await find('quoteRequest', {});
    const quoteRequestByOthers = await find('quoteRequest', {
      where: {
        customerId: {
          not: 'cm9556wel00643n6ve7tt98jq',
        },
      },
    });
    quoteRequest.forEach(async (v) => {
      await create(
        'moverQuote',
        [
          ...moverQuoteMock.map((moverQuote, i2) => {
            return {
              quoteRequestId: v.id,
              moverId: mover[i2 + 1].id, // 테스트 기사님을 제외하기 위해 +1
              price: moverQuote.price,
              comment: moverQuote.comment,
            };
          }),
        ],
        true,
      );
    });
    await create(
      'moverQuote',
      quoteRequestByOthers.map((quoteRequest, i) => {
        return {
          quoteRequestId: quoteRequest.id,
          moverId: i % 2 === 0 ? mover[0].id : mover[1].id,
          price: 1500000,
          comment: '안전하고 신속하게 이사하겠습니다.',
        };
      }),
    );
    passMsg(`moverQuote 테이블 데이터 생성`);
  } catch (err) {
    errorMsg(`moverQuote mock 데이터 생성`, err);
  }
};

const createQuoteMatch = async () => {
  startMsg('quoteMatch create');
  try {
    const quoteRequest: QuoteRequest[] = await find('quoteRequest', {});
    const moverQuote = await find('moverQuote', {
      where: {
        moverId: 'cm9557rj700643n6voktl9apa',
      },
    });

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
          return moverQuote[ranIndex];
        }),
      )
    )
      .filter(Boolean)
      .filter((quote) => quote.moverId !== 'cm9557rj700643n6voktl9apa');

    await create(
      'quoteMatch',
      await Promise.all([
        ...target.map(async (val): Promise<Prisma.QuoteMatchCreateManyInput> => {
          return {
            moverQuoteId: val.id,
            isCompleted: true,
          };
        }),
        ...moverQuote.map((quote) => ({ moverQuoteId: quote.id, isCompleted: true })),
      ]),
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

    // 출발지
    await create(
      'quoteRequestAddress',
      toFrom.map((val, i: number): Prisma.QuoteRequestAddressCreateManyInput => {
        const { sido, sigungu, street } = val[1] ?? {
          sido: '',
          sigungu: '',
          street: '',
        };

        return {
          quoteRequestId: quoteRequest[i].id,
          type: 'DEPARTURE',
          sido,
          sigungu,
          street,
          fullAddress: `${sido} ${sigungu} ${street}`,
        };
      }),
      true,
    );

    // 도착지
    await justCreate(
      'quoteRequestAddress',
      toFrom.map((val, i: number): Prisma.QuoteRequestAddressCreateManyInput => {
        const { sido, sigungu, street } = val[0] ?? {
          sido: '',
          sigungu: '',
          street: '',
        };

        return {
          quoteRequestId: quoteRequest[i].id,
          type: 'ARRIVAL',
          sido,
          sigungu,
          street,
          fullAddress: `${sido} ${sigungu} ${street}`,
        };
      }),
      true,
    );
    passMsg('quoteRequestAddress 테이블 데이터 생성', `Length ${toFrom.length * 2}`);
  } catch (err) {
    errorMsg(`quoteRequestAddress mock 데이터 생성`, err);
  }
};

const createQuoteStatusHistory = async () => {
  startMsg('quoteStatusHistory create');
  try {
    const quoteRequest: QuoteRequest[] = await find('quoteRequest', {});
    const elseQuoteRequest = await find('quoteRequest', {
      where: {
        customerId: {
          not: 'cm9556wel00643n6ve7tt98jq',
        },
      },
    });

    passMsg('quoteStatusHistory 테이블 데이터 생성', `Length ${quoteRequest.length}`);
    await create('quoteStatusHistory', [
      ...quoteStatusHistoryMock,
      ...elseQuoteRequest.map((val) => ({
        quoteRequestId: val.id,
        status: 'QUOTE_REQUESTED',
      })),
    ]);
  } catch (err) {
    errorMsg(`QuoteStatusHistory mock 데이터 생성`, err);
  }
};

const createTargetedQuoteRequest = async () => {
  startMsg('targetedQuoteRequest create');
  try {
    const quoteRequest = await prismaClient.quoteRequest.findMany({
      where: {
        customerId: 'cm9556wel00643n6ve7tt98jq',
        currentStatus: 'QUOTE_REQUESTED',
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
    const quoteRequestByOthers = await prismaClient.quoteRequest.findMany({
      where: {
        customerId: {
          not: 'cm9556wel00643n6ve7tt98jq',
        },
        currentStatus: 'QUOTE_REQUESTED',
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
    await create('targetedQuoteRequest', [
      ...quoteRequest
        .map((request) => ({
          quoteRequestId: request.id,
          moverId: moverIdMock[0],
        }))
        .flat(),
      ...quoteRequestByOthers
        .map((request, i1) => {
          if (i1 % 3 !== 0) return;
          return Array.from({ length: 3 }).map((_, i2) => ({
            quoteRequestId: request.id,
            moverId: moverIdMock[i2],
          }));
        })
        .flat()
        .filter(Boolean),
    ]);
    // Array.from({ length: quoteRequest.length / 2 }).map(
    //   (_, i: number): Prisma.TargetedQuoteRequestCreateManyInput => {
    //     const { id: quoteRequestId, moverQuotes } = quoteRequest[i];
    //     const { moverId } = moverQuotes[0];
    //     return {
    //       moverId,
    //       quoteRequestId,
    //     };
    //   },
    // ),
  } catch (err) {
    errorMsg(`targetedQuoteRequest mock 데이터 생성`, err);
  }
  // finally {
  //   try {
  //     const tqr: TargetedQuoteRequest[] = await find('targetedQuoteRequest', {});
  //     await Promise.all(
  //       tqr.map(async (v) => {
  //         const { quoteRequestId, id, moverId } = v;
  //         const args: Prisma.MoverQuoteUpdateManyArgs = {
  //           where: { quoteRequestId, moverId },
  //           data: { targetedQuoteRequestId: id },
  //         };
  //         await update('moverQuote', args);
  //       }),
  //     );
  //     passMsg('moverQuote 업데이트', `Length ${tqr.length}`);
  //   } catch (error) {
  //     errorMsg('moverQuote update ', error);
  //   }
  // }
};

const createTargetedQuoteReject = async () => {
  startMsg('targetQuoteReject create');
  try {
    const tqr: TargetedQuoteRequest[] = await find('targetedQuoteRequest', {
      where: {
        moverId: 'cm9557rj700643n6voktl9apa',
      },
    });
    const otherTargetedQuoteRequests = await find('targetedQuoteRequest', {
      where: {
        moverId: {
          not: 'cm9557rj700643n6voktl9apa',
        },
      },
    });
    await create(
      'targetedQuoteRejection',
      [
        ...tqr.slice(0, 5).map((quoteRequest) => ({
          targetedQuoteRequestId: quoteRequest.id,
          rejectionReason: '거리가 너무 멀어서 어려울 것 같습니다',
        })),
        ...otherTargetedQuoteRequests.map((quoteRequest) => ({
          targetedQuoteRequestId: quoteRequest.id,
          rejectionReason: '그날 다른 일정이 있습니다.',
        })),
      ],
      // Array.from({ length: tqr.length / 2 }).map(
      //   (_, i): Prisma.TargetedQuoteRejectionCreateManyInput => {
      //     const ranIndex = random(targetedQuoteRejectionMock);
      //     const { rejectionReason } = targetedQuoteRejectionMock[ranIndex];
      //     const { id: targetedQuoteRequestId } = tqr[i];
      //     return {
      //       targetedQuoteRequestId,
      //       rejectionReason,
      //     };
      //   },
      // ),
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
        moverQuote: {
          moverId: 'cm9557rj700643n6voktl9apa',
        },
      } as Prisma.QuoteMatchWhereInput,
    });
    await create(
      'review',
      quoteMatch.map((val) => {
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
    const mover = await prismaClient.mover.findMany({
      where: {
        moverQuotes: {
          some: {
            quoteMatch: {
              isNot: null,
            },
          },
        },
      },
      include: {
        customerFavorites: true,
        moverQuotes: {
          where: {
            quoteMatch: {
              review: { isNot: null },
            },
          },
          include: {
            quoteMatch: {
              include: {
                review: true,
              },
            },
          },
        },
      },
    });

    mover
      .filter((x) => x.moverQuotes.some((mq) => mq.quoteMatch))
      .forEach(async (v, i) => {
        console.log(v.customerFavorites.length);
        const { moverQuotes, id, customerFavorites } = v;
        const rating =
          Math.floor(
            (moverQuotes.reduce((a: number, c) => {
              const { quoteMatch } = c;
              const rev = quoteMatch!.review!;
              a += rev.rating;

              return a;
            }, 0) /
              moverQuotes.length) *
              10 +
              0.5,
          ) / 10;

        await prismaClient.mover.updateMany({
          where: {
            id,
          },
          data: {
            averageRating: rating,
            totalReviews: moverQuotes.length,
            totalConfirmedCount: moverQuotes.length,
            totalCustomerFavorite: customerFavorites.length,
          },
        });
      });
  } catch (err) {
    errorMsg(`createReview mock 데이터 생성`, err);
  }
};

const updateFavorite = async () => {
  const movers = await find('mover', {
    include: {
      customerFavorites: true,
    },
  });
  // 각 기사별로 customerFavorites 배열 길이에 따라 totalCustomerFavorite 업데이트
  const updatePromises = movers.map((mover) => {
    return prismaClient.mover.update({
      where: { id: mover.id },
      data: {
        totalCustomerFavorite: mover.customerFavorites.length,
      },
    });
  });
  const updatedMovers = await prismaClient.$transaction(updatePromises);

  return updatedMovers;
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
  justCreate,
  updateFavorite,
};
export default create;
