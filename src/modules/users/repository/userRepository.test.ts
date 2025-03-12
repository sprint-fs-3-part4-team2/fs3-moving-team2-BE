import prismaClient from '@/prismaClient';
import userRepository from './userRepository';
import { InfoEditType } from '../types/repo.type';

jest.mock('@/prismaClient', () => ({
  user: {
    update: jest.fn(),
  },
}));

describe('userRepository.userEdit', () => {
  const testInfo: InfoEditType = {
    where: { email: 'test@example.com', user_type: 'MOVER' },
    data: {
      name: 'tester',
      password: 'test1234', // hash 필요함
      phone_number: '01012345678',
    },
  };

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('정보수정 성공', async () => {
    (prismaClient.user.update as jest.Mock).mockResolvedValue(testInfo.data);

    const result = await userRepository.userEdit(testInfo);

    expect(prismaClient.user.update).toHaveBeenCalledWith({
      where: {
        email: testInfo.where.email,
        user_type: testInfo.where.user_type,
      },
      data: {
        name: testInfo.data.name,
        password: testInfo.data.password,
        phone_number: testInfo.data.phone_number,
      },
    });
    expect(result).toBe(true);
  });

  it('정보수정 실패', async () => {
    (prismaClient.user.update as jest.Mock).mockRejectedValue(new Error('Update error'));

    const result = await userRepository.userEdit(testInfo);

    expect(prismaClient.user.update).toHaveBeenCalled();
    expect(result).toBe(false);
  });
});
