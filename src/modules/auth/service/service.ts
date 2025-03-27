import { AUTH_MESSAGES } from '@/constants/authMessages';
import { EXCEPTION_MESSAGES } from '@/constants/exceptionMessages';
import { ConflictException } from '@/core/errors';
import { UnauthorizedException } from '@/core/errors/unauthorizedException';
import { generateTokens } from '@/core/security/jwt';
import UserRepository from '@/modules/users/repository/user.repository';
import { SignInRequest, SignUpRequest } from '@/structs/authStruct';
import { LowercaseUserType } from '@/types/userType.types';
import { UserType } from '@prisma/client';
import axios from 'axios';
import bcrypt from 'bcrypt';

export default class AuthService {
  private SNS_AUTH_URLS = {
    google: `https://accounts.google.com/o/oauth2/auth?client_id=${process.env.GOOGLE_CLIENT_ID}&redirect_uri=${process.env.GOOGLE_REDIRECT_URI}&response_type=code&scope=email%20profile`,
    kakao: `https://kauth.kakao.com/oauth/authorize?client_id=${process.env.KAKAO_CLIENT_ID}&redirect_uri=${process.env.KAKAO_REDIRECT_URI}&response_type=code`,
    naver: `https://nid.naver.com/oauth2.0/authorize?client_id=${process.env.NAVER_CLIENT_ID}&redirect_uri=${process.env.NAVER_REDIRECT_URI}&response_type=code&state=RANDOM_STATE_VALUE`,
  };

  private SALT_ROUNDS = 10;

  constructor(private userRepository: UserRepository) {}

  async signIn({ email, password }: SignInRequest, type: LowercaseUserType) {
    const uppercaseType = type.toUpperCase() as UserType;
    const userEntity = await this.userRepository.findByEmail(email);
    if (!userEntity) throw new UnauthorizedException(AUTH_MESSAGES.emailNotExist);
    if (userEntity.userType !== uppercaseType)
      throw new ConflictException(AUTH_MESSAGES.invalidRole);

    const isPasswordValid = await bcrypt.compare(password, userEntity?.password);
    if (!isPasswordValid) throw new UnauthorizedException(AUTH_MESSAGES.invalidPassword);

    const roleId =
      type === 'mover' ? (userEntity.mover?.id ?? '') : (userEntity.customer?.id ?? '');
    const tokens = generateTokens(userEntity.id, roleId, type);

    return {
      tokens,
      user: {
        email: userEntity.email,
        name: userEntity.name,
        phoneNumber: userEntity.phoneNumber,
      },
    };
  }

  async signUp(signUpDto: SignUpRequest, type: LowercaseUserType) {
    const uppercaseType = type.toUpperCase() as UserType;
    const existingUserByEmail = await this.userRepository.findByEmail(signUpDto.email);
    if (existingUserByEmail) throw new ConflictException(EXCEPTION_MESSAGES.duplicatedEmail);

    const encryptedPassword = await bcrypt.hash(signUpDto.password, this.SALT_ROUNDS);
    const userEntity = await this.userRepository.create(
      { ...signUpDto, password: encryptedPassword },
      uppercaseType,
    );

    const roleId = '';
    const tokens = generateTokens(userEntity.id, roleId, type);

    return {
      tokens,
      user: {
        email: userEntity.email,
        name: userEntity.name,
        phoneNumber: userEntity.phoneNumber,
      },
    };
  }

  fakeSignIn(userId: string, roleId: string, type: LowercaseUserType) {
    const tokens = generateTokens(userId, roleId, type);
    return tokens;
  }

  // 작업 진행 중
  getSnsLoginUrl = (provider: keyof typeof this.SNS_AUTH_URLS) => {
    if (!this.SNS_AUTH_URLS[provider]) {
      throw new Error('지원하지 않는 로그인 제공자입니다.');
    }
    return this.SNS_AUTH_URLS[provider];
  };

  async handleGoogleCallback(code: string) {
    try {
      const tokenResponse = await axios.post('https://oauth2.googleapis.com/token', {
        code,
        client_id: process.env.GOOGLE_CLIENT_ID,
        client_secret: process.env.GOOGLE_CLIENT_SECRET,
        redirect_uri: process.env.GOOGLE_REDIRECT_URI,
        grant_type: 'authorization_code',
      });

      const { access_token } = tokenResponse.data;

      const userInfoResponse = await axios.get('https://www.googleapis.com/oauth2/v2/userinfo', {
        headers: { Authorization: `Bearer ${access_token}` },
      });
    } catch (error) {
      console.error('Google Oauth 오류', error);
      throw new Error('Google 로그인 중 오류가 발생했습니다.');
    }
  }
}
