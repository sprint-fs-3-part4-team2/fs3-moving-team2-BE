import { Request } from 'express';
import UserRepository from '../repository/user.repository';
import { EditBaiscInfoBody } from '../types/type';

export default class UserService {
  constructor(private userRepository: UserRepository) {}

  async mbiEdit(body: Omit<EditBaiscInfoBody, 'email' | 'userType'>, user: Request['user']) {
    const { newPassword, phoneNumber, name, currentPassword } = body;
    const userId = user?.userId ?? '';

    const updatedProfile = await this.userRepository.userEdit(
      {
        where: {
          id: userId,
          currentPassword,
        },
        data: {
          password: newPassword,
          phoneNumber,
          name,
        },
      },
      user!,
    );

    return updatedProfile;
  }
}
