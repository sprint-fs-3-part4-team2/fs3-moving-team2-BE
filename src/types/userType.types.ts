export type LowercaseUserType = 'mover' | 'customer';

export interface User {
  userId: string;
  roleId: string;
  type: LowercaseUserType;
}
