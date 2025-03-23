import { AUTH_MESSAGES } from '@/constants/authMessages';
import { NextFunction, Request, Response } from 'express';

export const createAuthMiddleware = (type: 'mover' | 'customer') => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user || req.user?.type !== type)
      res.status(401).json({
        message: type === 'mover' ? AUTH_MESSAGES.onlyForMover : AUTH_MESSAGES.OnlyForCustomer,
      });
    next();
  };
};
