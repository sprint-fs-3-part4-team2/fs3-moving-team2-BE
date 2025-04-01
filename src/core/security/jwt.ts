import jwt from 'jsonwebtoken';

export const generateTokens = (userId: string, roleId: string, type: 'mover' | 'customer') => {
  return {
    accessToken: generateAccessToken(userId, roleId, type),
    refreshToken: generateRefreshToken(userId, roleId, type),
  };
};

export const generateAccessToken = (userId: string, roleId: string, type: 'mover' | 'customer') => {
  return jwt.sign({ userId, type, roleId }, process.env.JWT_SECRET!, { expiresIn: '2h' });
};

const generateRefreshToken = (userId: string, roleId: string, type: 'mover' | 'customer') => {
  return jwt.sign({ userId, type, roleId }, process.env.REFRESH_TOKEN_SECRET!, { expiresIn: '1d' });
};
