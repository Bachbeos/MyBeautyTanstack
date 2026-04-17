import { forgotPassword, login, loginGoogle, register, resetPassword } from "@/lib/api/auth";
import { getMyResources } from "@/lib/api/permission";
import { useAuthStore } from "@/lib/stores/auth";
import { createKeys } from "@/lib/tanstack/query-key";
import type {
  ForgotPasswordRequest,
  LoginGoogleRequest,
  LoginRequest,
  RegisterRequest,
  ResetPasswordRequest
} from "@/lib/types/auth";
import { UserId } from "@/lib/types/user";
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
      onSuccess: async (data) => {
        if (data.result?.token) {
          useAuthStore.getState().set({
            accessToken: data.result.token,
            userId: UserId(data.result.userId),
            name: data.result.name,
            avatar: data.result.avatar,
            roleName: data.result.roleName,
            email: data.result.email,
            phone: data.result.phone,
            roleId: data.result.roleId
          });
          try {
            const response = await getMyResources();
            if (response && Array.isArray(response.result)) {
              const map: Record<string, number> = {};
              response.result.forEach((item) => {
                const code = item.code;
                let actions: string | string[] = item.actions;
                if (
                  typeof actions === "string" &&
                  actions.trim().startsWith("[") &&
                  actions.trim().endsWith("]")
                ) {
                  try {
                    const parsed = JSON.parse(actions);
                    if (Array.isArray(parsed)) actions = parsed;
                  } catch (e) {
                  }
                }
                if (code && Array.isArray(actions)) {
                  actions.forEach((act) => {
                    const key = `${code}_${act}`;
                    map[key] = 1;
                  });
                }
              });
              Object.keys(map).forEach((k) => {
                localStorage.setItem(k, String(map[k]));
              });
            }
          } catch (err) {
            console.error("Failed to sync permissions:", err);
          }
        }
      },
      meta: {
        successMessage: "Đăng nhập thành công",
        redirectTo: "/report"
      }
    }),

  loginGoogle: () =>
    mutationOptions({
      mutationKey: authKeys.login(),
      mutationFn: (data: LoginGoogleRequest) => loginGoogle(data),
      onSuccess: async (data) => {
        if (data.result?.token) {
          useAuthStore.getState().set({
            accessToken: data.result.token,
            userId: UserId(data.result.userId),
            name: data.result.name,
            avatar: data.result.avatar,
            roleName: data.result.roleName,
            email: data.result.email,
            phone: data.result.phone,
            roleId: data.result.roleId
          });
          try {
            const response = await getMyResources();
            if (response && Array.isArray(response.result)) {
              const map: Record<string, number> = {};
              response.result.forEach((item) => {
                const code = item.code;
                let actions: string | string[] = item.actions;
                if (
                  typeof actions === "string" &&
                  actions.trim().startsWith("[") &&
                  actions.trim().endsWith("]")
                ) {
                  try {
                    const parsed = JSON.parse(actions);
                    if (Array.isArray(parsed)) actions = parsed;
                  } catch (e) {
                  }
                }
                if (code && Array.isArray(actions)) {
                  actions.forEach((act) => {
                    const key = `${code}_${act}`;
                    map[key] = 1;
                  });
                }
              });
              Object.keys(map).forEach((k) => {
                localStorage.setItem(k, String(map[k]));
              });
            }
          } catch (err) {
            console.error("Failed to sync permissions:", err);
          }
        }
      },
      meta: {
        successMessage: "Đăng nhập thành công",
        redirectTo: "/report"
      }
    }),

  forgotPassword: () =>
    mutationOptions({
      mutationKey: authKeys.login(),
      mutationFn: (data: ForgotPasswordRequest) => forgotPassword(data),
      meta: {
        successMessage: "Mã OTP đã được gửi đến email của bạn."
      }
    }),

  resetPassword: () =>
    mutationOptions({
      mutationKey: authKeys.login(),
      mutationFn: (data: ResetPasswordRequest) => resetPassword(data),
      meta: {
        successMessage: "Đổi mật khẩu thành công! Vui lòng đăng nhập lại.",
        redirectTo: "/login"
      }
    })
};
