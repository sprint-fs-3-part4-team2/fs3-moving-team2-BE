import { PrismaClient, Region, ServiceType } from '@prisma/client';

const prisma = new PrismaClient();

// 고객 프로필 등록 (이미지, 이용 서비스, 지역)
export async function createUserProfile(profileData: {
  userId: string;
  profileImage: string;
  serviceTypes: string[];
  locations: string[];
}) {
  const { userId, profileImage, serviceTypes, locations } = profileData;

  // 프로필이 이미 있으면 return

  // 유저 프로필 등록
  const customerProfile = await prisma.customer.create({
    data: {
      userId: userId,
      profileImage: profileImage,
      location: locations[0] as Region,
      customerServices: {
        create: serviceTypes.map((serviceType) => ({
          serviceType: serviceType as ServiceType,
        })),
      },
    },
  });
  return customerProfile;
}

// 고객 프로필 수정 (이름, 이메일, 전화번호새 비밀번호, 이미지, 이용 서비스, 지역)
export async function patchUserProfile(patchData: {
  userId: string;
  name: string;
  email: string;
  phoneAddress: string;
  passwordNew: string;
  profileImage: string;
  serviceTypes: string[];
  locations: string[];
}) {
  const { userId, passwordNew, profileImage, serviceTypes, locations } = patchData;

  const customer = await prisma.customer.findFirst({
    where: { userId: userId },
    select: { id: true },
  });

  if (!customer) {
    throw new Error('해당 userId에 해당하는 고객을 찾을 수 없습니다.');
  }

  const updatedCustomerProfile = await prisma.$transaction([
    // 기존 서비스 삭제
    prisma.customerService.deleteMany({
      where: { customerId: customer.id },
    }),

    // 고객 정보 업데이트
    prisma.customer.update({
      where: { userId: userId },
      data: {
        profileImage,
        location: locations[0] as Region,
        user: {
          update: {
            ...(passwordNew ? { password: passwordNew } : {}), // 새 비밀번호가 있으면 업데이트
          },
        },
        customerServices: {
          create: serviceTypes.map((serviceType) => ({
            serviceType: serviceType as ServiceType,
          })),
        },
      },
    }),
  ]);

  return updatedCustomerProfile;
}

// 기사 프로필 등록 (이미지, 별명, 경력, 한 줄 소개, 상세설명, 제공 서비스, 지역)
export async function createMoverProfile(profileData: {
  userId: string;
  nickname: string;
  experience: number;
  shortIntro: string;
  description: string;
  profileImage: string;
  serviceTypes: string[];
  locations: string[];
}) {
  const {
    userId,
    nickname,
    experience,
    shortIntro,
    description,
    profileImage,
    serviceTypes,
    locations,
  } = profileData;

  // 유저 프로필 등록
  const moverProfile = await prisma.$transaction(async (prisma) => {
    // 기존 유저 중복 체크
    const existingMover = await prisma.mover.findUnique({
      where: { userId },
    });

    if (existingMover) {
      throw new Error('이미 등록된 기사 프로필이 있습니다.');
    }

    // mover 생성
    const mover = await prisma.mover.create({
      data: {
        userId,
        experienceYears: Number(experience),
        introduction: shortIntro,
        description,
        profileImage,
      },
    });

    // moverServiceRegions 생성
    if (locations.length > 0) {
      await prisma.moverServiceRegion.createMany({
        data: locations.map((region) => ({
          moverId: mover.id,
          region: region as Region,
        })),
      });
    }

    // moverServices 생성
    if (serviceTypes.length > 0) {
      await prisma.moverService.createMany({
        data: serviceTypes.map((serviceType) => ({
          moverId: mover.id,
          serviceType: serviceType as ServiceType,
        })),
      });
    }

    return mover;
  });
  return moverProfile;
}

// 기사 프로필 수정 (이미지, 별명, 경력, 한 줄 소개, 상세설명, 제공 서비스, 지역)
export async function patchMoverProfile(patchData: {
  userId: string;
  nickname: string;
  experience: number;
  shortIntro: string;
  description: string;
  profileImage: string;
  serviceTypes: string[];
  locations: string[];
}) {
  const {
    userId,
    // nickname,
    experience,
    shortIntro,
    description,
    profileImage,
    serviceTypes,
    locations,
  } = patchData;

  const mover = await prisma.mover.findFirst({
    where: { userId: userId },
    select: { id: true },
  });

  if (!mover) {
    throw new Error('해당 userId에 해당하는 기사를 찾을 수 없습니다.');
  }

  const updatedMoverProfile = await prisma.$transaction([
    // 기존 서비스 삭제
    prisma.moverService.deleteMany({
      where: { moverId: mover.id },
    }),
    // 기존 서비스 지역 삭제
    prisma.moverServiceRegion.deleteMany({
      where: { moverId: mover.id },
    }),

    // 기사 정보 업데이트
    prisma.mover.update({
      where: { userId: userId },
      data: {
        profileImage,
        experienceYears: Number(experience),
        introduction: shortIntro,
        description: description,

        moverServices: {
          create: serviceTypes.map((serviceType) => ({
            serviceType: serviceType as ServiceType,
          })),
        },
        moverServiceRegions: {
          create: locations.map((location) => ({
            region: location as Region,
          })),
        },
      },
    }),
  ]);

  return updatedMoverProfile;
}
