import jwt from 'jsonwebtoken';

export const generateTokens = (userId: string, type: 'mover' | 'customer') => {
  return {
    accessToken: generateAccessToken(userId, type),
    refreshToken: generateRefreshToken(userId, type),
  };
};

export const generateAccessToken = (userId: string, type: 'mover' | 'customer') => {
  return jwt.sign({ userId, type }, process.env.JWT_SECRET!, { expiresIn: '1d' });
};

const generateRefreshToken = (userId: string, type: 'mover' | 'customer') => {
  return jwt.sign({ userId, type }, process.env.REFRESH_TOKEN_SECRET!, { expiresIn: '2d' });
};
