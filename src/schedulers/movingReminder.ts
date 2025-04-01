import cron from 'node-cron';
import { PrismaClient } from '@prisma/client';
import { createNotification } from '../modules/notification/service/notificationService'; // 알림 전송 함수

const prisma = new PrismaClient();

export function startNotificationScheduler() {
  console.log('알림 스케줄러 시작됨');

  // 매일 자정(00:00)에 실행 '* * * * *' <- 테스트용 1분
  cron.schedule('0 0 * * *', async () => {
    try {
      console.log('내일 이사할 고객을 찾는 중...');

      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const startOfTomorrow = new Date(tomorrow.setHours(0, 0, 0, 0));
      const endOfTomorrow = new Date(tomorrow.setHours(23, 59, 59, 999));

      // 확정된 견적 (QuoteMatch) 중 내일 이사하는 건 조회
      const confirmedQuotes = await prisma.quoteMatch.findMany({
        where: {
          moverQuote: {
            quoteRequest: {
              moveDate: {
                gte: startOfTomorrow,
                lt: endOfTomorrow,
              },
            },
          },
        },
        include: {
          moverQuote: {
            include: {
              quoteRequest: {
                include: {
                  quoteRequestAddresses: true, // 출발지, 도착지 정보 가져오기
                },
              },
              mover: true, // 이사업자 정보 가져오기
            },
          },
        },
      });
      if (!confirmedQuotes || confirmedQuotes.length === 0) {
        console.log('내일 이사 없음!');
        return;
      }

      const notifiedUsers = new Set<string>(); // 중복 알림 방지
      const notificationPromises: Promise<any>[] = []; // 병렬 실행

      for (const quoteMatch of confirmedQuotes) {
        const quoteRequest = quoteMatch.moverQuote.quoteRequest;
        const mover = quoteMatch.moverQuote.mover;

        if (!quoteRequest || !mover) continue; // 데이터가 없으면 패스

        const customerId = quoteRequest.customerId;
        const moverId = mover.id;

        // console.log('customerId', customerId);
        // console.log('moverId', moverId);

        // 출발지 & 도착지 가져오기
        const fromRegion =
          quoteRequest.quoteRequestAddresses.find((a) => a.type === 'DEPARTURE')?.sido || '출발지';
        const toRegion =
          quoteRequest.quoteRequestAddresses.find((a) => a.type === 'ARRIVAL')?.sido || '도착지';

        // 고객과 기사의 userId 조회 (병렬 실행)
        const [customerUser, moverUser] = await Promise.all([
          customerId ? prisma.customer.findUnique({ where: { id: customerId } }) : null,
          moverId ? prisma.mover.findUnique({ where: { id: moverId } }) : null,
        ]);

        if (!customerUser || !moverUser) {
          console.log('유저 확인 불가');
          return;
        }
        // console.log('🔍 고객 유저 정보:', customerUser);
        // console.log('🔍 기사 유저 정보:', moverUser);

        // 고객에게 알림 보내기 (중복 방지)
        if (customerUser?.id && !notifiedUsers.has(customerUser.id)) {
          notificationPromises.push(
            createNotification({
              userId: customerUser.userId,
              messageType: 'dayBefore',
              fromRegion,
              toRegion,
            }),
          );
          console.log(`고객(${customerUser.userId})에게 알림 생성`);
          notifiedUsers.add(customerUser.userId);
        }

        // 기사에게 알림 보내기 (중복 방지)
        if (moverUser?.id && !notifiedUsers.has(moverUser.id)) {
          notificationPromises.push(
            createNotification({
              userId: moverUser.userId,
              messageType: 'dayBefore',
              fromRegion,
              toRegion,
            }),
          );
          console.log(`기사(${moverUser.userId})에게 알림 생성`);
          notifiedUsers.add(moverUser.userId);
        }
      }

      // 알림을 병렬로 실행
      await Promise.all(notificationPromises);
      console.log('내일 이사할 고객이랑 기사에게 알림 전송 완료!');
      // console.log(notificationPromises);
    } catch (err) {
      console.error('알림 스케줄링 오류:', err);
    }
  });
}
