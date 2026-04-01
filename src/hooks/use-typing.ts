import { useCallback, useEffect, useRef, useState } from "react";
import { getSocket } from "@/lib/socket/socket";
import type { TypingEvent } from "@/lib/socket/types";

const STOP_MS = 2000;

export function useTyping(chatId: number | null, currentUserId: number) {
  const [typingUsers, setTypingUsers] = useState<{ userId: number; userName: string }[]>([]);
  const stopTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isTyping = useRef(false);

  useEffect(() => {
    setTypingUsers([]);
    isTyping.current = false;
  }, [chatId]);

  useEffect(() => {
    if (!chatId) return;
    const socket = getSocket();
    if (!socket) return;

    const handler = (ev: TypingEvent) => {
      if (ev.chatId !== chatId || ev.userId === currentUserId) return;
      setTypingUsers((prev) =>
        ev.typing
          ? prev.find((u) => u.userId === ev.userId)
            ? prev
            : [...prev, { userId: ev.userId, userName: ev.userName }]
          : prev.filter((u) => u.userId !== ev.userId)
      );
    };

    socket.on("typing", handler);
    return () => {
      socket.off("typing", handler);
    };
  }, [chatId, currentUserId]);

  const onType = useCallback(() => {
    if (!chatId) return;
    const socket = getSocket();
    if (!socket) return;

    if (!isTyping.current) {
      isTyping.current = true;
      socket.emit("typing", { chatId, typing: true });
    }
    if (stopTimer.current) clearTimeout(stopTimer.current);
    stopTimer.current = setTimeout(() => {
      isTyping.current = false;
      getSocket()?.emit("typing", { chatId, typing: false });
    }, STOP_MS);
  }, [chatId]);

  const stopTyping = useCallback(() => {
    if (!chatId || !isTyping.current) return;
    if (stopTimer.current) clearTimeout(stopTimer.current);
    isTyping.current = false;
    getSocket()?.emit("typing", { chatId, typing: false });
  }, [chatId]);

  useEffect(
    () => () => {
      stopTyping();
    },
    [stopTyping]
  );

  const typingLabel =
    typingUsers.length === 0
      ? null
      : typingUsers.length === 1
        ? `${typingUsers[0].userName} đang gõ...`
        : `${typingUsers.map((u) => u.userName).join(", ")} đang gõ...`;

  return { typingLabel, onType, stopTyping };
}
