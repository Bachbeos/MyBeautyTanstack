import {
  login,
  register,
  type AuthResponse,
  type LoginRequest,
  type LoginResponse,
  type RegisterRequest
} from "@/lib/api/auth";
import { useAuthStore } from "@/lib/stores/auth";
import { mutationOptions } from "@tanstack/react-query";

export const registerMutationOptions = () =>
  mutationOptions<AuthResponse, Error, RegisterRequest, unknown>({
    mutationKey: ["register"],
    mutationFn: (data) => register(data),
    meta: {
      successMessage: "Đăng ký thành công",
      // errorMessage: "Đăng ký thất bại",
      redirectTo: "/login"
    }
  });

export const loginMutationOptions = () =>
  mutationOptions<LoginResponse, Error, LoginRequest, unknown>({
    mutationKey: ["login"],
    mutationFn: (data) => login(data),
    meta: {
      successMessage: "Đăng nhập thành công",
      errorMessage: "Đăng nhập thất bại",
      redirectTo: "/"
    }
  });
