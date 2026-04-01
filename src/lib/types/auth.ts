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
}>;
