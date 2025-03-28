import { Prisma } from '@prisma/client';

export interface InfoEditType {
  where: Prisma.UserWhereUniqueInput;
  data: Omit<Prisma.UserUpdateInput, 'email' | 'user_type'>;
}
