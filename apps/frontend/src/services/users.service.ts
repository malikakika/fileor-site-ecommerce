import { httpGetSecure } from './httpClient';

export type UserDTO = {
  id: string;
  email: string;
  name?: string;
  role: 'ADMIN' | 'CUSTOMER';
  createdAt: string;
  updatedAt: string;
};

export const usersService = {
  list: () => httpGetSecure<UserDTO[]>('/users'),
};
