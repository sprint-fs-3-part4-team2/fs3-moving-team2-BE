import { Request, Response } from 'express';
import { getSnsLoginUrl } from '../service/snsService';

export const snsLogin = (req: Request, res: Response) => {
  const { provider } = req.params; // 로그인 제공자 (google, kakao, naver)

  try {
    const loginUrl = getSnsLoginUrl(provider);
    return res.redirect(loginUrl);
  } catch (error) {
    console.error(error);
    return res.status(400).json({ message: '잘못된 로그인 요청입니다.' });
  }
};

export default { snsLogin };
