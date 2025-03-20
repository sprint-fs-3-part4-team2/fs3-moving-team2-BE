import { PrismaClient, Region, ServiceType } from '@prisma/client';

const prisma = new PrismaClient();

export async function getNotificationsInfo(userId: string) {
  const notifications = await prisma.notification.findMany({
    where: {
      userId,
    },
    orderBy: {
      createdAt: 'desc',
    },
  });
  return notifications;
}

export async function updateRead(notificationId: string) {
  const updatedNotification = await prisma.notification.update({
    where: {
      id: notificationId,
    },
    data: {
      isRead: true,
    },
  });
  return updatedNotification;
}
