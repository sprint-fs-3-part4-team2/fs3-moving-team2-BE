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

  // mover basic info edit
  async mbiEdit(body: Pick<EditBaiscInfoBody, 'new_password' | 'phone_number' | 'name'>) {
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
