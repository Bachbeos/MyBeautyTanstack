import {
  useRef,
  useState,
  useCallback,
  useEffect,
  type ChangeEvent,
  type KeyboardEvent
} from "react";
import EmojiPicker, { type EmojiClickData, Theme } from "emoji-picker-react";
import { cn } from "@/lib/utils";
import type { MessageDto } from "@/lib/types/chat";

// ── File type helpers ─────────────────────────────────────────────────────────

type FilePreviewType = "image" | "video" | "audio" | "document";

interface FilePreview {
  file: File;
  url: string;
  type: FilePreviewType;
}

const DOCUMENT_MIME_TYPES = new Set([
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/vnd.ms-powerpoint",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  "text/plain",
  "text/csv",
  "application/zip",
  "application/x-rar-compressed",
  "application/x-7z-compressed"
]);

function resolveFileType(file: File): FilePreviewType {
  if (file.type.startsWith("image/")) return "image";
  if (file.type.startsWith("video/")) return "video";
  if (file.type.startsWith("audio/")) return "audio";
  if (DOCUMENT_MIME_TYPES.has(file.type)) return "document";
  return "document";
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function getDocIcon(fileName: string): string {
  const ext = fileName.split(".").pop()?.toLowerCase() ?? "";
  const map: Record<string, string> = {
    pdf: "ti ti-file-type-pdf",
    doc: "ti ti-file-type-doc",
    docx: "ti ti-file-type-doc",
    xls: "ti ti-file-spreadsheet",
    xlsx: "ti ti-file-spreadsheet",
    ppt: "ti ti-file-type-ppt",
    pptx: "ti ti-file-type-ppt",
    zip: "ti ti-file-zip",
    rar: "ti ti-file-zip",
    "7z": "ti ti-file-zip",
    txt: "ti ti-file-text",
    csv: "ti ti-table"
  };
  return map[ext] ?? "ti ti-file";
}

// ── Props ─────────────────────────────────────────────────────────────────────

interface MessageInputProps {
  onSend: (params: {
    content?: string;
    file?: File;
    messageType: number;
    replyToMessageId?: number | null;
  }) => void;
  isPending?: boolean;
  replyTo?: MessageDto | null;
  onCancelReply?: () => void;
  onType?: () => void;
  onStopTyping?: () => void;
  disabled?: boolean;
}

// ── Component ─────────────────────────────────────────────────────────────────

export function MessageInput({
  onSend,
  isPending = false,
  replyTo,
  onCancelReply,
  onType,
  onStopTyping,
  disabled = false
}: MessageInputProps) {
  const [text, setText] = useState("");
  const [preview, setPreview] = useState<FilePreview | null>(null);
  const [showEmoji, setShowEmoji] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const emojiRef = useRef<HTMLDivElement>(null);

  // ── File picker ─────────────────────────────────────────────────────────────
  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const type = resolveFileType(file);

    // Revoke old URL
    if (preview?.url) URL.revokeObjectURL(preview.url);

    // Object URL works for local preview (không cần upload trước)
    const url = URL.createObjectURL(file);
    setPreview({ file, url, type });

    // Reset input value để có thể chọn lại cùng file
    e.target.value = "";
  };

  const removePreview = useCallback(() => {
    if (preview?.url) URL.revokeObjectURL(preview.url);
    setPreview(null);
  }, [preview]);

  // Cleanup object URL khi unmount
  useEffect(
    () => () => {
      if (preview?.url) URL.revokeObjectURL(preview.url);
    },
    []
  );

  // ── Emoji picker ────────────────────────────────────────────────────────────
  const handleEmojiClick = (data: EmojiClickData) => {
    const input = inputRef.current;
    if (!input) {
      setText((t) => t + data.emoji);
      return;
    }
    const start = input.selectionStart ?? text.length;
    const end = input.selectionEnd ?? text.length;
    const next = text.slice(0, start) + data.emoji + text.slice(end);
    const cursor = start + data.emoji.length;
    setText(next);
    // Restore cursor
    requestAnimationFrame(() => {
      input.focus();
      input.setSelectionRange(cursor, cursor);
    });
  };

  // Close emoji picker on outside click
  useEffect(() => {
    if (!showEmoji) return;
    const handler = (e: MouseEvent) => {
      if (
        emojiRef.current &&
        !emojiRef.current.contains(e.target as Node) &&
        !(e.target as Element).closest("[data-emoji-btn]")
      ) {
        setShowEmoji(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [showEmoji]);

  // ── Input change ────────────────────────────────────────────────────────────
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setText(e.target.value);
    onType?.();
  };

  // ── Send ────────────────────────────────────────────────────────────────────
  const handleSend = () => {
    const trimmed = text.trim();
    if (!trimmed && !preview) return;

    onSend({
      content: trimmed || undefined,
      file: preview?.file,
      messageType: preview ? resolveMessageType(preview.type) : 1,
      replyToMessageId: replyTo?.id ?? null
    });

    setText("");
    removePreview();
    setShowEmoji(false);
    onStopTyping?.();
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const canSend = (text.trim().length > 0 || !!preview) && !isPending && !disabled;

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <div className="position-relative">
      {/* ── Reply preview ──────────────────────────────────────────────────── */}
      {replyTo && (
        <div className="d-flex align-items-center px-3 py-2 bg-light border-top gap-2">
          <div className="flex-1 ps-2" style={{ borderLeft: "3px solid var(--bs-primary)" }}>
            <div className="text-primary small fw-medium">Trả lời</div>
            <div className="text-muted small text-truncate" style={{ maxWidth: 400 }}>
              {replyTo.content ?? replyTo.fileName ?? "Tệp đính kèm"}
            </div>
          </div>
          <button className="btn btn-sm btn-icon border-0" onClick={onCancelReply}>
            <i className="ti ti-x" />
          </button>
        </div>
      )}

      {/* ── File preview ────────────────────────────────────────────────────── */}
      {preview && (
        <div className="px-3 pt-2 pb-1 bg-light border-top">
          <div className="position-relative d-inline-block">
            <FilePreviewCard preview={preview} />
            <button
              type="button"
              onClick={removePreview}
              className="btn btn-danger btn-sm rounded-circle position-absolute d-flex align-items-center justify-content-center p-0"
              style={{ width: 20, height: 20, top: -6, right: -6, fontSize: 10 }}
            >
              <i className="ti ti-x" />
            </button>
          </div>
        </div>
      )}

      {/* ── Emoji picker ────────────────────────────────────────────────────── */}
      {showEmoji && (
        <div
          ref={emojiRef}
          className="position-absolute"
          style={{ bottom: "100%", right: 16, zIndex: 1050, marginBottom: 8 }}
        >
          <EmojiPicker
            onEmojiClick={handleEmojiClick}
            theme={Theme.AUTO}
            width={320}
            height={380}
            autoFocusSearch={false}
            skinTonesDisabled
            previewConfig={{ showPreview: false }}
          />
        </div>
      )}

      {/* ── Input bar ───────────────────────────────────────────────────────── */}
      <div className="px-3 py-2 border-top bg-white">
        {/* Hidden file input */}
        <input
          ref={fileRef}
          type="file"
          className="d-none"
          accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.csv,.zip,.rar,.7z"
          onChange={handleFileChange}
        />

        <div className="d-flex align-items-center gap-2">
          {/* Attach file */}
          <button
            type="button"
            className={cn("btn btn-icon border-0", preview ? "text-primary" : "text-muted")}
            onClick={() => fileRef.current?.click()}
            title="Đính kèm file"
            disabled={disabled}
          >
            <i className="ti ti-paperclip fs-5" />
          </button>

          {/* Emoji */}
          <button
            type="button"
            data-emoji-btn
            className={cn("btn btn-icon border-0", showEmoji ? "text-primary" : "text-muted")}
            onClick={() => setShowEmoji((v) => !v)}
            title="Emoji"
            disabled={disabled}
          >
            <i className="ti ti-mood-smile fs-5" />
          </button>

          {/* Text input */}
          <input
            ref={inputRef}
            className="form-control form-control-sm rounded-pill bg-white border-0"
            placeholder="Nhập tin nhắn..."
            value={text}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            onBlur={onStopTyping}
            disabled={disabled}
            maxLength={2000}
          />

          {/* Send */}
          <button
            type="button"
            className="btn btn-primary rounded-circle d-flex align-items-center justify-content-center flex-shrink-0"
            style={{ width: 36, height: 36, padding: 0 }}
            disabled={!canSend}
            onClick={handleSend}
          >
            {isPending ? (
              <span className="spinner-border spinner-border-sm text-white" />
            ) : (
              <i className="ti ti-send fs-14" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── FilePreviewCard ───────────────────────────────────────────────────────────

function FilePreviewCard({ preview }: { preview: FilePreview }) {
  const { file, url, type } = preview;

  if (type === "image") {
    return (
      <img
        src={url}
        alt="preview"
        className="rounded"
        style={{ maxWidth: 160, maxHeight: 120, objectFit: "cover", display: "block" }}
      />
    );
  }

  if (type === "video") {
    return (
      <video
        src={url}
        className="rounded"
        style={{ maxWidth: 200, maxHeight: 120, display: "block" }}
        controls
        muted
      />
    );
  }

  if (type === "audio") {
    return (
      <div
        className="d-flex align-items-center gap-2 bg-white border rounded px-3 py-2"
        style={{ minWidth: 180 }}
      >
        <i className="ti ti-music text-primary fs-4" />
        <div style={{ minWidth: 0 }}>
          <div className="small fw-medium text-truncate" style={{ maxWidth: 130 }}>
            {file.name}
          </div>
          <div className="text-muted" style={{ fontSize: 11 }}>
            {formatBytes(file.size)}
          </div>
        </div>
      </div>
    );
  }

  // Document
  const icon = getDocIcon(file.name);
  return (
    <div
      className="d-flex align-items-center gap-2 bg-white border rounded px-3 py-2"
      style={{ minWidth: 200, maxWidth: 240 }}
    >
      <div
        className="d-flex align-items-center justify-content-center rounded flex-shrink-0"
        style={{ width: 36, height: 36, background: "rgba(var(--bs-primary-rgb), 0.1)" }}
      >
        <i className={cn(icon, "text-primary fs-5")} />
      </div>
      <div style={{ minWidth: 0, flex: 1 }}>
        <div className="small fw-medium text-truncate">{file.name}</div>
        <div className="text-muted" style={{ fontSize: 11 }}>
          {formatBytes(file.size)}
        </div>
      </div>
    </div>
  );
}

// ── Helper ────────────────────────────────────────────────────────────────────

function resolveMessageType(type: FilePreviewType): number {
  // 1=TEXT 2=IMAGE 3=VIDEO 4=AUDIO 6=DOCUMENT
  return { image: 2, video: 3, audio: 4, document: 6 }[type] ?? 6;
}
