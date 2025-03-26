import { Request, Response } from 'express';
import UserService from '../service/user.service';
import { EditBaiscInfoBody } from '../types/type';

export default class UserController {
  constructor(private userService: UserService) {}

  moverBasicInfoEdit = async (req: Request, res: Response) => {
    const { currentPassword, newPassword, userType, phoneNumber, name }: EditBaiscInfoBody =
      req.body;

    const user = req.user;

    // 로그인 로직이 생기면 수정 필요함

    if (userType !== 'mover') {
      res.status(403).json({
        success: false,
        message: '권한 없음',
      });
      return;
    }

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

    res.status(200).json(data);
  };
}
