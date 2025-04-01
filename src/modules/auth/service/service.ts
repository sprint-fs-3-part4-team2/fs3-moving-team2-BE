import { AUTH_MESSAGES } from '@/constants/authMessages';
import { EXCEPTION_MESSAGES } from '@/constants/exceptionMessages';
import { ConflictException, NotFoundException } from '@/core/errors';
import { UnauthorizedException } from '@/core/errors/unauthorizedException';
import { generateTokens } from '@/core/security/jwt';
import UserRepository from '@/modules/users/repository/user.repository';
import { SignInRequest, SignUpRequest } from '@/structs/authStruct';
import { LowercaseUserType } from '@/types/userType.types';
import { UserType } from '@prisma/client';
import axios from 'axios';
import bcrypt from 'bcrypt';
import { OauthUserInfo } from '../types/userInfo.types';
import { getUniqueKoreanPhrase } from '@/utils/getUniqueKoreanPhrase';

export default class AuthService {
  private scopes = encodeURIComponent(
    'email profile https://www.googleapis.com/auth/user.phonenumbers.read',
  );
  private SNS_AUTH_URLS = {
    google: `https://accounts.google.com/o/oauth2/auth?client_id=${process.env.GOOGLE_CLIENT_ID}&redirect_uri=${process.env.GOOGLE_REDIRECT_URI}&response_type=code&scope=${this.scopes}&access_type=offline&prompt=consent`,
    kakao: `https://kauth.kakao.com/oauth/authorize?client_id=${process.env.KAKAO_CLIENT_ID}&redirect_uri=${process.env.KAKAO_REDIRECT_URI}&response_type=code`,
    naver: `https://nid.naver.com/oauth2.0/authorize?client_id=${process.env.NAVER_CLIENT_ID}&redirect_uri=${process.env.NAVER_REDIRECT_URI}&response_type=code&state=${process.env.NAVER_RANDOM_STATE}`,
  };

  private SALT_ROUNDS = 10;

  constructor(private userRepository: UserRepository) {}

  async signIn({ email, password }: SignInRequest, type: LowercaseUserType) {
    const uppercaseType = type.toUpperCase() as UserType;
    const userEntity = await this.userRepository.findByEmail(email);
    if (!userEntity) throw new NotFoundException(AUTH_MESSAGES.emailNotExist);
    if (userEntity.userType !== uppercaseType)
      throw new ConflictException(AUTH_MESSAGES.invalidRole);

    const isPasswordValid = await bcrypt.compare(password, userEntity?.password);
    if (!isPasswordValid) throw new UnauthorizedException(AUTH_MESSAGES.invalidPassword);

    const profile = userEntity[type];
    const tokens = generateTokens(userEntity.id, profile?.id ?? '', type);

    return {
      tokens,
      user: {
        email: userEntity.email,
        name: userEntity.name,
        phoneNumber: userEntity.phoneNumber,
        userType: type,
        profile: profile
          ? {
              ...profile,
              createdAt: undefined,
              updatedAt: undefined,
            }
          : null,
      },
    };
  }

  async signUp(signUpDto: SignUpRequest, type: LowercaseUserType) {
    const uppercaseType = type.toUpperCase() as UserType;
    const existingUserByEmail = await this.userRepository.findByEmail(signUpDto.email);
    if (existingUserByEmail?.userType === uppercaseType) {
      throw new ConflictException(AUTH_MESSAGES.invalidRole);
    }
    if (existingUserByEmail) throw new ConflictException(EXCEPTION_MESSAGES.duplicatedEmail);
    const { email, password, name, phoneNumber } = signUpDto;
    const formattedPhoneNumber = phoneNumber.replaceAll('-', '');

    const encryptedPassword = await bcrypt.hash(password, this.SALT_ROUNDS);
    const userEntity = await this.userRepository.create(
      { email, password: encryptedPassword, name, phoneNumber: formattedPhoneNumber },
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
        userType: type,
        profile: null,
      },
    };
  }

  fakeSignIn(userId: string, roleId: string, type: LowercaseUserType) {
    const tokens = generateTokens(userId, roleId, type);
    return tokens;
  }

  async findOrCreateUser(userInfo: OauthUserInfo, type: LowercaseUserType) {
    let user = await this.userRepository.findByEmail(userInfo.email);
    let token = {};
    const password = await bcrypt.hash('password1!', this.SALT_ROUNDS);
    if (!user) {
      user = await this.userRepository.createWithSocialLogin(
        {
          email: userInfo.email,
          password: password,
          name: userInfo.name,
          phoneNumber: userInfo.phoneNumber,
        },
        type.toUpperCase() as UserType,
        userInfo.provider,
        userInfo.providerId,
      );
      const userId = user.id;
      token = generateTokens(userId, '', type);
      const role = user[type];
      return {
        tokens: token,
        user: {
          id: userId,
          email: user.email,
          phoneNumber: user.phoneNumber,
          name: user.name,
          [type]: role,
        },
      };
    }

    if (user?.userType !== type.toUpperCase()) {
      throw new ConflictException('wrong type');
    }

    if (user && !user.socialLogin) {
      user = await this.userRepository.addSocialProvider(
        user.email,
        userInfo.provider,
        userInfo.providerId,
      );
      const role = user[type];
      token = generateTokens(user.id, user[type]?.id ?? '', type);
      return {
        tokens: token,
        user: {
          id: user.id,
          email: user.email,
          phoneNumber: user.phoneNumber,
          name: user.name,
          [type]: role,
        },
      };
    }

    if (user) {
      const roleId = type === 'mover' ? (user.mover?.id ?? '') : (user.customer?.id ?? '');
      token = generateTokens(user.id, roleId, type);

      return {
        tokens: token,
        user: {
          email: user.email,
          phoneNumber: user.phoneNumber,
          name: user.name,
          [type]: user[type],
        },
      };
    }
  }

  getSnsLoginUrl = (provider: keyof typeof this.SNS_AUTH_URLS, state?: string) => {
    if (!this.SNS_AUTH_URLS[provider]) {
      throw new Error('지원하지 않는 로그인 제공자입니다.');
    }

    let url = this.SNS_AUTH_URLS[provider];

    if (provider === 'naver' && state) {
      url = url.replace(
        `state=${process.env.NAVER_RANDOM_STATE}`,
        `state=${encodeURIComponent(state)}`,
      );
    } else if (state) {
      url += `&state=${encodeURIComponent(state)}`;
    }

    return url;
  };

  async handleGoogleCallback(
    code: string,
    provider: string,
    type: LowercaseUserType,
  ): Promise<any> {
    try {
      const tokenResponse = await axios.post('https://oauth2.googleapis.com/token', {
        code,
        client_id: process.env.GOOGLE_CLIENT_ID,
        client_secret: process.env.GOOGLE_CLIENT_SECRET,
        redirect_uri: process.env.GOOGLE_REDIRECT_URI,
        grant_type: 'authorization_code',
      });

      const { access_token } = tokenResponse.data;

      // People API 호출 부분을 다음과 같이 수정
      console.log('People API 호출 시작');
      const peopleResponse = await axios.get('https://people.googleapis.com/v1/people/me', {
        headers: { Authorization: `Bearer ${access_token}` },
        params: {
          personFields: 'phoneNumbers',
        },
      });

      // 응답 전체를 로그로 출력
      console.log('People API 응답:', JSON.stringify(peopleResponse.data, null, 2));

      if (peopleResponse.data.phoneNumbers && peopleResponse.data.phoneNumbers.length > 0) {
        const phoneNumber = peopleResponse.data.phoneNumbers[0].value;
        console.log('전화번호 찾음:', phoneNumber);
      } else {
        console.log('전화번호를 찾을 수 없음');
      }

      const { data } = await axios.get('https://www.googleapis.com/oauth2/v2/userinfo', {
        headers: { Authorization: `Bearer ${access_token}` },
      });

      console.log(data);

      const userInfo = {
        provider,
        providerId: data.id,
        email: data.email,
        name: data.name,
        phoneNumber: Date.now().toString(),
      };

      const response = await this.findOrCreateUser(userInfo, type);
      return response;
    } catch (error) {
      console.error('Google Oauth 오류', error);
      throw new Error('Google 로그인 중 오류가 발생했습니다.');
    }
  }

  async handleNaverCallback(code: string, provider: string, type: LowercaseUserType): Promise<any> {
    try {
      // 네이버 토큰 요청
      const tokenResponse = await axios.post(
        'https://nid.naver.com/oauth2.0/token',
        new URLSearchParams({
          grant_type: 'authorization_code',
          client_id: process.env.NAVER_CLIENT_ID as string,
          client_secret: process.env.NAVER_CLIENT_SECRET as string,
          code,
          state: process.env.NAVER_STATE as string,
        }).toString(),
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8',
          },
        },
      );

      const { access_token } = tokenResponse.data;

      const userInfoResponse = await axios.get('https://openapi.naver.com/v1/nid/me', {
        headers: {
          Authorization: `Bearer ${access_token}`,
        },
      });

      const naverUserInfo = userInfoResponse.data.response;
      const userInfo = {
        email: naverUserInfo.email,
        phoneNumber: naverUserInfo.mobile,
        name: naverUserInfo.name,
        provider,
        providerId: naverUserInfo.id,
      };
      const response = await this.findOrCreateUser(userInfo, type);
      return response;
    } catch (error: any) {
      console.error('Naver OAuth 오류', error);
      if (axios.isAxiosError(error) && error.response) {
        console.error('네이버 응답 오류:', error.response.data);
      }
      if (error.message === 'wrong type') throw error;
      throw new Error('Naver 로그인 중 오류가 발생했습니다.');
    }
  }

  async handleKakaoCallback(code: string, provider: string, type: LowercaseUserType): Promise<any> {
    try {
      const tokenResponse = await axios.post(
        'https://kauth.kakao.com/oauth/token',
        new URLSearchParams({
          grant_type: 'authorization_code',
          client_id: process.env.KAKAO_CLIENT_ID!,
          redirect_uri: process.env.KAKAO_REDIRECT_URI!,
          code: code, // 최신 코드 사용
        }).toString(),
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8',
          },
        },
      );

      const { access_token } = tokenResponse.data;
      const userResponse = await axios.get('https://kapi.kakao.com/v2/user/me', {
        headers: {
          Authorization: `Bearer ${access_token}`,
        },
      });

      const { data } = userResponse;
      const { kakao_account } = data;

      const userInfo = {
        provider,
        providerId: data.id.toString(),
        email: kakao_account.email,
        name: getUniqueKoreanPhrase(),
        phoneNumber: Date.now().toString(),
      };

      const response = await this.findOrCreateUser(userInfo, type);
      return response;
    } catch (error) {
      console.error('Kakao OAuth 오류', error);
      if (axios.isAxiosError(error) && error.response) {
        console.error('카카오 응답 오류:', error.response.data);
      }
      throw new Error('Kakao 로그인 중 오류가 발생했습니다.');
    }
  }

  generateState(data: { userType: string }): string {
    const stateObj = {
      ...data,
      timestamp: Date.now(),
    };

    return Buffer.from(JSON.stringify(stateObj)).toString('base64');
  }

  decodeState(state: string): { userType: string; timestamp: number } {
    try {
      const decodedJson = Buffer.from(state, 'base64').toString();
      return JSON.parse(decodedJson);
    } catch {
      throw new Error('상태 정보를 디코딩할 수 없습니다.');
    }
  }
}
