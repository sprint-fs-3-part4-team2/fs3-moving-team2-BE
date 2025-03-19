export type EditBaiscInfoBody = {
  currentPassword: string;
  email: string;
  name: string;
  userType: 'CUSTOMER' | 'MOVER';
  newPassword: string;
  phoneNumber: string;
};
