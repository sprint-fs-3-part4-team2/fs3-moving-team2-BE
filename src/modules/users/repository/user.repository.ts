import { PrismaClient, UserType } from '@prisma/client';
import { InfoEditType } from '../types/repo.type';
import { SignUpRequest } from '@/structs/authStruct';

interface User {
  userId: string;
  type: 'mover' | 'customer';
}

export default class UserRepository {
  constructor(private prismaClient: PrismaClient) {}

  async userEdit({ data, where }: InfoEditType, user: User) {
    const { name, password, phoneNumber } = data;
    const { currentPassword } = where;

    const confirm = await this.prismaClient.user.update({
      where: {
        id: user.userId,
        userType: user.type.toUpperCase() as UserType,
        password: currentPassword,
      },
      data: {
        name,
        password,
        phoneNumber,
      },
    });
    return confirm;
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
