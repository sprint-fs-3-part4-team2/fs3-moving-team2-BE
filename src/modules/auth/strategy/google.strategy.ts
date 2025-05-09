import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import axios from 'axios';

export const setupGoogleStrategy = () => {
  passport.use(
    'google',
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID!,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
        callbackURL: process.env.GOOGLE_REDIRECT_URI!,
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          let phoneNumber;
          try {
            const peopleResponse = await axios.get('https://people.googleapis.com/v1/people/me', {
              headers: { Authorization: `Bearer ${accessToken}` },
              params: { personFields: 'phoneNumbers' },
            });

            if (peopleResponse.data.phoneNumbers && peopleResponse.data.phoneNumbers.length > 0) {
              phoneNumber = peopleResponse.data.phoneNumbers[0].value;
            }
          } catch (error) {
            console.log('전화번호 조회 실패', error);
          }

          const userInfo = {
            provider: 'google',
            providerId: profile.id,
            email: profile.emails?.[0].value,
            name: profile.displayName,
            phoneNumber: phoneNumber || Date.now().toString(),
          };

          return done(null, userInfo);
        } catch (error) {
          return done(error);
        }
      },
    ),
  );
};
