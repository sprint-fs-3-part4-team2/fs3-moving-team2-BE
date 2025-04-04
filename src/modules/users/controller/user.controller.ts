import { Request, Response } from 'express';
import UserService from '../service/user.service';
import { EditBaiscInfoBody } from '../types/type';

export default class UserController {
  constructor(private userService: UserService) {}

  getMoverBasicInfo = async (req: Request, res: Response) => {
    const userId = req.user?.userId ?? '';
    const userType = req.user?.type ?? '';
    if (!userType || !userId) return res.status(200).json(null);

    const data = await this.userService.mbiGet(req.user);

    res.status(200).json({ ok: true, data });
  };

  patchMoverBasicInfo = async (req: Request, res: Response) => {
    const { current_password, new_password, phoneNumber, name }: EditBaiscInfoBody = req.body;

    const userId = req.user?.userId ?? '';
    const userType = req.user?.type ?? '';
    if (!userType || !userId) return res.status(200).json(null);

    const data = await this.userService.mbiEdit(
      {
        new_password: new_password,
        current_password: current_password,
        phoneNumber,
        name,
      },
      req.user,
    );

    if (!data) {
      res.status(204).json({ ok: false });
      return;
    }

    res.status(200).json({
      ok: true,
      message: '프로필 수정이 완료됐습니다.',
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
