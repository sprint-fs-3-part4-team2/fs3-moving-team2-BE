import { Request, Response } from 'express';
import * as notificationService from '../service/notificationService';

export async function getNotifications(req: Request, res: Response) {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      res.status(401).json({ message: '유저 id를 확인할 수 없습니다' });
      return;
    }
    const notifications = await notificationService.getNotificationsInfo(userId);
    if (!notifications) {
      res.status(401).json({ message: '유저를 찾을 수 없습니다' });
      return;
    }

    res.status(200).json({ data: notifications });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: '조회 실패!' });
  }
}

export async function updateToRead(req: Request, res: Response) {
  try {
    const userId = req.user?.userId;
    const notificationId = req.params.id;

    if (!userId) {
      res.status(401).json({ message: '유저 id를 확인할 수 없습니다' });
      return;
    }

    if (!notificationId) {
      res.status(400).json({ message: '알림 id가 필요합니다' });
      return;
    }

    const updatedNotification = await notificationService.updateRead(notificationId);

    res.status(200).json({ message: '수정완료', data: updatedNotification });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: '수정 실패!' });
  }
}

// export async function createNotification(req: Request, res: Response) {
//   // userId, message, url,
//   try {
//     const { userId } = req.params;

// const MESSAGE_MAP: Record<string, string> = {
//   quoteRequest: "견적 요청이 도착했습니다.",
//   quoteConfirm: "견적이 확정되었습니다.",
// }

//     if (!userId) {
//       res.status(400).json({ message: '알림 보낼 유저를 찾을 수 없습니다.' });
//       return;
//     }
//     const { message, url, type } = req.body;
//     const newAlarm = await notificationService.createNotification({ userId, message, url });
//     res.status(201).json({ message: '알림 등록 성공', data: newAlarm });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ message: '알림 등록 실패' });
//   }
// }
