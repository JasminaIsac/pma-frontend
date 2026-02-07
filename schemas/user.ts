import { ID, ISODate } from './common';
import { UserRole, UserStatus } from './enums';

export interface User {
  id: ID;
  name: string;
  email: string;
  role: UserRole;
  tel: string;
  location?: string | null;
  avatarUrl?: string | null;
  status: UserStatus;
  createdAt: ISODate;
  updatedAt?: ISODate;
}

export interface UserPreview {
  id: ID;
  name: string;
  email: string;
  role: UserRole;
  tel: string;
  avatarUrl?: string | null;
}

export interface CreateUserDTO {
  name: string;
  email: string;
  password: string;
  role: UserRole;
  tel: string;
  location?: string | null;
}

export interface UpdateUserDTO {
  name?: string;
  email?: string;
  role?: UserRole;
  tel?: string;
  location?: string | null;
}

export interface UploadAvatarResponse {
  avatarUrl: string | null;
}