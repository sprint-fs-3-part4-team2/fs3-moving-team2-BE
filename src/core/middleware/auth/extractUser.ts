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
    // socket.io 에서 사용
    mapUser.set(
      'user',
      req.user || {
        userId: 'cm8scb4vx0000iuffo4wy8jfp',
        roleId: 'cm8scb4wi005iiuffqgi6istp',
        type: 'mover',
      },
    );
  } catch {
    console.error('userId 조회 실패');
  }
  next();
};
