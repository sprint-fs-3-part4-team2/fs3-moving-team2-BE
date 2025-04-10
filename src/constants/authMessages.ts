export const AUTH_MESSAGES = {
  read: '로그인한 사용자만 접근할 수 있습니다.',
  create: '로그인한 사용자만 작성할 수 있습니다.',
  delete: '작성자만 삭제할 수 있습니다.',
  update: '작성자만 수정할 수 있습니다.',
  refreshTokenExpired: 'refreshToken이 만료되었습니다.',
  needRefreshToken: 'refreshToken이 필요합니다.',
  invalidRefreshToken: '유효하지 않은 refreshToken 입니다.',
  invalidPassword: '비밀번호가 일치하지 않습니다.',
  needLogin: '로그인이 필요합니다.',
  forbidden: '접근 권한이 없습니다.',
  onlyForMover: '기사님만 접근할 수 있습니다.',
  OnlyForCustomer: '일반 사용자만 접근할 수 있습니다.',
  emailNotExist: '존재하지 않는 이메일입니다.',
  invalidRole: {
    customer: '중복된 이메일의 기사님 계정이 존재합니다.',
    mover: '중복된 이메일의 일반 사용자 계정이 존재합니다.',
  },
};
