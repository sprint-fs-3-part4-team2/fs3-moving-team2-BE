import prismaClient from '@/prismaClient';
import { Request } from 'express';
import { InfoEditType } from '../types/repo.type';
import userRepository from './userRepository';

jest.mock('@/prismaClient', () => ({
  user: {
    update: jest.fn(),
  },
}));

describe('userRepository.userEdit', () => {
  let repository: userRepository;

  beforeEach(() => {
    const mockUser: Request['user'] = { userId: '123', type: 'mover' };
    repository = new userRepository(mockUser);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  const testInfo: InfoEditType = {
    where: { id: '123' },
    data: {
      name: 'new name',
      password: 'newPassword', // hash 필요
      phoneNumber: '01012345678', // 010-0000-0000 ?
    },
  };

  it('successful', async () => {
    (prismaClient.user.update as jest.Mock).mockResolvedValue(testInfo.data);

    const result = await repository.userEdit(testInfo);

    expect(prismaClient.user.update).toHaveBeenCalledWith({
      where: { id: testInfo.where.id },
      data: {
        name: testInfo.data.name,
        password: testInfo.data.password,
        phoneNumber: testInfo.data.phoneNumber,
      },
    });
    expect(result).toBe(true);
  });

  it('fails', async () => {
    (prismaClient.user.update as jest.Mock).mockRejectedValue(new Error('update failed'));

    const result = await repository.userEdit(testInfo);

    expect(prismaClient.user.update).toHaveBeenCalled();
    expect(result).toBe(false);
  });
});
