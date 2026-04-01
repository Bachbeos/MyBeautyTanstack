import { io, type Socket } from "socket.io-client";
import type { MessageReceivedEvent, TypingEvent, MessageReadEvent } from "./types";
import env from "@/lib/env";

interface ServerToClient {
  message_received: (d: MessageReceivedEvent) => void;
  typing: (d: TypingEvent) => void;
  message_read: (d: MessageReadEvent) => void;
}

interface ClientToServer {
  authenticate: (d: { userId: number; userName: string }) => void;
  join_room: (d: { chatId: number }) => void;
  leave_room: (d: { chatId: number }) => void;
  send_message: (
    d: { chatId: number; content: string; messageType?: number; replyToMessageId?: number | null },
    cb: (r: { status: string; messageId?: number }) => void
  ) => void;
  typing: (d: { chatId: number; typing: boolean }) => void;
  mark_read: (d: { chatId: number; messageId?: number | null }) => void;
}

export type AppSocket = Socket<ServerToClient, ClientToServer>;

let _socket: AppSocket | null = null;

export const getSocket = (): AppSocket | null => _socket;

export function initSocket(userId: number, userName: string): AppSocket {
  // Reuse nếu đang connected
  if (_socket?.connected) {
    console.log("[Socket] Already connected, reusing");
    return _socket;
  }

  // Cleanup cũ
  if (_socket) {
    _socket.removeAllListeners();
    _socket.disconnect();
    _socket = null;
  }

  const url = env.VITE_SOCKET_URL as string;
  console.log("[Socket] Connecting to:", url, { userId, userName });

  _socket = io(url, {
    query: {
      userId: String(userId),
      userName: userName
    },
    transports: ["websocket", "polling"],
    reconnection: true,
    reconnectionAttempts: 10,
    reconnectionDelay: 1000
  }) as AppSocket;

  _socket.on("connect", () => {
    console.log("[Socket] ✅ Connected, id:", _socket!.id);
    // Emit authenticate sau khi connect để server map userId → socket
    _socket!.emit("authenticate", { userId, userName });
  });

  _socket.on("disconnect", (reason) => {
    console.log("[Socket] ❌ Disconnected:", reason);
  });

  _socket.on("connect_error", (err) => {
    console.error("[Socket] ❌ connect_error:", err.message);
  });

  return _socket;
}

export function disconnectSocket(): void {
  if (!_socket) return;
  _socket.removeAllListeners();
  _socket.disconnect();
  _socket = null;
  console.log("[Socket] Disconnected");
}
