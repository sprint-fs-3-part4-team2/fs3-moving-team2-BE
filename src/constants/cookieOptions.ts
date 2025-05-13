export const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: process.env.NODE_ENV === 'lax',
  path: '/',
  domain: process.env.NODE_ENV === 'production' ? process.env.COOKIE_DOMAIN : 'localhost',
};

export const ACCESS_TOKEN_MAX_AGE = 1 * 60 * 60 * 1000;
export const REFRESH_TOKEN_MAX_AGE = 14 * 24 * 60 * 60 * 1000;
