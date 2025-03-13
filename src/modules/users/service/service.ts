import { Request } from 'express';
import UserRepository from '../repository/userRepository';
import { EditBaiscInfoBody } from '../types/type';

class userService {
  repository: UserRepository;
  user: Request['user'];
  constructor(user: Request['user']) {
    this.user = user;
    this.repository = new UserRepository(user);
  }
  async mbiEdit(body: Omit<EditBaiscInfoBody, 'current_password' | 'email' | 'user_type'>) {
    const { new_password, phone_number, name } = body;
    const updated: boolean = await this.repository.userEdit({
      where: {
        id: this.user?.userId,
      },
      data: {
        password: new_password,
        phone_number,
        name,
      },
    });
    let message = '수정 됐습니다';
    if (!updated) message = '회원 정보 불일치';
    return {
      success: updated,
      message,
    };
  }
}

export default userService;
