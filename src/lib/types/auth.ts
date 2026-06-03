import type { ApiResponse } from "@/lib/types/common";

export type RegisterRequest = {
  phone: string;
  plainPassword: string;
  name: string;
};

export type RegisterResponse = {
  success: boolean;
  message: string;
};

export type LoginRequest = {
  phone: string;
  plainPassword: string;
};

export type LoginResponse = ApiResponse<{
  token: string;
  userId: number;
  name?: string;
  avatar?: string;
  roleName?: string;
  email?: string;
  phone?: string;
  roleId?: number;
}>;

export type LoginGoogleRequest = {
  token: string;
};

export type ForgotPasswordRequest = {
  email: string;
};

export type ResetPasswordRequest = {
  email: string;
  otp: string;
  newPassword: string;
};
