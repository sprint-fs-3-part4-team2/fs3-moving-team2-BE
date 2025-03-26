import { generateTokens } from '@/core/security/jwt';
import axios from 'axios';

export default class AuthService {
  private SNS_AUTH_URLS = {
    google: `https://accounts.google.com/o/oauth2/auth?client_id=${process.env.GOOGLE_CLIENT_ID}&redirect_uri=${process.env.GOOGLE_REDIRECT_URI}&response_type=code&scope=email%20profile`,
    kakao: `https://kauth.kakao.com/oauth/authorize?client_id=${process.env.KAKAO_CLIENT_ID}&redirect_uri=${process.env.KAKAO_REDIRECT_URI}&response_type=code`,
    naver: `https://nid.naver.com/oauth2.0/authorize?client_id=${process.env.NAVER_CLIENT_ID}&redirect_uri=${process.env.NAVER_REDIRECT_URI}&response_type=code&state=RANDOM_STATE_VALUE`,
  };

  fakeSignIn(userId: string, type: 'customer' | 'mover') {
    const tokens = generateTokens(userId, type);

    return tokens;
  }

  getSnsLoginUrl = (provider: keyof typeof this.SNS_AUTH_URLS) => {
    if (!this.SNS_AUTH_URLS[provider]) {
      throw new Error('지원하지 않는 로그인 제공자입니다.');
    }
    return this.SNS_AUTH_URLS[provider];
  };

  async handleGoogleCallback(code: string) {
    try {
      const tokenResponse = await axios.post('https://oauth2.googleapis.com/token', {
        code,
        client_id: process.env.GOOGLE_CLIENT_ID,
        client_secret: process.env.GOOGLE_CLIENT_SECRET,
        redirect_uri: process.env.GOOGLE_REDIRECT_URI,
        grant_type: 'authorization_code',
      });

      const { access_token } = tokenResponse.data;

      const userInfoResponse = await axios.get('https://www.googleapis.com/oauth2/v2/userinfo', {
        headers: { Authorization: `Bearer ${access_token}` },
      });
    } catch (error) {
      console.error('Google Oauth 오류', error);
      throw new Error('Google 로그인 중 오류가 발생했습니다.');
    }
  }
}
