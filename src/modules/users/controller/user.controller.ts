import { Request, Response } from 'express';
import UserService from '../service/user.service';
import { EditBaiscInfoBody } from '../types/type';

export default class UserController {
  constructor(private userService: UserService) {}

  getMoverBasicInfo = async (req: Request, res: Response) => {
    try {
      const user = req.user;
      if (!user) {
        res.status(401).json({ ok: false, message: '유저 조회 실패' });
        return;
      }
      const data = await this.userService.mbiGet(user);

      res.status(200).json({ ok: true, data });
    } catch (err) {
      res.status(204).json({ ok: false, err });
    }
  };

  patchMoverBasicInfo = async (req: Request, res: Response) => {
    try {
      const { current_password, new_password, phoneNumber, name }: EditBaiscInfoBody = req.body;

      const user = req.user;
      if (!user) {
        res.status(401).json({ ok: false });
        return;
      }

      const data = await this.userService.mbiEdit(
        {
          new_password: new_password,
          current_password: current_password,
          phoneNumber,
          name,
        },
        user,
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
    } catch (err) {
      res.status(204).json({ ok: false, err });
    }
  };
}
