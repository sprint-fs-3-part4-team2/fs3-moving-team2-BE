import { Prisma } from '@prisma/client';

export interface InfoEditType {
  where: Pick<Prisma.UserWhereUniqueInput, 'email' | 'user_type'>;
  data: Omit<Prisma.UserUpdateInput, 'email' | 'user_type'>;
}
