import { generateTokens } from '@/core/security/jwt';

export default class AuthService {
  fakeSignIn(userId: string, type: 'customer' | 'mover') {
    const tokens = generateTokens(userId, type);

    return tokens;
  }
}
