import { Request, Response } from 'express';
import * as notificationService from '../service/notificationService';

export async function getNotifications(req: Request, res: Response) {
  try {
    // const userId = req.user?.userId ?? '123';
    const userId = 'cm8e7iwp80003votcone90fqc';

    if (!userId) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }
    const notifications = await notificationService.getNotificationsInfo(userId);

    res.status(200).json({ data: notifications });
  } catch (err) {
    console.error(err);
    res.status(404).json({ message: '조회 실패!' });
  }
}

export async function updateToRead(req: Request, res: Response) {
  try {
    // const userId = req.user?.userId ?? '123';
    const userId = 'cm8e7iwp80003votcone90fqc';
    if (!userId) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }
    const notificationId = req.params.id;

    const updatedNotification = await notificationService.updateRead(notificationId);

    res.status(200).json({ message: '수정완료', data: updatedNotification });
  } catch (err) {
    console.error(err);
    res.status(404).json({ message: '수정 실패!' });
  }
}
