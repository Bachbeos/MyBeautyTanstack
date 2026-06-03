import { create } from "zustand";
import type { ChatView } from "@/lib/types/chat";

// ─── Typing indicator entry ───────────────────────────────────────────────────

type TypingEntry = {
  userId: number;
  userName: string;
  expiresAt: number; // epoch ms, auto-cleared after 4 s
};

// ─── Store shape ──────────────────────────────────────────────────────────────

type ChatStore = {
  // Currently open chat
  activeChatId: number | null;
  activeChatInfo: ChatView | null;
  setActiveChat: (chat: ChatView | null) => void;

  // Typing: chatId → list of typing users
  typingUsers: Record<number, TypingEntry[]>;
  setTyping: (chatId: number, userId: number, userName: string, isTyping: boolean) => void;
  getTypingUsers: (chatId: number) => TypingEntry[];

  // Online presence: set of online user IDs
  onlineUserIds: Set<number>;
  setUserOnline: (userId: number, online: boolean) => void;
  isUserOnline: (userId: number) => boolean;

  // Unread badge counters (live, driven by socket)
  unreadCounts: Record<number, number>;
  incrementUnread: (chatId: number) => void;
  clearUnread: (chatId: number) => void;
  getTotalUnread: () => number;
};

export const useChatStore = create<ChatStore>((set, get) => ({
  // ── Active chat ────────────────────────────────────────────────────────────
  activeChatId: null,
  activeChatInfo: null,
  setActiveChat: (chat) =>
    set({
      activeChatId: chat?.id ?? null,
      activeChatInfo: chat
    }),

  // ── Typing ─────────────────────────────────────────────────────────────────
  typingUsers: {},

  setTyping: (chatId, userId, userName, isTyping) => {
    set((state) => {
      const current = state.typingUsers[chatId] ?? [];

      let updated: TypingEntry[];
      if (isTyping) {
        const entry: TypingEntry = {
          userId,
          userName,
          expiresAt: Date.now() + 4_000
        };
        const idx = current.findIndex((u) => u.userId === userId);
        updated = idx >= 0 ? current.map((u, i) => (i === idx ? entry : u)) : [...current, entry];
      } else {
        updated = current.filter((u) => u.userId !== userId);
      }

      return { typingUsers: { ...state.typingUsers, [chatId]: updated } };
    });
  },

  getTypingUsers: (chatId) => {
    const now = Date.now();
    return (get().typingUsers[chatId] ?? []).filter((u) => u.expiresAt > now);
  },

  // ── Online presence ────────────────────────────────────────────────────────
  onlineUserIds: new Set(),

  setUserOnline: (userId, online) => {
    set((state) => {
      const next = new Set(state.onlineUserIds);
      online ? next.add(userId) : next.delete(userId);
      return { onlineUserIds: next };
    });
  },

  isUserOnline: (userId) => get().onlineUserIds.has(userId),

  // ── Unread counts ──────────────────────────────────────────────────────────
  unreadCounts: {},

  incrementUnread: (chatId) =>
    set((state) => ({
      unreadCounts: {
        ...state.unreadCounts,
        [chatId]: (state.unreadCounts[chatId] ?? 0) + 1
      }
    })),

  clearUnread: (chatId) =>
    set((state) => ({
      unreadCounts: { ...state.unreadCounts, [chatId]: 0 }
    })),

  getTotalUnread: () => Object.values(get().unreadCounts).reduce((a, b) => a + b, 0)
}));
