import { useEffect } from "react";
import { useLocation } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { useSocketStore } from "@/lib/stores/socket";
import { notificationKeys } from "@/lib/tanstack/options/notification";
import type { MessageReceivedEvent, NotificationReceivedEvent } from "@/lib/socket/types";

export function SocketNotificationListener() {
  const location = useLocation();
  const queryClient = useQueryClient();

  useEffect(() => {
    const socket = useSocketStore.getState().getSocket();
    if (!socket) return;

    const handleNotificationReceived = (payload: NotificationReceivedEvent) => {
      queryClient.invalidateQueries({ queryKey: notificationKeys.list({ page: 1, size: 20 }) });
      queryClient.invalidateQueries({ queryKey: notificationKeys.infinite({ size: 20 }) });
    };

    const handleMessageReceived = (payload: MessageReceivedEvent) => {
      if (location.pathname.includes("/chat")) return;

      toast.custom((t) => (
        <div
          className="shadow-lg border rounded-3 bg-white p-3 d-flex align-items-start gap-3"
          style={{ minWidth: 320, maxWidth: 420 }}
        >
          <div
            className="rounded-circle bg-primary-subtle text-primary d-flex align-items-center justify-content-center flex-shrink-0"
            style={{ width: 42, height: 42 }}
          >
            <i className="ti ti-message" />
          </div>
          <div className="flex-grow-1">
            <div className="fw-semibold mb-1">{payload.chatName || "Tin nhắn mới"}</div>
            <div className="text-muted small">
              {payload.senderName ? `${payload.senderName}: ` : ""}
              {payload.content || "Có tin nhắn mới"}
            </div>
          </div>
          <button
            type="button"
            className="btn btn-sm btn-link text-muted p-0"
            onClick={() => toast.dismiss(t)}
          >
            <i className="ti ti-x" />
          </button>
        </div>
      ));
    };

    socket.on("notification_received", handleNotificationReceived);
    socket.on("message_received", handleMessageReceived);

    return () => {
      socket.off("notification_received", handleNotificationReceived);
      socket.off("message_received", handleMessageReceived);
    };
  }, [location.pathname, queryClient]);

  return null;
}
