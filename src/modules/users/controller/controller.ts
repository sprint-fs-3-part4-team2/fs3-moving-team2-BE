import { Request, Response } from 'express';
import { EditBaiscInfoBody } from '../types/type';
import userService from '../service/service';

class UserController {
  constructor() {}

  static async MoverBaiscInfoEdit(req: Request, res: Response) {
    const { currentPassword, newPassword, userType, phoneNumber, name }: EditBaiscInfoBody =
      req.body;

    // 로그인 로직이 생기면 수정 필요함
    const service = new userService({
      userId: 'cm8ib1a9g0000iu5zu6t5d6ug',
      roleId: '',
      type: userType,
      // userId: req.user?.userId || '1234',
      // type: req.user?.type || 'mover',
    });

    if (userType !== 'mover') {
      res.status(403).json({
        success: false,
        message: '권한 없음',
      });
      return;
    }

    // hash 비교 코드 필요
    const { success, message } = await service.mbiEdit({
      newPassword,
      currentPassword,
      phoneNumber,
      name,
    });

    console.log(success, message);
    res.status(success ? 200 : 400).json({
      success,
      message,
    });
  }
}

export default UserController;
