const SNS_AUTH_URLS: Record<string, string> = {
  google: `https://accounts.google.com/o/oauth2/auth?client_id=${process.env.GOOGLE_CLIENT_ID}&redirect_uri=${process.env.GOOGLE_REDIRECT_URI}&response_type=code&scope=email%20profile`,
  kakao: `https://kauth.kakao.com/oauth/authorize?client_id=${process.env.KAKAO_CLIENT_ID}&redirect_uri=${process.env.KAKAO_REDIRECT_URI}&response_type=code`,
  naver: `https://nid.naver.com/oauth2.0/authorize?client_id=${process.env.NAVER_CLIENT_ID}&redirect_uri=${process.env.NAVER_REDIRECT_URI}&response_type=code&state=RANDOM_STATE_VALUE`,
};

export const getSnsLoginUrl = (provider: string): string => {
  if (!SNS_AUTH_URLS[provider]) {
    throw new Error('지원하지 않는 로그인 제공자입니다.');
  }
  return SNS_AUTH_URLS[provider];
};
