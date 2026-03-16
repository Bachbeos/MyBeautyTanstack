import { create } from "zustand";

interface PermissionState {
  permissions: {
    view: boolean;
    add: boolean;
    edit: boolean;
    delete: boolean;
  };
  // Hàm này dùng để load quyền khi User đăng nhập hoặc vào trang
  setPermissions: (resourceName: string) => void;
}

export const usePermissionStore = create<PermissionState>((set) => ({
  permissions: { view: false, add: false, edit: false, delete: false },

  setPermissions: (resourceName) => {
    // Tái hiện logic từ bản cũ của Bách
    const view = localStorage.getItem(`${resourceName}_VIEW`) === "1";
    const add = localStorage.getItem(`${resourceName}_ADD`) === "1";
    const edit = localStorage.getItem(`${resourceName}_UPDATE`) === "1";
    const del = localStorage.getItem(`${resourceName}_DELETE`) === "1";

    set({ permissions: { view, add, edit, delete: del } });
  }
}));
