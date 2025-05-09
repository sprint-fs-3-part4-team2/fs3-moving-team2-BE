import { NextFunction, Request, Response } from 'express';
import AuthService from '../service/service';
import { LowercaseUserType } from '@/types/userType.types';
import { UnauthorizedException } from '@/core/errors/unauthorizedException';
import {
  COOKIE_OPTIONS,
  ACCESS_TOKEN_MAX_AGE,
  REFRESH_TOKEN_MAX_AGE,
} from '../../../constants/cookieOptions';
import passport from 'passport';
import { NotFoundException } from '@/core/errors';

export default class AuthController {
  private ROOT_URL =
    process.env.NODE_ENV === 'production' ? process.env.DEPLOYED_URL : process.env.LOCALHOST_URL;

  private REDIRECT_URL_ON_SUCCESS = {
    customer: `${this.ROOT_URL}/user/movers`,
    mover: `${this.ROOT_URL}/mover/quotes/requested`,
  };

  private FAIL_QUERY = {
    customer: '?warn=moverAccountExist',
    mover: '?warn=customerAccountExist',
  };

  private REDIRECT_URL_ON_FAIL = {
    customer: `${this.ROOT_URL}/mover/sign-in`,
    mover: `${this.ROOT_URL}/user/sign-in`,
  };

  private GOOGLE_SCOPE = 'email profile https://www.googleapis.com/auth/user.phonenumbers.read';

  constructor(private authService: AuthService) {}

  private setAccessToken = (res: Response, token: string) => {
    res.cookie('accessToken', token, { ...COOKIE_OPTIONS, maxAge: ACCESS_TOKEN_MAX_AGE });
  };

  private setRefreshToken = (res: Response, token: string) => {
    res.cookie('refreshToken', token, { ...COOKIE_OPTIONS, maxAge: REFRESH_TOKEN_MAX_AGE });
  };

  signIn = async (req: Request, res: Response) => {
    const userType = req.params.userType as LowercaseUserType;
    const { email, password } = req.body;
    const {
      user,
      tokens: { accessToken, refreshToken },
    } = await this.authService.signIn({ email, password }, userType);

    this.setAccessToken(res, accessToken);
    this.setRefreshToken(res, refreshToken);

    return res.status(200).json(user);
  };

  signUp = async (req: Request, res: Response) => {
    const userType = req.params.userType as LowercaseUserType;
    const { email, password, phoneNumber, name } = req.body;

    const {
      user,
      tokens: { accessToken, refreshToken },
    } = await this.authService.signUp(
      {
        email,
        password,
        phoneNumber,
        name,
      },
      userType,
    );

    this.setAccessToken(res, accessToken);
    this.setRefreshToken(res, refreshToken);

    return res.status(201).json(user);
  };

  signOut = async (req: Request, res: Response) => {
    res.clearCookie('accessToken', COOKIE_OPTIONS);
    res.clearCookie('refreshToken', COOKIE_OPTIONS);

    return res.status(200).json({ message: '로그아웃 성공' });
  };

  refreshToken = async (req: Request, res: Response) => {
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) throw new UnauthorizedException('리프레쉬 토큰이 없습니다.');

    const newAccessToken = this.authService.refreshToken(refreshToken);
    this.setAccessToken(res, newAccessToken);

    return res.status(200).json({ message: '액세스 토큰 갱신 성공' });
  };

  snsLogin = async (req: Request, res: Response, next?: NextFunction) => {
    const { provider } = req.params; // 로그인 제공자 (google, kakao, naver)
    const { userType } = req.query;
    if (!userType || (userType !== 'customer' && userType !== 'mover')) {
      return res.status(400).json({ message: '유효하지 않은 사용자 타입입니다.' });
    }

    const state = this.authService.generateState({ userType: userType as string });
    const scope =
      provider === 'google' ? [this.GOOGLE_SCOPE, 'email', 'profile'] : ['email', 'profile'];

    passport.authenticate(provider, { state, scope })(req, res, next);
  };

  oAuthCallback = async (req: Request, res: Response, next?: NextFunction) => {
    const { provider } = req.params;
    const { state } = req.query;

    let userType: LowercaseUserType = 'customer';

    if (state && typeof state === 'string') {
      try {
        const decodedState = this.authService.decodeState(state);
        userType = decodedState.userType as LowercaseUserType;
        // 상태 정보 유효성 검증 (예: 타임스탬프 확인)
        const now = Date.now();
        const stateAge = now - decodedState.timestamp;
        if (stateAge > 10 * 60 * 1000) {
          // 10분 이상 지난 state는 거부
          return res.status(400).json({ message: '만료된 인증 요청입니다.' });
        }
      } catch (error) {
        console.error('상태 정보 디코딩 실패:', error);
        return res.status(400).json({ message: '유효하지 않은 상태 정보입니다.' });
      }
    }

    passport.authenticate(provider, { session: false }, async (error: any, userInfo: any) => {
      if (error || !userInfo) {
        return res.redirect(`${this.REDIRECT_URL_ON_FAIL[userType]}${this.FAIL_QUERY[userType]}`);
      }

      try {
        const response = await this.authService.findOrCreateUser(userInfo, userType);
        if (!response) throw new NotFoundException('사용자 생성 실패');
        const { accessToken, refreshToken } = response.tokens;

        this.setAccessToken(res, accessToken);
        this.setRefreshToken(res, refreshToken);
        res.redirect(this.REDIRECT_URL_ON_SUCCESS[userType]);
      } catch (error: any) {
        console.log(error);
        return res.status(500).json({ message: '로그인 중 오류 발생' });
      }
    })(req, res, next);
  };
}
