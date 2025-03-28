import { NextFunction, Request, Response } from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';
import { mapUser } from '@/chatSocket';

export const extractUserMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const accessToken = req.cookies.accessToken;

  if (!accessToken) {
    return next();
  }
  try {
    const decoded = jwt.verify(accessToken, process.env.JWT_SECRET!) as JwtPayload;
    req.user = { userId: decoded.userId, type: decoded.type, roleId: decoded.roleId };
    mapUser.set('user', req.user); // socket.io 에서 사용
  } catch {
    console.error('userId 조회 실패');
  }
  next();
};
