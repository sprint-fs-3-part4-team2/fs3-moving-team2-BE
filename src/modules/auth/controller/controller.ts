import { Request, Response } from 'express';
import AuthService from '../service/service';
import { LowercaseUserType } from '@/types/userType.types';

type OauthTypes = 'kakao' | 'naver' | 'google';

export default class AuthController {
  private COOKIE_OPTIONS = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? ('none' as const) : ('lax' as const),
    path: '/',
  };

  private ROOT_URL =
    process.env.NODE_ENV === 'production' ? process.env.DEPLOYED_URL : process.env.LOCALHOST_URL;

  private REDIRECT_URL_ON_SUCCESS = {
    customer: `${this.ROOT_URL}/user/movers`,
    mover: `${this.ROOT_URL}/quotes/requested`,
  };

  private FAIL_QUERY = {
    customer: '?warn=moverAccountExist',
    mover: '?warn=customerAccountExist',
  };

  private REDIRECT_URL_ON_FAIL = {
    customer: `${this.ROOT_URL}/mover/sign-in`,
    mover: `${this.ROOT_URL}/user/sign-in`,
  };

  constructor(private authService: AuthService) {}

  private setAccessToken = (res: Response, token: string) => {
    res.cookie('accessToken', token, { ...this.COOKIE_OPTIONS, maxAge: 2 * 60 * 60 * 1000 });
  };

  private setRefreshToken = (res: Response, token: string) => {
    res.cookie('refreshToken', token, { ...this.COOKIE_OPTIONS, maxAge: 24 * 60 * 60 * 1000 });
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

  fakeSignIn = async (req: Request, res: Response) => {
    const userId = req.query.userId as string;
    const roleId = req.query.roleId as string;
    const type = req.query.type as 'customer' | 'mover';

    const tokens = this.authService.fakeSignIn(userId, roleId, type);
    this.setAccessToken(res, tokens.accessToken);
    this.setRefreshToken(res, tokens.refreshToken);

    return res.status(201).json({ message: '임의 로그인 성공' });
  };

  snsLogin = async (req: Request, res: Response) => {
    const { provider } = req.params; // 로그인 제공자 (google, kakao, naver)
    const { userType } = req.query;
    if (!userType || (userType !== 'customer' && userType !== 'mover')) {
      return res.status(400).json({ message: '유효하지 않은 사용자 타입입니다.' });
    }

    const state = this.authService.generateState({ userType: userType as string });
    const loginUrl = this.authService.getSnsLoginUrl(provider as OauthTypes, state);
    return res.redirect(loginUrl);
  };

  oAuthCallback = async (req: Request, res: Response) => {
    const { provider } = req.params;
    const { code, state } = req.query;

    if (!code || typeof code !== 'string') {
      return res.status(400).json({ message: '인증 코드가 없습니다.' });
    }

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

    try {
      let token;

      switch (provider) {
        case 'google': {
          const googleResult = await this.authService.handleGoogleCallback(
            code,
            provider,
            userType,
          );
          token = googleResult.tokens;
          break;
        }
        case 'naver': {
          const naverResult = await this.authService.handleNaverCallback(code, provider, userType);
          token = naverResult.tokens;
          break;
        }
        case 'kakao': {
          const kakaoResult = await this.authService.handleKakaoCallback(code, provider, userType);
          token = kakaoResult.tokens;
          break;
        }
        default:
          return res.status(400).json({ message: '지원하지 않는 로그인 제공자입니다.' });
      }
      const { accessToken, refreshToken } = token;

      this.setAccessToken(res, accessToken);
      this.setRefreshToken(res, refreshToken);
      res.redirect(this.REDIRECT_URL_ON_SUCCESS[userType]);
    } catch (error: any) {
      if (error.message === 'wrong type')
        return res.redirect(`${this.REDIRECT_URL_ON_FAIL[userType]}${this.FAIL_QUERY[userType]}`);
      return res.status(500).json({ message: '로그인 중 오류 발생' });
    }
  };
}
