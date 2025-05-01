import { PrismaClient } from '@prisma/client';

export const createCustomer = async (
  prisma: PrismaClient,
  userData: any = {},
  customerData: any = {},
) => {
  const user = await prisma.user.create({
    data: {
      email: userData.email || `test-${Date.now()}@example.com`,
      password: userData.password || 'test',
      phoneNumber: userData.phoneNumber || '01012345678',
      name: userData.name || 'test',
      userType: 'CUSTOMER',
      customer: {
        create: {
          profileImage: customerData.profileImage || '',
          location: customerData.location || 'SEOUL',
        },
      },
    },
    include: {
      customer: true,
    },
  });
  return {
    user,
    customer: user.customer,
  };
};
