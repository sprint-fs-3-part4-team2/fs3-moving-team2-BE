import { NextFunction, Request, Response } from 'express';

const ALLOWED_OAUTH_PATHS = ['/auth/callback', '/auth/naver', '/auth/google', '/auth/kakao'];

export const csrfMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const csrfTokenFromCookie = req.cookies.csrfToken;
  const csrfTokenFromHeader = req.headers['x-csrf-token'];
  const csrfTokenMatch = csrfTokenFromCookie === csrfTokenFromHeader;
  const isOAuthPath = ALLOWED_OAUTH_PATHS.some((path) => req.path.startsWith(path));
  const isRoot = req.path === '/';

  if (isOAuthPath || isRoot) {
    return next();
  }

  if (!csrfTokenMatch || !csrfTokenFromCookie || !csrfTokenFromHeader) {
    res.status(403).json({ message: '외부에서 조회할 수 없는 API입니다.' });
    return;
  }

  return next();
};
