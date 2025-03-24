export type EditBaiscInfoBody = {
  currentPassword: string;
  email: string;
  name: string;
  userType: 'customer' | 'mover';
  newPassword: string;
  phoneNumber: string;
};
