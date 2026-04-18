import { useMemo, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { toast } from "sonner";

import { cn } from "@/lib/utils";
import { sendMail } from "@/lib/api/mail";
import { emailTemplateQueries } from "@/lib/tanstack/options/email-template";

const PLACEHOLDER_REGEX = /\{\{\s*([^{}]+?)\s*\}\}/g;

type FieldItem = {
  key: string;
  label: string;
};

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function normalize(value: string) {
  return value.trim().toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_+|_+$/g, "");
}

function buildFields(html: string): FieldItem[] {
  const seen = new Map<string, FieldItem>();

  for (const match of html.matchAll(PLACEHOLDER_REGEX)) {
    const label = match[1]?.trim() ?? "";
    const key = normalize(label) || `field_${seen.size + 1}`;

    if (!seen.has(key)) {
      seen.set(key, { key, label: label || key });
    }
  }

  return [...seen.values()];
}

function renderTemplate(html: string, values: Record<string, string>) {
  return html.replace(PLACEHOLDER_REGEX, (_, raw) => {
    const key = normalize(raw);
    const value = values[key] ?? values[raw.trim()] ?? "";
    return escapeHtml(value);
  });
}

function parseTemplate(designJson: string) {
  try {
    return JSON.parse(designJson) as { htmlContent?: string; cssContent?: string };
  } catch {
    return { htmlContent: designJson, cssContent: "" };
  }
}

function buildPreviewDocument(body: string, css: string) {
  return `<!doctype html>
<html lang="vi">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <style>
      ${css}
    </style>
  </head>
  <body>
      ${body}
  </body>
</html>`;
}

function SendPage() {
  const [templateId, setTemplateId] = useState<number | null>(null);
  const [fieldValues, setFieldValues] = useState<Record<string, string>>({});
  const [to, setTo] = useState("");
  const [subject, setSubject] = useState("");
  const [error, setError] = useState<string | null>(null);

  const { data } = useQuery(emailTemplateQueries.list({ page: 1, limit: 50 }));
  const templates = data?.result?.items ?? [];
  const selectedTemplate = templates.find((template) => (template.id as unknown as number) === templateId) ?? null;

  const parsed = useMemo(() => {
    if (!selectedTemplate) return { htmlContent: "", cssContent: "" };
    return parseTemplate(selectedTemplate.designJson);
  }, [selectedTemplate]);

  const fields = useMemo(() => buildFields(parsed.htmlContent ?? ""), [parsed.htmlContent]);
  const renderedHtml = useMemo(() => renderTemplate(parsed.htmlContent ?? "", fieldValues), [parsed.htmlContent, fieldValues]);
  const previewDoc = useMemo(() => buildPreviewDocument(renderedHtml, parsed.cssContent ?? ""), [renderedHtml, parsed.cssContent]);

  const mailMutation = useMutation({
    mutationFn: sendMail,
    onSuccess: () => {
      toast.success("Gửi email thành công");
      setError(null);
    },
    onError: (err) => {
      const message = err instanceof Error ? err.message : "Gửi email thất bại";
      setError(message || "Gửi email thất bại");
      toast.error("Gửi email thất bại");
    }
  });

  const handleSend = async (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    if (!to.trim()) {
      setError("Vui lòng nhập email nhận");
      return;
    }

    if (!subject.trim()) {
      setError("Vui lòng nhập tiêu đề");
      return;
    }

    if (!selectedTemplate) {
      setError("Vui lòng chọn template trước khi gửi");
      return;
    }

    const html = buildPreviewDocument(renderedHtml, parsed.cssContent ?? "");

    await mailMutation.mutateAsync({
      to,
      subject,
      templateId,
      variables: fieldValues,
      html
    });
  };

  return (
    <div className="page-wrapper email-page">
      <div className="content pb-0">
        <div className="card border-0 shadow-sm rounded-4 overflow-hidden">
          <div className="card-body p-0">
            <div className="row g-0">
              <div className="col-12 col-xl-3 border-end bg-white email-send-sidebar">
                <div className="email-send-sidebar__head">
                  <div className="fw-semibold">Template đã lưu</div>
                  <div className="small text-muted">Chọn template để gửi mail</div>
                </div>

                <div className="p-3 d-grid gap-2">
                  {templates.length === 0 ? (
                    <div className="text-muted small">Chưa có template nào.</div>
                  ) : (
                    templates.map((template) => {
                      const id = template.id as unknown as number;
                      const active = id === templateId;

                      return (
                        <button
                          key={id}
                          type="button"
                          className={cn("email-template-item text-start", active && "active")}
                          onClick={() => {
                            setTemplateId(id);
                            setFieldValues({});
                            setError(null);
                          }}
                        >
                          <div className="d-flex align-items-start justify-content-between gap-2">
                            <div>
                              <div className="fw-semibold text-truncate">{template.name}</div>
                              <div className="small text-muted">ID: {id}</div>
                            </div>
                            {active ? <span className="badge rounded-pill text-bg-primary">Đang chọn</span> : null}
                          </div>
                        </button>
                      );
                    })
                  )}
                </div>
              </div>

              <div className="col-12 col-xl-9 bg-light-subtle p-3 p-xl-4">
                <div className="card border-0 shadow-sm rounded-4 mb-3 overflow-hidden">
                  <div className="card-body p-4 d-flex align-items-start justify-content-between gap-3 flex-wrap">
                    <div>
                      <div className="d-inline-flex align-items-center gap-2 px-3 py-2 rounded-pill email-page__eyebrow mb-3">
                        <span className="email-page__eyebrow-dot" />
                        <span>Gửi mail bằng template</span>
                      </div>
                      <h4 className="mb-2 fw-bold">{selectedTemplate?.name ?? "Chưa chọn template"}</h4>
                      <div className="text-muted small" style={{ maxWidth: 860 }}>
                        Nhập dữ liệu trong form rồi xem preview ngay bên dưới trước khi gửi.
                      </div>
                    </div>

                    <div className="d-flex align-items-center gap-2 flex-wrap">
                      <span className="badge rounded-pill text-bg-primary-subtle text-primary">{fields.length} tham số động</span>
                    </div>
                  </div>
                </div>

                <div className="row g-3">
                  <div className="col-12 col-xxl-4">
                    <div className="card border-0 shadow-sm rounded-4 h-100">
                      <div className="card-body p-4">
                        <div className="fw-semibold mb-3">Thông tin gửi mail</div>
                        <form onSubmit={handleSend}>
                          <div className="mb-3">
                            <label className="form-label">Email nhận</label>
                            <input
                              className="form-control"
                              value={to}
                              onChange={(e) => setTo(e.target.value)}
                              placeholder="example@gmail.com"
                            />
                          </div>
                          <div className="mb-3">
                            <label className="form-label">Tiêu đề</label>
                            <input
                              className="form-control"
                              value={subject}
                              onChange={(e) => setSubject(e.target.value)}
                              placeholder="Nhập tiêu đề email"
                            />
                          </div>

                          {error ? <div className="alert alert-danger py-2">{error}</div> : null}

                          <button className="btn btn-success w-100" type="submit" disabled={mailMutation.isPending || !selectedTemplate}>
                            {mailMutation.isPending ? "Đang gửi..." : "Gửi email"}
                          </button>
                        </form>
                      </div>
                    </div>
                  </div>

                  <div className="col-12 col-xxl-8">
                    <div className="card border-0 shadow-sm rounded-4 overflow-hidden">
                      <div className="card-header bg-white border-0 py-3 px-4 d-flex align-items-center justify-content-between flex-wrap gap-2">
                        <div>
                          <div className="fw-semibold">Render & nhập liệu</div>
                          <div className="small text-muted">Inputs nằm cùng chỗ với preview để thao tác nhanh hơn.</div>
                        </div>
                      </div>

                      <div className="card-body p-4 d-grid gap-3">
                        {fields.length > 0 ? (
                          <div className="d-flex flex-wrap gap-2">
                            {fields.map((field) => (
                              <div key={field.key} className="email-inline-field">
                                <label className="form-label small mb-1">{field.label}</label>
                                <input
                                  className="form-control"
                                  value={fieldValues[field.key] ?? ""}
                                  onChange={(e) => setFieldValues((current) => ({ ...current, [field.key]: e.target.value }))}
                                  placeholder={`Nhập ${field.label.toLowerCase()}`}
                                />
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="text-muted small">Template này chưa có placeholder nào.</div>
                        )}

                        <div className="card border-0 shadow-sm overflow-hidden rounded-4">
                          <iframe
                            title="mail-preview"
                            className="w-100 border-0"
                            style={{ minHeight: 760, background: "#fff" }}
                            srcDoc={previewDoc}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .email-page__eyebrow { width: fit-content; background: rgba(249, 115, 22, 0.12); color: #c2410c; font-weight: 600; letter-spacing: 0.02em; }
        .email-page__eyebrow-dot { width: 10px; height: 10px; border-radius: 999px; background: linear-gradient(135deg, #f97316, #fb7185); box-shadow: 0 0 0 6px rgba(249, 115, 22, 0.12); }
        .email-send-sidebar__head { padding: 18px 18px 14px; border-bottom: 1px solid #e2e8f0; background: linear-gradient(180deg, #fff 0%, #f8fafc 100%); }
        .email-template-item { width: 100%; border: 1px solid #e2e8f0; background: #fff; border-radius: 18px; padding: 14px 16px; text-align: left; transition: all 0.18s ease; box-shadow: 0 1px 0 rgba(15, 23, 42, 0.02); }
        .email-template-item:hover { transform: translateY(-1px); border-color: rgba(249, 115, 22, 0.25); box-shadow: 0 12px 24px rgba(15, 23, 42, 0.06); }
        .email-template-item.active { border-color: rgba(249, 115, 22, 0.55); background: linear-gradient(135deg, rgba(255, 247, 237, 0.95), rgba(255, 255, 255, 1)); box-shadow: 0 12px 28px rgba(249, 115, 22, 0.12); }
        .email-inline-field { flex: 1 1 260px; min-width: 260px; }
      `}</style>
    </div>
  );
}

export const Route = createFileRoute("/_crm/_email/send")({
  component: SendPage
});
