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
      tokens: { accessToken, refreshToken },
      user,
    } = await this.authService.signIn({ email, password }, userType);

    this.setAccessToken(res, accessToken);
    this.setRefreshToken(res, refreshToken);

    return res.status(201).json({ user });
  };

  signUp = async (req: Request, res: Response) => {
    const userType = req.params.userType as LowercaseUserType;
    const { email, password, phoneNumber, name } = req.body;
    console.log(phoneNumber);

    const {
      tokens: { accessToken, refreshToken },
      user,
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

    return res.status(201).json({ user });
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

    try {
      const loginUrl = this.authService.getSnsLoginUrl(provider as OauthTypes);
      return res.redirect(loginUrl);
    } catch (error) {
      console.error(error);
      return res.status(400).json({ message: '잘못된 로그인 요청입니다.' });
    }
  };
}
