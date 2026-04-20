import type { AppSocket } from "@/lib/socket/socket";
import { create } from "zustand";

interface SocketState {
  socket: AppSocket | null;
  setSocket: (socket: AppSocket | null) => void;
  getSocket: () => AppSocket | null;
}

export const useSocketStore = create<SocketState>((set, get) => ({
  socket: null,

  setSocket: (socket) => set({ socket }),

  getSocket: () => get().socket
}));