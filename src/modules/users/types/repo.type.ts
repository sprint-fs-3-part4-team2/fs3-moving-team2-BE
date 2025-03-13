import { Prisma } from '@prisma/client';

export interface InfoEditType {
  where: Pick<Prisma.UserWhereUniqueInput, 'id'>;
  data: Omit<Prisma.UserUpdateInput, 'email' | 'user_type'>;
}
