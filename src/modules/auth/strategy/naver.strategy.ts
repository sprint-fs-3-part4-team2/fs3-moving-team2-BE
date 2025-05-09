import axios from 'axios';
import passport from 'passport';
import { Strategy as NaverStrategy } from 'passport-naver';

export const setupNaverStrategy = () => {
  passport.use(
    'naver',
    new NaverStrategy(
      {
        clientID: process.env.NAVER_CLIENT_ID!,
        clientSecret: process.env.NAVER_CLIENT_SECRET!,
        callbackURL: process.env.NAVER_REDIRECT_URI!,
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          const response = await axios.get('https://openapi.naver.com/v1/nid/me', {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          });
          const naverProfile = response.data.response;

          const userInfo = {
            provider: 'naver',
            providerId: naverProfile.id,
            email: naverProfile.email,
            name: naverProfile.name,
            phoneNumber: naverProfile.mobile,
          };

          return done(null, userInfo);
        } catch (error) {
          return done(error);
        }
      },
    ),
  );
};
