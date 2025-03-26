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

type messageType =
  | 'quoteArrive'
  | 'quoteRequest'
  | 'quoteConfirm'
  | 'quoteRefuse'
  | 'dayBefore'
  | 'newReview';

export async function createNotification(postData: {
  userId: string; // 알림 보여줄 유저
  messageType: messageType; // MESSAGE_MAP 에서 선택해주세용
  moverName?: string; // 기사 이름
  moveType?: string; // 견적
  fromRegion?: string; // 출발지
  toRegion?: string; // 도착지
  url?: string;
}) {
  const { userId, messageType, moverName, moveType, fromRegion, toRegion, url } = postData;

  const MESSAGE_MAP: Record<string, string> = {
    quoteArrive: `${moverName} 기사님의 ${moveType} 견적이 도착했어요!`,
    quoteRequest: '지정 견적 요청이 도착했어요!',
    quoteConfirm: `${moverName} 기사님의 견적이 확정되었어요!!`,
    quoteRefuse: '${moverName} 기사님이 견적 요청을 거절했어요..',
    dayBefore: `내일은 ${fromRegion} -> ${toRegion} 이사 예정일이에요!`,
    newReview: '새로운 리뷰가 등록되었습니다! 어서 확인해보세요!',
  };

  const HIGHLIGHT_WORDS: Record<string, string[]> = {
    quoteArrive: [moveType ?? '', '견적'],
    quoteRequest: ['지정 견적 요청', '도착'],
    quoteConfirm: [moveType ?? '', '확정'],
    quoteRefuse: ['지정 견적 요청', '도착'],
    dayBefore: [`${fromRegion} -> ${toRegion} 이사 예정일`],
    newReview: ['새로운 리뷰'],
  };

  const message = MESSAGE_MAP[messageType] || '';
  const highlight = HIGHLIGHT_WORDS[messageType] || [];

  if (!message) {
    throw new Error(`유효하지 않은 messageType: ${messageType}`);
  }

  try {
    // 알림 생성
    const newAlarm = await prisma.notification.create({
      data: {
        userId,
        message,
        highlight,
        url,
      },
    });
    return newAlarm;
  } catch (error) {
    console.error('알림 생성 실패:', error);
    throw new Error('알림 생성 중 오류가 발생했습니다.');
  }
}
