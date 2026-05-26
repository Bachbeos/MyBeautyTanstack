import { CreateChatModal } from "@/components/chat/create-chat-modal";
import { MessageInput } from "@/components/chat/message-input";
import { useDebounceValue } from "@/hooks/use-debounce-value";
import { useInfiniteScroll } from "@/hooks/use-infinite-scroll";
import { useTyping } from "@/hooks/use-typing";
import { getSocket } from "@/lib/socket/socket";
import { useAuthStore } from "@/lib/stores/auth";
import { useChatStore } from "@/lib/stores/chat";
import { chatKeys, chatMutations, chatQueries } from "@/lib/tanstack/options/chat";
import { userQueries } from "@/lib/tanstack/options/user";
import { queryClient } from "@/lib/tanstack/query-client";
import type { ChatView, CursorResult, MessageDto } from "@/lib/types/chat";
import type { ApiResponse } from "@/lib/types/common";
import { UserId, type UserDto } from "@/lib/types/user";
import { cn } from "@/lib/utils";
import {
  useInfiniteQuery,
  useMutation,
  useQueryClient,
  type InfiniteData,
  useQuery,
  useQueries
} from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";

export const Route = createFileRoute("/_crm/_chat/chat")({ component: ChatPage });

// ─── Helpers (giữ nguyên) ─────────────────────────────────────────────────────

const fmt = (iso: string | null, mode: "time" | "date" = "time") => {
  if (!iso) return "";
  const d = new Date(iso);
  if (mode === "time") return d.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" });
  const today = new Date();
  if (d.toDateString() === today.toDateString()) return "Hôm nay";
  const yest = new Date(today);
  yest.setDate(today.getDate() - 1);
  if (d.toDateString() === yest.toDateString()) return "Hôm qua";
  return d.toLocaleDateString("vi-VN");
};

const sameDay = (a: string, b: string) => new Date(a).toDateString() === new Date(b).toDateString();

const avatar = (name: string) =>
  `https://ui-avatars.com/api/?name=${encodeURIComponent(name || "?")}&background=random&color=fff`;

export const getCachedUserInfo = (id: UserId) => {
  const data = queryClient.getQueryData(userQueries.detail(id).queryKey) as
    | ApiResponse<UserDto>
    | undefined;

  const user = data?.result;

  const name = user?.name?.trim() || "Người dùng không xác định";

  return {
    name,
    avatar: user?.avatar || avatar(name)
  };
};

const FILE_ICON: Record<number, string> = {
  2: "ti ti-photo",
  3: "ti ti-video",
  4: "ti ti-microphone",
  6: "ti ti-file"
};

interface MessageGroup {
  senderId: number;
  messages: MessageDto[];
  isOwn: boolean;
}

function groupMessages(messages: MessageDto[], currentUserId: number): MessageGroup[] {
  const groups: MessageGroup[] = [];
  const GAP_MS = 2 * 60 * 1000;

  for (const msg of messages) {
    const last = groups[groups.length - 1];
    const lastMsg = last?.messages[last.messages.length - 1];

    const sameSender = last && last.senderId === msg.senderId;
    const withinGap =
      lastMsg &&
      Math.abs(new Date(msg.createdAt).getTime() - new Date(lastMsg.createdAt).getTime()) < GAP_MS;
    const noReply = !msg.replyToMessageId && !lastMsg?.replyToMessageId;

    if (sameSender && withinGap && noReply) {
      last.messages.push(msg);
    } else {
      groups.push({
        senderId: msg.senderId,
        isOwn: msg.senderId === currentUserId,
        messages: [msg]
      });
    }
  }
  return groups;
}

// ─── ChatPage ─────────────────────────────────────────────────────────────────

function ChatPage() {
  const currentUserId = useAuthStore((s) => s.userId) ?? 0;
  const qc = useQueryClient();

  const [showCreateModal, setShowCreateModal] = useState(false);

  const [activeChatId, setActiveChatId] = useState<number | null>(null);
  const [activeChat, setActiveChatState] = useState<ChatView | null>(null);
  const [chatSearch, setChatSearch] = useState("");
  const [msgSearch, setMsgSearch] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const [replyTo, setReplyTo] = useState<MessageDto | null>(null);

  // ─── KEY STATE: kiểm soát khi nào mới enable infinite scroll cho messages ───
  // false = đang chờ initial scroll to bottom → block infinite scroll
  // true  = đã scroll to bottom → enable infinite scroll (scroll up load older)
  const [isScrollReady, setIsScrollReady] = useState(false);

  const [debouncedChatSearch] = useDebounceValue(chatSearch, 400);
  const [debouncedMsgSearch] = useDebounceValue(msgSearch, 400);

  const msgEndRef = useRef<HTMLDivElement>(null);
  const scrollAnchorRef = useRef<{ scrollHeight: number; scrollTop: number } | null>(null);
  const isNearBottomRef = useRef(true);

  const setActiveChat = useChatStore((s) => s.setActiveChat);
  const { typingLabel, onType, stopTyping } = useTyping(activeChatId, currentUserId);

  // ── Socket ────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!activeChatId) return;
    const socket = getSocket();
    if (!socket) return;
    socket.emit("join_room", { chatId: activeChatId });
    socket.emit("mark_read", { chatId: activeChatId });
    return () => {
      socket.emit("leave_room", { chatId: activeChatId });
    };
  }, [activeChatId]);

  useEffect(() => {
    return () => {
      setActiveChat(null);
    };
  }, [setActiveChat]);

  // ── Chat list ─────────────────────────────────────────────────────────────
  const chatListQ = useInfiniteQuery(chatQueries.listCursor());
  const chatSearchQ = useInfiniteQuery(chatQueries.searchChats(debouncedChatSearch));
  const isSearchingChat = debouncedChatSearch.trim().length > 0;
  const activeChatQ = isSearchingChat ? chatSearchQ : chatListQ;

  const rawChats = useMemo(
    () => activeChatQ.data?.pages.flatMap((p) => p.result?.data ?? []) ?? [],
    [activeChatQ.data]
  );

  const chats = useMemo(
    () =>
      [...rawChats].sort((a, b) => {
        if (!a.lastMessageAt) return 1;
        if (!b.lastMessageAt) return -1;
        return new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime();
      }),
    [rawChats]
  );

  const chatListScrollRef = useInfiniteScroll<HTMLDivElement>({
    onLoadMore: () => activeChatQ.fetchNextPage(),
    hasNextPage: activeChatQ.hasNextPage ?? false,
    isFetching: activeChatQ.isFetchingNextPage,
    direction: "bottom"
  });

  // ── Messages ──────────────────────────────────────────────────────────────
  const msgListQ = useInfiniteQuery(chatQueries.messages(activeChatId ?? 0));
  const msgSearchQ = useInfiniteQuery(
    chatQueries.searchMessages(activeChatId ?? 0, debouncedMsgSearch)
  );
  const isSearchingMsg = showSearch && debouncedMsgSearch.trim().length > 0;
  const activeMsgQ = isSearchingMsg ? msgSearchQ : msgListQ;

  const messages = useMemo(
    () => [...(activeMsgQ.data?.pages.flatMap((p) => p.result?.data ?? []) ?? [])].reverse(),
    [activeMsgQ.data]
  );

  const userIds = useMemo(() => [...new Set(messages.map((x) => x.senderId))], [messages]);

  useQueries({
    queries: userIds.map((id) => ({
      ...userQueries.detail(UserId(id)),
      staleTime: 1000 * 60 * 5
    }))
  });

  const messageGroups = useMemo(
    () => groupMessages(messages, currentUserId),
    [messages, currentUserId]
  );

  // ── Infinite scroll cho messages: CHỈ enable sau khi isScrollReady = true ──
  const msgListScrollRef = useInfiniteScroll<HTMLDivElement>({
    onLoadMore: () => {
      const el = msgListScrollRef.current;
      if (el) {
        scrollAnchorRef.current = {
          scrollHeight: el.scrollHeight,
          scrollTop: el.scrollTop
        };
      }
      activeMsgQ.fetchNextPage();
    },
    hasNextPage: activeMsgQ.hasNextPage ?? false,
    isFetching: activeMsgQ.isFetchingNextPage,
    direction: "top",
    threshold: 120,
    enabled: isScrollReady // ← BLOCK khi chưa scroll to bottom
  });

  // ── Restore scroll sau load older ─────────────────────────────────────────
  useLayoutEffect(() => {
    const el = msgListScrollRef.current;
    const anchor = scrollAnchorRef.current;
    if (!el || !anchor || activeMsgQ.isFetchingNextPage) return;

    const diff = el.scrollHeight - anchor.scrollHeight;
    if (diff > 0) {
      el.scrollTop = anchor.scrollTop + diff;
      scrollAnchorRef.current = null;
    }
  }, [messages.length, activeMsgQ.isFetchingNextPage]);

  // ── Initial scroll to bottom khi data sẵn sàng ───────────────────────────
  // Trigger: activeChatId thay đổi HOẶC data vừa load xong (isSuccess)
  // Logic:
  //   1. Khi selectChat → isScrollReady = false (block infinite scroll)
  //   2. Effect này chờ activeMsgQ.isSuccess = true
  //   3. Scroll to bottom bằng requestAnimationFrame (sau khi DOM render)
  //   4. Set isScrollReady = true → enable infinite scroll
  useEffect(() => {
    // Chưa chọn chat hoặc data chưa load
    if (!activeChatId || !activeMsgQ.isSuccess) return;

    // Nếu đã ready rồi thì không làm gì (tránh re-trigger khi có msg mới)
    if (isScrollReady) return;

    const el = msgListScrollRef.current;
    if (!el) return;

    // Double rAF để đảm bảo DOM đã paint xong hoàn toàn
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        el.scrollTop = el.scrollHeight;
        isNearBottomRef.current = true;
        setIsScrollReady(true); // Enable infinite scroll
      });
    });
  }, [activeChatId, activeMsgQ.isSuccess, isScrollReady]);

  // ── Track near bottom ─────────────────────────────────────────────────────
  useEffect(() => {
    const el = msgListScrollRef.current;
    if (!el) return;
    const onScroll = () => {
      isNearBottomRef.current = el.scrollHeight - el.scrollTop - el.clientHeight < 150;
    };
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => el.removeEventListener("scroll", onScroll);
  }, [activeChatId]);

  // ── Auto-scroll khi có message mới (chỉ nếu đang ở gần bottom) ───────────
  const prevMsgCount = useRef(0);
  useEffect(() => {
    if (messages.length > prevMsgCount.current && isNearBottomRef.current) {
      msgEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
    prevMsgCount.current = messages.length;
  }, [messages.length]);

  // ── Send ──────────────────────────────────────────────────────────────────
  const sendMutation = useMutation({
    ...chatMutations.sendMessage(),
    onSuccess: (res) => {
      const saved = res.result;
      if (!saved || !activeChatId) return;

      type MC = InfiniteData<ApiResponse<CursorResult<MessageDto>>>;
      qc.setQueryData<MC>(chatKeys.messages(activeChatId), (old) => {
        if (!old) return old;
        if (old.pages.some((p) => p.result?.data.some((m) => m.id === saved.id))) return old;
        const [first, ...rest] = old.pages;
        return {
          ...old,
          pages: [
            {
              ...first,
              result: first.result
                ? { ...first.result, data: [saved, ...(first.result.data ?? [])] }
                : first.result
            },
            ...rest
          ]
        };
      });

      setReplyTo(null);
      stopTyping();

      requestAnimationFrame(() => {
        msgEndRef.current?.scrollIntoView({ behavior: "smooth" });
      });
    }
  });

  const selectChat = (chat: ChatView) => {
    setActiveChatId(chat.id);
    setActiveChatState(chat);
    setActiveChat(chat);
    setReplyTo(null);
    setShowSearch(false);
    setMsgSearch("");
    prevMsgCount.current = 0;
    isNearBottomRef.current = true;
    // Reset scroll ready → block infinite scroll cho đến khi scroll to bottom xong
    setIsScrollReady(false);
  };

  // ──────────────────────────────────────────────────────────────────────────
  return (
    <div className="page-wrapper">
      <div className="content p-0" style={{ height: "calc(100vh - 60px)", width: "100%" }}>
        <div className="chat-wrapper d-flex h-100 w-100">
          {/* SIDEBAR */}
          <div
            className="d-flex flex-column flex-shrink-0 border-end bg-white"
            style={{ width: 300 }}
          >
            <div className="p-3 border-bottom">
              <div className="d-flex align-items-center justify-content-between mb-3">
                <h6 className="fw-bold mb-0">Tin nhắn</h6>
                <button
                  className="btn btn-sm btn-primary rounded-circle d-flex align-items-center justify-content-center"
                  style={{ width: 28, height: 28, padding: 0 }}
                  onClick={() => setShowCreateModal(true)}
                  title="Tạo cuộc trò chuyện"
                >
                  <i className="ti ti-edit" style={{ fontSize: 13 }} />
                </button>
              </div>
              <div className="input-group input-group-sm">
                <span className="input-group-text border-0 bg-light">
                  <i className="ti ti-search text-muted" />
                </span>
                <input
                  className="form-control border-0 bg-light"
                  placeholder="Tìm kiếm..."
                  value={chatSearch}
                  onChange={(e) => setChatSearch(e.target.value)}
                />
                {chatSearch && (
                  <button className="btn btn-light border-0" onClick={() => setChatSearch("")}>
                    <i className="ti ti-x" />
                  </button>
                )}
              </div>
            </div>

            <div
              ref={chatListScrollRef}
              className="overflow-auto flex-grow-1"
              style={{ overflowY: "auto" }}
            >
              {activeChatQ.isLoading && (
                <div className="text-center py-4 text-muted small">
                  <span className="spinner-border spinner-border-sm me-1" />
                  Đang tải...
                </div>
              )}
              {!activeChatQ.isLoading && chats.length === 0 && (
                <div className="text-center py-5 text-muted small">
                  {isSearchingChat ? "Không có kết quả" : "Chưa có cuộc trò chuyện"}
                </div>
              )}
              {chats.map((chat) => (
                <ChatItem
                  key={chat.id}
                  chat={chat}
                  active={chat.id === activeChatId}
                  onClick={() => selectChat(chat)}
                />
              ))}
              {activeChatQ.isFetchingNextPage && (
                <div className="text-center py-2">
                  <span className="spinner-border spinner-border-sm text-muted" />
                </div>
              )}
            </div>
          </div>

          {/* CHAT PANEL */}
          {activeChatId && activeChat ? (
            <div
              className="d-flex flex-column flex-grow-1 h-100 w-100"
              style={{ minWidth: 0, minHeight: 0, flex: "1 1 0%" }}
            >
              {/* Header */}
              <div className="d-flex align-items-center justify-content-between px-3 py-2 border-bottom bg-white flex-shrink-0">
                <div className="d-flex align-items-center gap-2">
                  <div className="position-relative">
                    <img
                      src={activeChat.chatAvatar && activeChat.chatAvatar.trim().length > 0 ? activeChat.chatAvatar : avatar(activeChat.chatName)}
                      className="rounded-circle"
                      style={{ width: 38, height: 38, objectFit: "cover" }}
                      alt=""
                      onError={(e) => {
                        e.currentTarget.src = avatar(activeChat.chatName);
                      }}
                    />
                    {!activeChat.isGroupChat && activeChat.otherUserId && (
                      <span
                        className={cn(
                          "position-absolute rounded-circle border border-white",
                          (activeChat.isOnline ?? false) ? "bg-success" : "bg-secondary"
                        )}
                        style={{ width: 10, height: 10, right: 0, bottom: 0 }}
                        title={(activeChat.isOnline ?? false) ? "Online" : "Offline"}
                      />
                    )}
                  </div>
                  <div>
                    <div className="fw-semibold" style={{ fontSize: 14 }}>
                      {activeChat.chatName}
                    </div>
                    <div style={{ fontSize: 12 }}>
                      {typingLabel ? (
                        <span className="text-success">{typingLabel}</span>
                      ) : (
                        <span className={activeChat.isOnline ? "text-success" : "text-muted"}>
                          {activeChat.isGroupChat ? "Nhóm" : activeChat.isOnline ? "Online" : "Offline"}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <button
                  className={cn(
                    "btn btn-sm btn-icon",
                    showSearch ? "btn-primary" : "btn-outline-secondary"
                  )}
                  onClick={() => {
                    setShowSearch((v) => !v);
                    setMsgSearch("");
                  }}
                >
                  <i className="ti ti-search" />
                </button>
              </div>

              {/* Search bar */}
              {showSearch && (
                <div className="px-3 py-2 border-bottom bg-light flex-shrink-0">
                  <div className="input-group input-group-sm">
                    <span className="input-group-text bg-white">
                      <i className="ti ti-search text-muted" />
                    </span>
                    <input
                      autoFocus
                      className="form-control"
                      placeholder="Tìm trong cuộc trò chuyện..."
                      value={msgSearch}
                      onChange={(e) => setMsgSearch(e.target.value)}
                    />
                    {msgSearch && (
                      <button className="btn btn-white" onClick={() => setMsgSearch("")}>
                        <i className="ti ti-x" />
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* Messages */}
              <div
                ref={msgListScrollRef}
                className="chat-body flex-grow-1 px-3 py-2 bg-light"
                style={{ overflowY: "auto", minHeight: 0 }}
              >
                {activeMsgQ.isFetchingNextPage && (
                  <div className="text-center py-2">
                    <span className="spinner-border spinner-border-sm text-muted" />
                  </div>
                )}
                {activeMsgQ.isLoading && (
                  <div className="text-center py-5 text-muted">
                    <span className="spinner-border spinner-border-sm me-2" />
                    Đang tải...
                  </div>
                )}

                {messageGroups.map((group, gIdx) => {
                  const prevGroup = messageGroups[gIdx - 1];
                  const firstMsg = group.messages[0];
                  const showDate =
                    !prevGroup ||
                    !sameDay(
                      prevGroup.messages[prevGroup.messages.length - 1].createdAt,
                      firstMsg.createdAt
                    );
                  return (
                    <div key={`group-${firstMsg.id}`}>
                      {showDate && (
                        <div className="text-center my-3">
                          <span
                            className="badge bg-light text-muted border px-3"
                            style={{ fontSize: 11 }}
                          >
                            {fmt(firstMsg.createdAt, "date")}
                          </span>
                        </div>
                      )}
                      <MessageGroup group={group} onReply={(msg) => setReplyTo(msg)} />
                    </div>
                  );
                })}

                <div ref={msgEndRef} />
              </div>

              <div className="flex-shrink-0">
                <MessageInput
                  key={activeChatId}
                  onSend={({ content, file, messageType, replyToMessageId }) => {
                    sendMutation.mutate({
                      chatId: activeChatId!,
                      content,
                      file,
                      messageType,
                      replyToMessageId
                    });
                  }}
                  isPending={sendMutation.isPending}
                  replyTo={replyTo}
                  onCancelReply={() => setReplyTo(null)}
                  onType={onType}
                  onStopTyping={stopTyping}
                  disabled={!activeChatId}
                />
              </div>
            </div>
          ) : (
            <div
              className="d-flex flex-grow-1 h-100 w-100 align-items-center justify-content-center flex-column gap-2 text-muted"
              style={{ minWidth: 0, minHeight: 0 }}
            >
              <i className="ti ti-message-2" style={{ fontSize: 56, opacity: 0.2 }} />
              <span className="small">Chọn một cuộc trò chuyện để bắt đầu</span>
            </div>
          )}
        </div>
      </div>
      <CreateChatModal
        show={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onCreated={(chat) => {
          setShowCreateModal(false);
          selectChat(chat);
        }}
      />
    </div>
  );
}

// ─── ChatItem (giữ nguyên từ file bạn) ───────────────────────────────────────

function ChatItem({
  chat,
  active,
  onClick
}: {
  chat: ChatView;
  active: boolean;
  onClick: () => void;
}) {
  const isUserOnline = useChatStore((s) => s.isUserOnline);
  const icon = chat.lastMessageType ? FILE_ICON[chat.lastMessageType] : null;
  const showPresence = !chat.isGroupChat;
  const resolvedOnline = chat.isGroupChat ? false : chat.isOnline ?? false;
  const preview = icon ? (
    <>
      <i className={`${icon} me-1`} />
      {chat.lastMessageType === 6 ? "Tệp" : "Media"}
    </>
  ) : (
    chat.lastMessageContent
  );
  const avatarSrc = chat.chatAvatar && chat.chatAvatar.trim().length > 0 ? chat.chatAvatar : avatar(chat.chatName);

  const presenceFromStore = chat.otherUserId ? isUserOnline(chat.otherUserId) : false;
  const finalOnline = chat.isOnline ?? presenceFromStore;

  console.log("[ChatItem] presence debug", {
    chatId: chat.id,
    otherUserId: chat.otherUserId,
    isOnline: chat.isOnline,
    presenceFromStore,
    finalOnline,
    showPresence
  });

  return (
    <div
      className={cn(
        "d-flex align-items-center px-3 py-2 gap-2",
        active ? "bg-primary bg-opacity-10" : "hover-bg"
      )}
      style={{ cursor: "pointer", minHeight: 62 }}
      onClick={onClick}
    >
      <div className="position-relative flex-shrink-0">
        <img
          src={avatarSrc}
          className="rounded-circle"
          style={{ width: 42, height: 42, objectFit: "cover" }}
          alt=""
          onError={(e) => {
            e.currentTarget.src = avatar(chat.chatName);
          }}
        />
        {showPresence && (
          <span
            className={cn(
              "position-absolute rounded-circle border border-white",
              finalOnline ? "bg-success" : "bg-secondary"
            )}
            style={{ width: 10, height: 10, right: -1, bottom: -1 }}
            title={finalOnline ? "Online" : "Offline"}
          />
        )}
        {chat.unreadCount > 0 && (
          <span
            className="position-absolute badge bg-danger rounded-pill"
            style={{ top: -2, right: -4, fontSize: 10, minWidth: 18, padding: "2px 5px" }}
          >
            {chat.unreadCount > 99 ? "99+" : chat.unreadCount}
          </span>
        )}
      </div>
      <div className="flex-grow-1 overflow-hidden">
        <div className="d-flex justify-content-between align-items-center">
          <span
            className={cn("text-truncate", chat.unreadCount > 0 ? "fw-semibold" : "fw-medium")}
            style={{ fontSize: 13, maxWidth: 170 }}
          >
            {chat.chatName}
          </span>
          <span className="text-muted flex-shrink-0 ms-1" style={{ fontSize: 11 }}>
            {fmt(chat.lastMessageAt)}
          </span>
        </div>
        <div
          className={cn(
            "text-truncate",
            chat.unreadCount > 0 ? "fw-medium text-dark" : "text-muted"
          )}
          style={{ fontSize: 12 }}
        >
          {preview ?? <span className="fst-italic">Chưa có tin nhắn</span>}
        </div>
      </div>
    </div>
  );
}

// ─── MessageGroup + MsgBubble  ───────────────────────

function MessageGroup({
  group,
  onReply
}: {
  group: MessageGroup;
  onReply: (msg: MessageDto) => void;
}) {
  const { messages, isOwn } = group;
  const info = getCachedUserInfo(UserId(group.senderId));
  return (
    <div
      className={cn("d-flex align-items-end gap-2 mb-1", isOwn ? "flex-row-reverse" : "flex-row")}
    >
      {!isOwn ? (
        <img
          src={info.avatar}
          className="rounded-circle flex-shrink-0"
          style={{ width: 28, height: 28, objectFit: "cover", marginBottom: 2 }}
          alt=""
        />
      ) : (
        <div style={{ width: 28, flexShrink: 0 }} />
      )}
      <div
        className={cn("d-flex flex-column gap-1", isOwn ? "align-items-end" : "align-items-start")}
        style={{ maxWidth: "70%" }}
      >
        {!isOwn && (
          <div
            className="small text-secondary px-1"
            style={{
              fontSize: 12,
              lineHeight: 1.2
            }}
          >
            {info.name}
          </div>
        )}
        {messages.map((msg, idx) => (
          <MsgBubble
            key={msg.id}
            msg={msg}
            isOwn={isOwn}
            isFirst={idx === 0}
            isLast={idx === messages.length - 1}
            showSenderName={!isOwn && idx === 0 && messages.length > 1}
            onReply={() => onReply(msg)}
          />
        ))}
      </div>
    </div>
  );
}

function MsgBubble({
  msg,
  isOwn,
  isFirst,
  isLast,
  showSenderName,
  onReply
}: {
  msg: MessageDto;
  isOwn: boolean;
  isFirst: boolean;
  isLast: boolean;
  showSenderName: boolean;
  onReply: () => void;
}) {
  const isImage = msg.messageType === 2;
  const isVideo = msg.messageType === 3;
  const isFile = msg.messageType === 6;
  const hasMedia = isImage || isVideo;
  const radius = isOwn
    ? {
      borderTopLeftRadius: "16px",
      borderTopRightRadius: isFirst ? "16px" : "4px",
      borderBottomRightRadius: isLast ? "16px" : "4px",
      borderBottomLeftRadius: "16px"
    }
    : {
      borderTopLeftRadius: isFirst ? "16px" : "4px",
      borderTopRightRadius: "16px",
      borderBottomRightRadius: "16px",
      borderBottomLeftRadius: isLast ? "16px" : "4px"
    };

  return (
    <div className="position-relative msg-bubble-wrapper">
      {(msg.replyToMessageContent || msg.replyToMessageFilePath) && (
        <div
          className={cn(
            "small rounded px-2 py-1 mb-1",
            isOwn ? "bg-primary bg-opacity-25" : "bg-white border"
          )}
          style={{
            borderLeft: isOwn ? undefined : "3px solid var(--bs-primary)",
            fontSize: 11,
            maxWidth: "100%"
          }}
        >
          <div className="text-primary fw-medium mb-1">
            {msg.replyToMessageType === 2 ? "Đã trả lời ảnh" : "Đã trả lời"}
          </div>

          {msg.replyToMessageType === 1 && (
            <div className="text-muted text-truncate overflow-hidden" style={{ maxWidth: "220px" }}>
              {msg.replyToMessageContent}
            </div>
          )}

          {msg.replyToMessageType === 2 && msg.replyToMessageFilePath && (
            <div className="d-flex align-items-center gap-2">
              <img
                src={msg.replyToMessageFilePath}
                alt="Ảnh trả lời"
                className="rounded flex-shrink-0"
                style={{
                  width: 52,
                  height: 52,
                  objectFit: "cover"
                }}
              />

              {msg.replyToMessageContent && (
                <div
                  className="text-muted text-truncate overflow-hidden"
                  style={{ maxWidth: "160px" }}
                >
                  {msg.replyToMessageContent}
                </div>
              )}
            </div>
          )}
        </div>
      )}
      <div
        className={cn(isOwn ? "bg-primary text-white" : "bg-white shadow-sm")}
        style={{
          ...radius,
          padding: hasMedia ? 0 : "7px 12px",
          wordBreak: "break-word",
          fontSize: 14,
          lineHeight: "1.45",
          display: "inline-block",
          maxWidth: "100%"
        }}
      >
        {isImage && msg.filePath ? (
          <img
            src={msg.filePath}
            alt=""
            className="rounded"
            style={{ maxWidth: 200, maxHeight: 200, objectFit: "cover", display: "block" }}
          />
        ) : isVideo && msg.filePath ? (
          <video
            src={msg.filePath}
            controls
            className="rounded"
            style={{ maxWidth: 320, maxHeight: 240, width: "100%", display: "block" }}
          />
        ) : isFile && msg.fileName ? (
          <a
            href={msg.filePath ?? "#"}
            target="_blank"
            rel="noreferrer"
            className={cn(
              "d-flex align-items-center gap-2 text-decoration-none",
              isOwn ? "text-white" : "text-dark"
            )}
          >
            <i className="ti ti-file fs-5" />
            <div>
              <div className="small fw-medium text-truncate" style={{ maxWidth: 150 }}>
                {msg.fileName}
              </div>
              {msg.fileSize && (
                <div className="small opacity-75">{(msg.fileSize / 1024).toFixed(1)} KB</div>
              )}
            </div>
          </a>
        ) : (
          msg.content
        )}
      </div>
      <div
        className={cn(
          "msg-actions d-flex align-items-center gap-1",
          isOwn ? "msg-actions-left" : "msg-actions-right"
        )}
      >
        {!isOwn && (
          <button
            className="btn btn-sm btn-light border rounded-circle d-flex align-items-center justify-content-center p-0"
            style={{ width: 24, height: 24, flexShrink: 0 }}
            onClick={onReply}
            title="Trả lời"
          >
            <i className="ti ti-corner-up-left" style={{ fontSize: 12 }} />
          </button>
        )}
        <span
          className="badge bg-light text-muted border"
          style={{ fontSize: 10, fontWeight: 400, whiteSpace: "nowrap" }}
        >
          {fmt(msg.createdAt)}
          {msg.isEdited && " (đã sửa)"}
        </span>
        {isOwn && (
          <button
            className="btn btn-sm btn-light border rounded-circle d-flex align-items-center justify-content-center p-0"
            style={{ width: 24, height: 24, flexShrink: 0 }}
            onClick={onReply}
            title="Trả lời"
          >
            <i className="ti ti-corner-up-left" style={{ fontSize: 12 }} />
          </button>
        )}
      </div>
    </div>
  );
}
