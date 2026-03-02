import axios from "axios";
import env from "@/lib/env";
import { ENDPOINTS } from "@/lib/api/endpoints";
import axiosInstance from "@/lib/axios/instance";

type RefreshResponse = {
  accessToken: string;
};

export const refreshAccessToken = async (): Promise<string> => {
  const res = await axios.post<RefreshResponse>(
    `${env.VITE_API_URL}${ENDPOINTS.auth.refresh}`,
    {},
    {
      withCredentials: true,
      headers: {
        "Content-Type": "application/json"
      }
    }
  );

  const token = res.data.accessToken;

  if (!token) {
    throw new Error("Không nhận được token mới. Vui lòng đăng nhập lại.");
  }

  return token;
};

export type RegisterRequest = {
  phone: string;
  plainPassword: string;
  name: string;
};

export type AuthResponse = {
  success: boolean;
  message: string;
};

export const register = async (data: RegisterRequest): Promise<AuthResponse> => {
  const res = await axios.post<AuthResponse>(`${env.VITE_API_URL}${ENDPOINTS.auth.register}`, {
    ...data
  });
  return res.data;
};

export type LoginRequest = {
  phone: string;
  plainPassword: string;
};

export type ApiResponse<T = any> = {
  success: boolean;
  message: string;
  result?: T;
};

export type LoginResponse = ApiResponse<{
  token: string;
}>;

export const login = async (data: LoginRequest): Promise<LoginResponse> => {
  const res = await axios.post<LoginResponse>(`${env.VITE_API_URL}${ENDPOINTS.auth.login}`, {
    ...data
  });
  return res.data;
};
