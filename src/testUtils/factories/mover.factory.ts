import { PrismaClient } from '@prisma/client';

export const createMover = async (
  prisma: PrismaClient,
  userData: any = {},
  moverData: any = {},
) => {
  const user = await prisma.user.create({
    data: {
      email: userData.email || `test-${Date.now()}@example.com`,
      password: userData.password || 'test',
      phoneNumber: userData.phoneNumber || `${new Date().getTime()}`,
      name: userData.name || 'test',
      userType: 'MOVER',
      mover: {
        create: {
          profileImage: moverData.profileImage || '',
          experienceYears: moverData.experienceYears || 1,
          introduction: moverData.introduction || '',
          description: moverData.description || '',

          moverServices: {
            createMany: {
              data: moverData.moverServices || [{ serviceType: 'SMALL_MOVE' }],
            },
          },
          moverServiceRegions: {
            createMany: {
              data: moverData.moverServiceRegions || [{ region: 'SEOUL' }],
            },
          },
        },
      },
    },
    include: {
      mover: true,
    },
  });

  return {
    user,
    mover: user.mover,
  };
};
