import type { UserId } from "@/lib/types/user";
import { create } from "zustand";
import { persist } from "zustand/middleware";

interface AuthState {
  accessToken?: string | null;
  refreshToken?: string | null;
  userId?: UserId | null;
  name?: string | null;
  avatar?: string | null;
  roleName?: string | null;
  email?: string | null;
  phone?: string | null;
  roleId?: number | null;
  isOperator?: number | null;
  branchName?: string | null;

  set: (data: {
    accessToken?: string | null;
    refreshToken?: string | null;
    userId?: UserId | null;
    name?: string | null;
    avatar?: string | null;
    roleName?: string | null;
    email?: string | null;
    phone?: string | null;
    roleId?: number | null;
    isOperator?: number | null;
    branchName?: string | null;
  }) => void;
  clear: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      accessToken: null,
      refreshToken: null,
      userId: null,
      name: null,
      avatar: null,
      roleName: null,
      email: null,
      phone: null,
      roleId: null,
      branchName: null,
      isOperator: null,

      set: ({
        accessToken,
        refreshToken,
        userId,
        name,
        avatar,
        roleName,
        email,
        phone,
        roleId,
        branchName,
        isOperator
      }) =>
        set((state) => ({
          accessToken: accessToken !== undefined ? accessToken : state.accessToken,
          refreshToken: refreshToken !== undefined ? refreshToken : state.refreshToken,
          userId: userId !== undefined ? userId : state.userId,
          name: name !== undefined ? name : state.name,
          avatar: avatar !== undefined ? avatar : state.avatar,
          roleName: roleName !== undefined ? roleName : state.roleName,
          email: email !== undefined ? email : state.email,
          phone: phone !== undefined ? phone : state.phone,
          roleId: roleId !== undefined ? roleId : state.roleId,
          isOperator: isOperator !== undefined ? isOperator : state.isOperator,
          branchName: branchName !== undefined ? branchName : state.branchName
        })),

      clear: () =>
        set(() => ({
          accessToken: null,
          refreshToken: null,
          userId: null,
          name: null,
          avatar: null,
          roleName: null,
          email: null,
          phone: null,
          roleId: null,
          isOperator: null,
          branchName: null
        }))
    }),
    {
      name: "auth-storage",
      partialize: (state) => ({
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        userId: state.userId,
        name: state.name,
        avatar: state.avatar,
        roleName: state.roleName,
        email: state.email,
        phone: state.phone,
        roleId: state.roleId,
        isOperator: state.isOperator,
        branchName: state.branchName
      })
    }
  )
);
