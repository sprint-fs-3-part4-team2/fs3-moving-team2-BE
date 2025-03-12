import { NextFunction, Request, Response } from 'express';
import { EditBaiscInfoBody } from '../types/type';
import userService from '../service/service';

async function MoverBaiscInfoEdit(req: Request, res: Response, next: NextFunction) {
  const {
    email,
    current_password,
    new_password,
    user_type,
    phone_number,
    name,
  }: EditBaiscInfoBody = req.body;

  // hash 비교 코드 필요
  const { success, message } = await userService.mbiEdit({
    email,
    new_password,
    user_type,
    phone_number,
    name,
  });
  console.log(success, message);
  res.status(success ? 200 : 400).json({
    success,
    message,
  });
}

const userController = {
  MoverBaiscInfoEdit,
};
export default userController;
