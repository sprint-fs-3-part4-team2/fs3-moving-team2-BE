import { Prisma } from '@prisma/client';

export interface InfoEditType {
  where: Pick<Prisma.UserWhereUniqueInput & { currentPassword: string }, 'id' | 'currentPassword'>;
  data: Omit<Prisma.UserUpdateInput, 'email' | 'user_type'>;
}
