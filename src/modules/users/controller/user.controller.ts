import { Request, Response } from 'express';
import UserService from '../service/user.service';
import { EditBaiscInfoBody } from '../types/type';

export default class UserController {
  constructor(private userService: UserService) {}

  getMoverBasicInfo = async (req: Request, res: Response) => {
    const userId = req.userInfo?.userId ?? '';
    const userType = req.userInfo?.type ?? '';
    if (!userType || !userId) return res.status(200).json(null);

    const data = await this.userService.mbiGet(req.userInfo);

    res.status(200).json({ ok: true, data });
  };

  patchMoverBasicInfo = async (req: Request, res: Response) => {
    const { current_password, new_password, phoneNumber, name }: EditBaiscInfoBody = req.body;

    const userId = req.userInfo?.userId ?? '';
    const userType = req.userInfo?.type ?? '';
    if (!userType || !userId) return res.status(200).json(null);

    const { data, message } = await this.userService.mbiEdit(
      {
        new_password: new_password,
        current_password: current_password,
        phoneNumber,
        name,
      },
      req.userInfo,
    );
    if (!data) {
      return res.status(203).json({ ok: false, message });
    }

    res.status(200).json({
      ok: true,
      message,
      data,
    });
  };

  getMe = async (req: Request, res: Response) => {
    const userId = req.userInfo?.userId ?? '';
    const userType = req.userInfo?.type ?? '';
    if (!userType || !userId) return res.status(200).json(null);
    const userData = await this.userService.getMe(userId, userType);

    return res.status(200).json(userData);
  };
}
