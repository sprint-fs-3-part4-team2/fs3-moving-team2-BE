import { Request } from 'express';
import UserRepository from '../repository/user.repository';
import { EditBaiscInfoBody } from '../types/type';
import { LowercaseUserType } from '@/types/userType.types';
import bcrypt from 'bcrypt';

const NOUSER = '유저를 찾을 수 없습니다.';
const USER_AUTH_FAIL = '유저 정보 인증 실패';

export default class UserService {
  constructor(private userRepository: UserRepository) {}

  async mbiGet(user: Request['user']) {
    if (!user) throw new Error(NOUSER);
    const userId = user.userId;

    const userInfo = await this.userRepository.findById(userId);
    if (!userInfo) throw new Error(NOUSER);
    return { name: userInfo.name, phoneNumber: userInfo.phoneNumber, email: userInfo.email };
  }

  async mbiEdit(body: Omit<EditBaiscInfoBody, 'email' | 'userType'>, user: Request['user']) {
    const { new_password, phoneNumber, name, current_password } = body;
    if (!user) throw new Error(NOUSER);
    const userId = user.userId;

    const userCurrentPassword = await this.userRepository.findByIdReturnPassword(userId);
    if (typeof userCurrentPassword !== 'string') throw { message: '유저가 정보 오류' };

    const match = await bcrypt.compare(current_password, userCurrentPassword);
    if (!match) return { message: '비밀번호가 일치하지 않습니다.' };

    const hashPw = await bcrypt.hash(new_password, 10);
    const updatedProfile = await this.userRepository.userEdit({
      where: {
        id: userId,
      },
      data: {
        password: hashPw,
        phoneNumber,
        name,
      },
    });

    return {
      data: updatedProfile,
      message: '프로필 수정이 완료되었습니다.',
    };
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
