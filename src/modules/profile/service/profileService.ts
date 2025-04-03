import { PrismaClient, Region, ServiceType } from '@prisma/client';

const prisma = new PrismaClient();

// 고객 프로필 등록 (이미지, 이용 서비스, 지역)
export async function createUserProfile(profileData: {
  userId: string;
  profileImage: string;
  serviceTypes: string[];
  locations: string[];
}) {
  try {
    const { userId, profileImage, serviceTypes, locations } = profileData;

    // 기존 유저 중복 체크
    const existingCustomer = await prisma.customer.findUnique({
      where: { userId },
    });

    if (existingCustomer) {
      throw new Error('프로필이 이미 등록되어 있습니다');
    }

    // 유저 프로필 등록
    const customerProfile = await prisma.customer.create({
      data: {
        userId: userId,
        profileImage: profileImage,
        location: locations[0] as Region, // 고객 지역은 하나만
        customerServices: {
          create: serviceTypes.map((serviceType) => ({
            serviceType: serviceType as ServiceType,
          })),
        },
      },
    });
    return customerProfile;
  } catch (err: any) {
    console.error('DB 등록 중 오류 발생:', err);
    throw new Error(err.message || '서버 오류');
  }
}

// 고객 프로필 유무 확인
export async function findCustomerProfile(userId: string) {
  const findProfile = await prisma.customer.findFirst({
    where: {
      userId: userId,
    },
  });
  return findProfile;
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
  const { userId, phoneAddress, passwordNew, profileImage, serviceTypes, locations } = patchData;

  // 고객 확인
  const customer = await prisma.customer.findUnique({
    where: { userId: userId },
    select: { id: true },
  });

  if (!customer) {
    throw new Error('해당 userId에 해당하는 고객을 찾을 수 없습니다');
  }
  //전화번호 중복 확인
  const existingPhone = await prisma.user.findFirst({
    where: { phoneNumber: phoneAddress, userType: 'CUSTOMER' }, // 기사 계정이 있을 수 있으니 타입 추가
  });

  if (existingPhone && existingPhone.id !== userId) {
    throw new Error('이미 사용 중인 전화번호입니다');
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
  experience: number;
  shortIntro: string;
  description: string;
  profileImage: string;
  serviceTypes: string[];
  locations: string[];
}) {
  const { userId, experience, shortIntro, description, profileImage, serviceTypes, locations } =
    profileData;

  // 유저 프로필 등록
  const moverProfile = await prisma.$transaction(async (prisma) => {
    // 기존 유저 중복 체크
    const existingMover = await prisma.mover.findUnique({
      where: { userId },
    });

    if (existingMover) {
      throw new Error('프로필이 이미 등록되어 있습니다');
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
  experience: number;
  shortIntro: string;
  description: string;
  profileImage: string;
  serviceTypes: string[];
  locations: string[];
}) {
  const { userId, experience, shortIntro, description, profileImage, serviceTypes, locations } =
    patchData;

  const mover = await prisma.mover.findFirst({
    where: { userId: userId },
    select: { id: true },
  });

  if (!mover) {
    throw new Error('해당 userId에 해당하는 기사를 찾을 수 없습니다');
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
