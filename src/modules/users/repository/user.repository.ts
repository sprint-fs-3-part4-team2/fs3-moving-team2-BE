import { PrismaClient, UserType } from '@prisma/client';
import { InfoEditType } from '../types/repo.type';
import { SignUpRequest } from '@/structs/authStruct';

// interface User {
//   userId: string;
//   type: 'mover' | 'customer';
// }

export default class UserRepository {
  constructor(private prismaClient: PrismaClient) {}

  async userEdit({ data, where }: InfoEditType) {
    try {
      const result = await this.prismaClient.user.update({
        where,
        data,
      });
      console.table(result ?? {});
      return { ok: true, data: result };
    } catch (err: any) {
      return { ok: false, code: err.code, message: 'repository {userEdit} error' };
    }
  }

  async findById(userId: string) {
    return await this.prismaClient.user.findUnique({
      where: {
        id: userId,
      },
      include: {
        customer: true,
        mover: true,
      },
    });
  }

  async findByEmail(email: string) {
    return await this.prismaClient.user.findUnique({
      where: {
        email,
      },
      include: {
        customer: true,
        mover: true,
      },
    });
  }

  async create(data: SignUpRequest, type: UserType) {
    return await this.prismaClient.user.create({
      data: {
        email: data.email,
        password: data.password,
        name: data.name,
        phoneNumber: data.phoneNumber.toString(),
        userType: type,
      },
    });
  }
}
