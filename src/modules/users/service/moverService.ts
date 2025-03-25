import { MOVE_TYPE } from '@/constants/serviceType';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function getMovers() {
  const movers = await prisma.mover.findMany({
    include: {
      moverServices: true,
      user: { select: { name: true } }, // 사용자 정보 포함
    },
  });

  //findeuniqe으로 한명의 기사님 정보만 가져오기

  console.log(movers);
  return movers.map((mover) => ({
    // id: mover.id,
    // userId: mover.userId,
    // moverName: mover.user.name,
    // profileImage: mover.profileImage,
    // experienceYears: mover.experienceYears,
    // introduction: mover.introduction,
    // description: mover.description,
    // averageRating: mover.averageRating,
    // totalReviews: mover.totalReviews,
    // totalCustomerFavorite: mover.totalCustomerFavorite,
    // totalConfirmedCount: mover.totalConfirmedCount,
    // createdAt: mover.createdAt.toISOString().split('T')[0], // YYYY-MM-DD 형식
    // movingType: mover.moverServices.map((service) => MOVE_TYPE[service.serviceType]),
  }));
}

//   id: string;
//   driverName: string;
//   movingType: (keyof typeof MOVING_TYPES)[]; //
//   isCustomQuote: boolean;
//   movingDate: Date;
//   price: number;
//   reviewContent: string;
//   rating: number;
//   writtenAt: Date;
//   imageUrl: ; //유니온타입 string or null
