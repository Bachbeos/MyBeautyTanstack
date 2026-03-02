export const ENDPOINTS = {
  auth: {
    login: "/user/authenticate",
    register: "/user/create",
    refresh: "/auth/refresh",
    logout: "/auth/logout",
    me: "/auth/me"
  },
  users: {
    list: "/users",
    byId: (id: string) => `/users/${id}`
  },
  products: {
    list: "/products",
    byId: (id: string) => `/products/${id}`
  }
} as const;
