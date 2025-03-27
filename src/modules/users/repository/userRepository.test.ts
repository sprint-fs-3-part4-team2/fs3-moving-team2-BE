// import prismaClient from '@/prismaClient';
// import UserRepository from './userRepository'; // 경로는 실제 파일 위치에 맞게 조정
// import { InfoEditType } from '../types/repo.type';

// // prismaClient를 모킹합니다.
// jest.mock('@/prismaClient', () => ({
//   user: {
//     update: jest.fn(),
//   },
// }));

// describe('UserRepository', () => {
//   const mockUser = {
//     userId: '123',
//     roleId: '123',
//     type: 'customer' as 'customer' | 'mover',
//   };

//   const validInfoEdit: InfoEditType = {
//     data: {
//       name: 'Test User',
//       password: 'newPassword',
//       phoneNumber: '010-1234-5678',
//     },
//     where: {
//       currentPassword: 'currentPassword',
//     },
//   };

//   afterEach(() => {
//     jest.clearAllMocks();
//   });

//   it('성공', async () => {
//     // prismaClient.user.update가 성공적으로 업데이트된 결과를 반환하는 경우
//     (prismaClient.user.update as jest.Mock).mockResolvedValue({
//       id: mockUser.userId,
//       ...validInfoEdit.data,
//     });

//     const userRepository = new UserRepository(mockUser);
//     const result = await userRepository.userEdit(validInfoEdit);

//     expect(result).toBe(true);
//     expect(prismaClient.user.update).toHaveBeenCalledWith({
//       where: {
//         id: mockUser.userId,
//         userType: mockUser.type.toUpperCase(),
//         password: validInfoEdit.where.currentPassword,
//       },
//       data: {
//         name: validInfoEdit.data.name,
//         password: validInfoEdit.data.password,
//         phoneNumber: validInfoEdit.data.phoneNumber,
//       },
//     });
//   });

//   it('에러', async () => {
//     (prismaClient.user.update as jest.Mock).mockRejectedValue(new Error('Update error'));

//     const userRepository = new UserRepository(mockUser);
//     const result = await userRepository.userEdit(validInfoEdit);
//     expect(result).toBe(false);
//     expect(prismaClient.user.update).toHaveBeenCalled();
//   });
// });
