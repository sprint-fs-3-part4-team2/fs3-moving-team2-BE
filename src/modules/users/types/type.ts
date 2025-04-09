export type EditBaiscInfoBody = {
  current_password: string;
  email: string;
  name: string;
  userType: 'customer' | 'mover';
  new_password: string;
  phoneNumber: string;
};
