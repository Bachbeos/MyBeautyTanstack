import axios from "axios";
import env from "@/lib/env";
import { ENDPOINTS } from "@/lib/api/endpoints";
import { axiosBase } from "@/lib/axios/instance";
import type {
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  RegisterResponse
} from "@/lib/types/auth";

type RefreshResponse = {
  accessToken: string;
};

export const refreshAccessToken = async (): Promise<string> => {
  const res = await axiosBase.post<RefreshResponse>(
    ENDPOINTS.auth.refresh,
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

export const register = async (data: RegisterRequest): Promise<RegisterResponse> => {
  const res = await axios.post<RegisterResponse>(`${env.VITE_API_URL}${ENDPOINTS.auth.register}`, {
    ...data
  });
  return res.data;
};

export const login = async (data: LoginRequest): Promise<LoginResponse> => {
  const res = await axiosBase.post<LoginResponse>(ENDPOINTS.auth.login, {
    ...data
  });
  return res.data;
};
