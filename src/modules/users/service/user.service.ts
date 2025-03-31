import { Request } from 'express';
import UserRepository from '../repository/user.repository';
import { EditBaiscInfoBody } from '../types/type';
import { LowercaseUserType } from '@/types/userType.types';

export default class UserService {
  constructor(private userRepository: UserRepository) {}

  async mbiEdit(body: Omit<EditBaiscInfoBody, 'email' | 'userType'>, user: Request['user']) {
    const { newPassword, phoneNumber, name, currentPassword } = body;
    const userId = user?.userId ?? '';

    const updatedProfile = await this.userRepository.userEdit({
      where: {
        id: userId,
        password: currentPassword,
      },
      data: {
        password: newPassword,
        phoneNumber,
        name,
      },
    });

    return updatedProfile;
  }

  async getMe(userId: string, type: LowercaseUserType) {
    const me = await this.userRepository.findById(userId);
    const profile = me?.[type];
    const result = {
      email: me?.email,
      name: me?.name,
      phoneNumber: me?.phoneNumber,
      userType: me?.userType.toLowerCase(),
      profile: profile
        ? {
            ...profile,
            createdAt: undefined,
            updatedAt: undefined,
          }
        : null,
    };

    return result;
  }
}
