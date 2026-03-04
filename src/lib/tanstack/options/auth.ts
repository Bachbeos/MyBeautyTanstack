import { login, register } from "@/lib/api/auth";
import { useAuthStore } from "@/lib/stores/auth";
import { createKeys } from "@/lib/tanstack/query-key";
import type { LoginRequest, RegisterRequest } from "@/lib/types/auth";
import { mutationOptions } from "@tanstack/react-query";

export const authKeys = createKeys("auth", {
  login: () => ["login"] as const,
  register: () => ["register"] as const,
  logout: () => ["logout"] as const
});

export const authMutations = {
  register: () =>
    mutationOptions({
      mutationKey: authKeys.register(),
      mutationFn: (data: RegisterRequest) => register(data),
      meta: {
        successMessage: "Đăng ký thành công",
        redirectTo: "/login"
      }
    }),

  login: () =>
    mutationOptions({
      mutationKey: authKeys.login(),
      mutationFn: (data: LoginRequest) => login(data),
      onSuccess: (data) => {
        if (data.result?.token) {
          useAuthStore.getState().set({ accessToken: data.result.token });
        }
      },
      meta: {
        successMessage: "Đăng nhập thành công",
        redirectTo: "/"
      }
    })
};
