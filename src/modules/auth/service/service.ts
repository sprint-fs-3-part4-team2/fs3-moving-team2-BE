import { AUTH_MESSAGES } from '@/constants/authMessages';
import { EXCEPTION_MESSAGES } from '@/constants/exceptionMessages';
import { ConflictException, NotFoundException } from '@/core/errors';
import { UnauthorizedException } from '@/core/errors/unauthorizedException';
import { generateAccessToken, generateTokens } from '@/core/security/jwt';
import UserRepository from '@/modules/users/repository/user.repository';
import { SignInRequest, SignUpRequest } from '@/structs/authStruct';
import { LowercaseUserType } from '@/types/userType.types';
import { UserType } from '@prisma/client';
import bcrypt from 'bcrypt';
import { OauthUserInfo, UserWithRelations } from '../types/userInfo.types';
import jwt, { JwtPayload } from 'jsonwebtoken';

export default class AuthService {
  private SALT_ROUNDS = 10;

  constructor(private userRepository: UserRepository) {}

  async signIn({ email, password }: SignInRequest, type: LowercaseUserType) {
    const uppercaseType = type.toUpperCase() as UserType;
    const userEntity = await this.userRepository.findByEmail(email);
    if (!userEntity) throw new NotFoundException(AUTH_MESSAGES.emailNotExist);
    if (userEntity.userType !== uppercaseType)
      throw new ConflictException(AUTH_MESSAGES.invalidRole[type]);

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
    if (existingUserByEmail && existingUserByEmail?.userType !== uppercaseType) {
      throw new ConflictException(AUTH_MESSAGES.invalidRole[type]);
    }
    if (existingUserByEmail) throw new ConflictException(EXCEPTION_MESSAGES.duplicatedEmail);
    const existingUserByPhoneNumber = await this.userRepository.findByPhoneNumber(
      signUpDto.phoneNumber,
      type.toUpperCase() as UserType,
    );
    if (existingUserByPhoneNumber)
      throw new ConflictException(EXCEPTION_MESSAGES.duplicatedPhoneNumber);
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

  refreshToken(refreshToken: string) {
    try {
      const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET!) as JwtPayload;
      const accessToken = generateAccessToken(decoded.userId, decoded.roleId, decoded.type);

      return accessToken;
    } catch {
      throw new UnauthorizedException('액세스토큰 갱신 실패');
    }
  }

  // findOrCreateUser에서 사용하는 메서드 : 소셜 로그인 회원 생성
  async createSocialLoginUser(userInfo: OauthUserInfo, type: LowercaseUserType) {
    const password = await bcrypt.hash('password1!', this.SALT_ROUNDS);
    const user = await this.userRepository.createWithSocialLogin(
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
    return this.generateUserResponse(user, type);
  }

  // findOrCreateUser에서 사용하는 메서드 : 일반회원에 소셜 로그인 추가
  async addSocialLoginUser(userInfo: OauthUserInfo, type: LowercaseUserType) {
    const userUpdated = await this.userRepository.addSocialProvider(
      userInfo.email,
      userInfo.provider,
      userInfo.providerId,
    );
    return this.generateUserResponse(userUpdated, type);
  }

  // findOrCreateUser, createSocialLoginUser, addSocialLoginUser에서 사용하는 메서드
  private generateUserResponse(user: UserWithRelations, type: LowercaseUserType) {
    const profile = user[type];
    const roleId = profile?.id ?? '';
    const token = generateTokens(user.id, roleId, type);
    return {
      tokens: token,
      user: {
        email: user.email,
        phoneNumber: user.phoneNumber,
        name: user.name,
        [type]: profile,
      },
    };
  }

  // 소셜 로그인 회원을 찾거나 생성
  async findOrCreateUser(userInfo: OauthUserInfo, type: LowercaseUserType) {
    const user = await this.userRepository.findByEmail(userInfo.email);
    if (!user) return await this.createSocialLoginUser(userInfo, type);

    if (user?.userType !== type.toUpperCase()) {
      throw new ConflictException('wrong type');
    }

    if (user && !user.socialLogin) return await this.addSocialLoginUser(userInfo, type);

    return this.generateUserResponse(user, type);
  }

  generateState(data: { userType: string }) {
    const stateObj = {
      userType: data.userType,
    };
    const token = jwt.sign(stateObj, process.env.OAUTH_STATE_SECRET!, {
      expiresIn: '5m',
    });
    return encodeURIComponent(token);
  }

  decodeState(state: string) {
    const decoded = jwt.verify(
      decodeURIComponent(state),
      process.env.OAUTH_STATE_SECRET!,
    ) as JwtPayload;
    return {
      userType: decoded.userType,
    };
  }
}
