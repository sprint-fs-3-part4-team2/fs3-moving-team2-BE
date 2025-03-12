export type EditBaiscInfoBody = {
  current_password: string;
  email: string;
  name: string;
  user_type: 'CUSTOMER' | 'MOVER';
  new_password: string;
  phone_number: string;
};
