import prismaClient from '@/prismaClient';
import { InfoEditType } from '../types/repo.type';

async function userEdit({ where, data }: InfoEditType): Promise<boolean> {
  const { email, user_type } = where;
  const { name, password, phone_number } = data;
  try {
    const confirm = await prismaClient.user.update({
      where: {
        email,
        user_type,
      },
      data: {
        name,
        password,
        phone_number,
      },
    });
    return !!confirm;
  } catch (err: any) {
    console.error('userReository edit error', err);
    return false;
  }
}

// 통합
const userRepository = { userEdit };
export default userRepository;
