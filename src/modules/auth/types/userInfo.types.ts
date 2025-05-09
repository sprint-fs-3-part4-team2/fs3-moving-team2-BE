import { Customer, Mover, SocialLogin, User } from '@prisma/client';

export interface OauthUserInfo {
  email: string;
  name: string;
  phoneNumber: string;
  provider: string;
  providerId: string;
}

export interface UserWithRelations extends User {
  socialLogin: Partial<SocialLogin> | null;
  customer: Partial<Customer> | null;
  mover: Partial<Mover> | null;
}
