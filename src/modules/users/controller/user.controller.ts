import { Request, Response } from 'express';
import UserService from '../service/user.service';
import { EditBaiscInfoBody } from '../types/type';
import { createNotification } from '@/modules/notification/service/notificationService';

export default class UserController {
  constructor(private userService: UserService) {}

  moverBasicInfoEdit = async (req: Request, res: Response) => {
    const { currentPassword, newPassword, phoneNumber, name }: EditBaiscInfoBody = req.body;

    const user = req.user
      ? req.user
      : ({ userId: 'cm8r03ll90000iuux1x0r69ce', roleId: '', type: 'mover' } as Request['user']);
    // hash 비교 코드 필요
    const data = await this.userService.mbiEdit(
      {
        newPassword,
        currentPassword,
        phoneNumber,
        name,
      },
      user,
    );

    if (!data.ok) {
      res.status(204).json({ ok: false });
      return;
    }

    await createNotification({ userId: user!.userId, messageType: 'newReview' });
    res.status(200).json({
      ok: true,
      data,
    });
  };

  getMe = async (req: Request, res: Response) => {
    const userId = req.user?.userId ?? '';
    const userType = req.user?.type ?? '';
    if (!userType || !userId) return res.status(200).json(null);
    const userData = await this.userService.getMe(userId, userType);

    return res.status(200).json(userData);
  };
}
