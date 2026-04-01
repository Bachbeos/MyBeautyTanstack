import { useState, useMemo } from "react";
import {
  useInfiniteQuery,
  useMutation,
  useQueryClient,
  type InfiniteData
} from "@tanstack/react-query";
import { useDebounceValue } from "@/hooks/use-debounce-value";
import { useInfiniteScroll } from "@/hooks/use-infinite-scroll";
import { chatMutations, chatKeys } from "@/lib/tanstack/options/chat";
import { cn } from "@/lib/utils";
import type { UserDto } from "@/lib/types/user";
import type { ChatView, CursorResult } from "@/lib/types/chat";
import type { ApiResponse } from "@/lib/types/common";
import { userQueries } from "@/lib/tanstack/options/user";

const avatar = (name: string) =>
  `https://ui-avatars.com/api/?name=${encodeURIComponent(name || "?")}&background=random&color=fff`;

interface Props {
  show: boolean;
  onClose: () => void;
  onCreated: (chat: ChatView) => void;
}

export function CreateChatModal({ show, onClose, onCreated }: Props) {
  const qc = useQueryClient();

  const [selected, setSelected] = useState<UserDto | null>(null);
  const [keyword, setKeyword] = useState("");
  const [debouncedKeyword] = useDebounceValue(keyword, 350);

  const userQ = useInfiniteQuery(
    userQueries.infinite({ keyword: debouncedKeyword || undefined, limit: 20 })
  );

  const users: UserDto[] = useMemo(
    () => userQ.data?.pages.flatMap((p) => p.result?.items ?? []) ?? [],
    [userQ.data]
  );

  const listRef = useInfiniteScroll<HTMLDivElement>({
    onLoadMore: () => userQ.fetchNextPage(),
    hasNextPage: userQ.hasNextPage ?? false,
    isFetching: userQ.isFetchingNextPage,
    direction: "bottom",
    threshold: 60
  });

  const createMutation = useMutation({
    ...chatMutations.createChat(),
    onSuccess: (res) => {
      const chat = res.result;
      if (!chat) return;

      // Prepend chat mới vào list cache
      type CC = InfiniteData<ApiResponse<CursorResult<ChatView>>>;
      qc.setQueryData<CC>(chatKeys.listCursor(), (old) => {
        if (!old) return old;
        const [first, ...rest] = old.pages;
        return {
          ...old,
          pages: [
            {
              ...first,
              result: first.result
                ? { ...first.result, data: [chat, ...(first.result.data ?? [])] }
                : first.result
            },
            ...rest
          ]
        };
      });

      handleClose();
      onCreated(chat);
    }
  });

  const handleClose = () => {
    setKeyword("");
    setSelected(null);
    onClose();
  };

  if (!show) return null;

  return (
    <>
      <div className="modal-backdrop fade show" style={{ zIndex: 1040 }} onClick={handleClose} />

      <div
        className="modal fade show d-block"
        style={{ zIndex: 1050 }}
        onClick={(e) => {
          if (e.target === e.currentTarget) handleClose();
        }}
      >
        <div className="modal-dialog modal-dialog-centered" style={{ maxWidth: 420 }}>
          <div className="modal-content border-0 shadow">
            {/* Header */}
            <div className="modal-header border-bottom px-4 py-3">
              <h6 className="modal-title fw-bold mb-0">Tạo cuộc trò chuyện</h6>
              <button className="btn btn-sm btn-icon border-0 text-muted" onClick={handleClose}>
                <i className="ti ti-x" />
              </button>
            </div>

            {/* Body */}
            <div className="modal-body p-0">
              {/* Search */}
              <div className="px-4 py-3 border-bottom">
                <div className="input-group input-group-sm">
                  <span className="input-group-text border-0 bg-light">
                    <i className="ti ti-search text-muted" />
                  </span>
                  <input
                    autoFocus
                    className="form-control border-0 bg-light"
                    placeholder="Tìm theo tên, email, số điện thoại..."
                    value={keyword}
                    onChange={(e) => setKeyword(e.target.value)}
                  />
                  {keyword && (
                    <button className="btn btn-light border-0" onClick={() => setKeyword("")}>
                      <i className="ti ti-x" />
                    </button>
                  )}
                </div>
              </div>

              {/* Selected preview */}
              {selected && (
                <div className="px-4 py-2 bg-primary bg-opacity-10 border-bottom d-flex align-items-center gap-2">
                  <img
                    src={selected.avatar || avatar(selected.name)}
                    className="rounded-circle flex-shrink-0"
                    style={{ width: 26, height: 26, objectFit: "cover" }}
                    alt=""
                  />
                  <span className="small fw-medium flex-1 text-truncate">{selected.name}</span>
                  <button
                    className="btn btn-sm btn-icon border-0 text-muted p-0"
                    onClick={() => setSelected(null)}
                  >
                    <i className="ti ti-x" style={{ fontSize: 12 }} />
                  </button>
                </div>
              )}

              {/* User list */}
              <div ref={listRef} style={{ maxHeight: 320, overflowY: "auto" }}>
                {userQ.isLoading && (
                  <div className="text-center py-4 text-muted small">
                    <span className="spinner-border spinner-border-sm me-1" />
                    Đang tải...
                  </div>
                )}

                {!userQ.isLoading && users.length === 0 && (
                  <div className="text-center py-5 text-muted small">
                    {debouncedKeyword ? "Không tìm thấy người dùng" : "Nhập tên để tìm kiếm"}
                  </div>
                )}

                {users.map((user) => {
                  const isSelected = Number(selected?.id) === Number(user.id);
                  return (
                    <div
                      key={String(user.id)}
                      className={cn(
                        "d-flex align-items-center px-4 py-2 gap-3 hover-bg",
                        isSelected && "bg-primary bg-opacity-10"
                      )}
                      style={{ cursor: "pointer", minHeight: 56 }}
                      onClick={() => setSelected(isSelected ? null : user)}
                    >
                      <img
                        src={user.avatar || avatar(user.name)}
                        className="rounded-circle flex-shrink-0"
                        style={{ width: 38, height: 38, objectFit: "cover" }}
                        alt=""
                        onError={(e) => {
                          e.currentTarget.src = avatar(user.name);
                        }}
                      />
                      <div className="flex-1 overflow-hidden">
                        <div className="fw-medium text-truncate" style={{ fontSize: 13 }}>
                          {user.name}
                        </div>
                        <div className="text-muted text-truncate" style={{ fontSize: 12 }}>
                          {user.email ?? user.phone ?? ""}
                        </div>
                      </div>
                      <div
                        className={cn(
                          "rounded-circle border d-flex align-items-center justify-content-center flex-shrink-0",
                          isSelected
                            ? "bg-primary border-primary text-white"
                            : "bg-white border-secondary"
                        )}
                        style={{ width: 20, height: 20 }}
                      >
                        {isSelected && <i className="ti ti-check" style={{ fontSize: 11 }} />}
                      </div>
                    </div>
                  );
                })}

                {userQ.isFetchingNextPage && (
                  <div className="text-center py-2">
                    <span className="spinner-border spinner-border-sm text-muted" />
                  </div>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="modal-footer border-top px-4 py-3 gap-2">
              <button
                className="btn btn-light border btn-sm"
                onClick={handleClose}
                disabled={createMutation.isPending}
              >
                Huỷ
              </button>
              <button
                className="btn btn-primary btn-sm d-flex align-items-center gap-2"
                disabled={!selected || createMutation.isPending}
                onClick={() =>
                  selected &&
                  createMutation.mutate({
                    isGroupChat: false,
                    memberIds: [Number(selected.id)]
                  })
                }
              >
                {createMutation.isPending ? (
                  <>
                    <span className="spinner-border spinner-border-sm" /> Đang tạo...
                  </>
                ) : (
                  <>
                    <i className="ti ti-message-plus" /> Bắt đầu chat
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
