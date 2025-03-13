import { NextFunction, Request, Response } from 'express';
import { EditBaiscInfoBody } from '../types/type';
import userService from '../service/service';

class UserController {
  constructor() {}

  static async MoverBaiscInfoEdit(req: Request, res: Response) {
    const {
      email,
      current_password,
      new_password,
      user_type,
      phone_number,
      name,
    }: EditBaiscInfoBody = req.body;
    const service = new userService({ userId: req.user?.userId || '1234' });

    if (user_type !== 'MOVER') {
      res.status(403).json({
        success: false,
        message: '권한 없음',
      });
      return;
    }

    // hash 비교 코드 필요
    const { success, message } = await service.mbiEdit({
      new_password,
      phone_number,
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
