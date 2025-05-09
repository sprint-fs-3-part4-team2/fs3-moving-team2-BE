import { getUniqueKoreanPhrase } from '@/utils/getUniqueKoreanPhrase';
import passport from 'passport';
import { Strategy as KakaoStrategy } from 'passport-kakao';

export const setupKakaoStrategy = () => {
  passport.use(
    'kakao',
    new KakaoStrategy(
      {
        clientID: process.env.KAKAO_CLIENT_ID!,
        clientSecret: process.env.KAKAO_CLIENT_SECRET!,
        callbackURL: process.env.KAKAO_REDIRECT_URI!,
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          const userInfo = {
            provider: 'kakao',
            providerId: profile.id.toString(),
            email: profile._json.kakao_account.email,
            name: profile.displayName ?? getUniqueKoreanPhrase(),
            phoneNumber: Date.now().toString(),
          };

          return done(null, userInfo);
        } catch (error) {
          return done(error);
        }
      },
    ),
  );
};
