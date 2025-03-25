import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function getNotificationsInfo(userId: string) {
  try {
    // id 에 맞는 유저 확인
    const existingUser = await prisma.user.findUnique({
      where: {
        id: userId,
      },
    });
    // 없으면 null 반환
    if (!existingUser) {
      return null;
    }

    const notifications = await prisma.notification.findMany({
      where: {
        userId,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
    return notifications;
  } catch (err) {
    console.error('알림 조회 오류:', err);
    throw new Error('알림을 가져오는 중 오류가 발생했습니다.');
  }
}

export async function updateRead(notificationId: string) {
  try {
    // 알림 있는지 확인
    const existingAlarm = await prisma.notification.findUnique({
      where: {
        id: notificationId,
      },
    });
    // 없으면 에러
    if (!existingAlarm) {
      throw new Error('해당 알림을 찾을 수 없습니다.');
    }
    const updatedNotification = await prisma.notification.update({
      where: {
        id: notificationId,
      },
      data: {
        isRead: true,
      },
    });
    return updatedNotification;
  } catch (err) {
    console.error('알림 읽음 처리 오류:', err);
    throw new Error('알림을 업데이트하는 중 오류가 발생했습니다.');
  }
}

export async function createNotification(postData: {
  userId: string;
  messageType: string; // 아래 MESSAGE_MAP을 참고해주세용
  url?: string;
}) {
  const { userId, messageType, url } = postData;

  const MESSAGE_MAP: Record<string, string> = {
    quoteRequest: '지정 견적 요청이 도착했습니다',
    quoteConfirm: '견적이 확정되었습니다',
    quoteRefuse: '지정 견적 요청이 거절되었습니다',
    dayBefore: '내일은 이사하는 날입니다',
  };
  const message = MESSAGE_MAP[messageType];
  if (!message) {
    throw new Error(`유효하지 않은 messageType: ${messageType}`);
  }

  // 필수 데이터 검증 (userId만 체크)
  if (!userId) {
    throw new Error('userId는 필수 입력값입니다.');
  }

  try {
    // 알림 생성
    const newAlarm = await prisma.notification.create({
      data: {
        userId,
        message,
        url,
      },
    });
    return newAlarm;
  } catch (error) {
    console.error('알림 생성 실패:', error);
    throw new Error('알림 생성 중 오류가 발생했습니다.');
  }
}
