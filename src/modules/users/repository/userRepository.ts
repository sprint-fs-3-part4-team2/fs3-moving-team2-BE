import prismaClient from '@/prismaClient';
import { InfoEditType } from '../types/repo.type';
import { Request } from 'express';
import { UserType } from '@prisma/client';

class UserRepository {
  user: Request['user'];
  constructor(user: Request['user']) {
    this.user = user;
  }
  async userEdit({ data, where }: InfoEditType): Promise<boolean> {
    const { name, password, phoneNumber } = data;
    const { currentPassword } = where;

    if (!this.user) return false;

    try {
      const confirm: boolean = !!(await prismaClient.user.update({
        where: {
          id: this.user.userId,
          userType: this.user.type.toUpperCase() as UserType,
          password: currentPassword,
        },
        data: {
          name,
          password,
          phoneNumber,
        },
      }));
      return confirm;
    } catch (err: any) {
      console.error('userReository edit error', err);
      return false;
    }
  }
}

export default UserRepository;
