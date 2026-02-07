import { User } from './user';

export interface LoginDTO {
  email: string;
  password: string;
}

export interface LoginResponse {
  userData: User;
  token: string;
}

export interface ChangePasswordDTO {
  oldPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface ChangePasswordResponse {
  success: boolean;
  status: number;
  message: string;
}
