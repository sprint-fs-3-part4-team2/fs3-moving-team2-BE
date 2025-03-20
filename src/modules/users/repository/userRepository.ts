import prismaClient from '@/prismaClient';
import { InfoEditType } from '../types/repo.type';
import { Request } from 'express';

class UserRepository {
  user: Request['user'];
  constructor(user: Request['user']) {
    this.user = user;
  }
  async userEdit({ data }: InfoEditType): Promise<boolean> {
    const { name, password, phoneNumber } = data;
    if (!this.user) return false;
    try {
      const confirm: boolean = !!(await prismaClient.user.update({
        where: {
          id: this.user.userId,
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
