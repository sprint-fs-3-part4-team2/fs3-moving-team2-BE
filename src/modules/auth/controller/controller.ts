import { Request, Response } from 'express';
import AuthService from '../service/service';

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

  fakeSignIn = async (req: Request, res: Response) => {
    const { userId } = req.params;
    const type = req.params.type as 'customer' | 'mover';

    const tokens = this.authService.fakeSignIn(userId, type);
    this.setAccessToken(res, tokens.accessToken);
    this.setRefreshToken(res, tokens.refreshToken);

    return res.status(201).json({ message: '임의 로그인 성공' });
  };
}
