import { SetMetadata } from '@nestjs/common';
export const ROLES_KEY = 'roles';
export const Roles = (...roles: Array<'ADMIN' | 'CUSTOMER'>) =>
  SetMetadata(ROLES_KEY, roles);
