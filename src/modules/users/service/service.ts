import userRepository from '../repository/userRepository';
import { EditBaiscInfoBody } from '../types/type';

// mover basic info edit
async function mbiEdit(body: Omit<EditBaiscInfoBody, 'current_password'>) {
  const { email, new_password, user_type, phone_number, name } = body;
  const confirm: boolean = await userRepository.userEdit({
    where: {
      email,
      user_type,
    },
    data: {
      password: new_password,
      phone_number,
      name,
    },
  });
  let message = '수정 됐습니다';
  if (!confirm) message = '회원 정보 불일치';
  return {
    success: confirm,
    message,
  };
}

const userService = {
  mbiEdit,
};
export default userService;
