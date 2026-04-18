import { useMemo, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";

import { cn } from "@/lib/utils";
import { EmailTemplateId, type EmailTemplateDto } from "@/lib/types/email-template";
import { emailTemplateMutations, emailTemplateQueries } from "@/lib/tanstack/options/email-template";

const PLACEHOLDER_REGEX = /\{\{\s*([^{}]+?)\s*\}\}/g;

type FieldItem = { key: string; label: string };

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function normalize(v: string) {
  return v.trim().toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_+|_+$/g, "");
}

function buildFields(html: string): FieldItem[] {
  const seen = new Map<string, FieldItem>();
  for (const match of html.matchAll(PLACEHOLDER_REGEX)) {
    const label = match[1]?.trim() ?? "";
    const key = normalize(label) || `field_${seen.size + 1}`;
    if (!seen.has(key)) seen.set(key, { key, label: label || key });
  }
  return [...seen.values()];
}

function render(html: string, values: Record<string, string>) {
  return html.replace(PLACEHOLDER_REGEX, (_, raw) => {
    const key = normalize(raw);
    return escapeHtml(values[key] ?? values[raw.trim()] ?? "");
  });
}

function doc(body: string, css: string) {
  return `<!doctype html><html lang="vi"><head><meta charset="utf-8" /><meta name="viewport" content="width=device-width, initial-scale=1" /><style>body{margin:0;font-family:Inter,Arial,sans-serif;background:#f8fafc;padding:24px;color:#0f172a}*{box-sizing:border-box}${css}</style></head><body class="body">${body}</body></html>`;
}

function parseTemplate(designJson: string) {
  try {
    return JSON.parse(designJson) as { htmlContent?: string; cssContent?: string };
  } catch {
    return { htmlContent: designJson, cssContent: "" };
  }
}

function TemplatePage() {
  const [currentId, setCurrentId] = useState<number | null>(null);
  const [templateName, setTemplateName] = useState("Template mới");
  const [htmlContent, setHtmlContent] = useState(`<section class="hero"><h1>Xin chào {{Tên khách hàng}}</h1><p>Chúng tôi gửi bạn thông tin mới nhất về <strong>{{Tên gói dịch vụ}}</strong>.</p></section>`);
  const [cssContent, setCssContent] = useState(`.hero{padding:28px;border-radius:20px;background:linear-gradient(135deg,#fff7ed,#fff);border:1px solid #fed7aa}.hero h1{margin:0 0 12px;color:#0f172a;font-size:30px}.hero p{margin:0;color:#334155;line-height:1.7}`);
  const [fieldValues, setFieldValues] = useState<Record<string, string>>({});

  const createMutation = useMutation(emailTemplateMutations.create());
  const updateMutation = useMutation(emailTemplateMutations.update());
  const { data } = useQuery(emailTemplateQueries.list({ page: 1, limit: 50 }));
  const templates = data?.result?.items ?? [];
  const fields = useMemo(() => buildFields(htmlContent), [htmlContent]);
  const previewHtml = useMemo(() => render(htmlContent, fieldValues), [htmlContent, fieldValues]);
  const previewDoc = useMemo(() => doc(previewHtml, cssContent), [previewHtml, cssContent]);

  const saveTemplate = () => {
    const payload = { name: templateName || "Template chưa đặt tên", designJson: JSON.stringify({ htmlContent, cssContent }) };
    if (currentId) updateMutation.mutate({ id: EmailTemplateId(currentId), body: payload });
    else createMutation.mutate(payload, { onSuccess: (res) => { const id = res?.result?.id; if (id) setCurrentId(id as number); } });
  };

  const loadTemplate = (template: EmailTemplateDto) => {
    const templateId = template.id as unknown as number;
    setCurrentId(templateId);
    setTemplateName(template.name);
    const parsed = parseTemplate(template.designJson);
    setHtmlContent(parsed.htmlContent ?? "");
    setCssContent(parsed.cssContent ?? "");
    setFieldValues({});
  };

  const resetEditor = () => {
    setCurrentId(null);
    setTemplateName("Template mới");
    setHtmlContent("");
    setCssContent("");
    setFieldValues({});
  };

  return (
    <div className="page-wrapper">
      <div className="content pb-0">
        <div className="card border-0 shadow-sm rounded-4 overflow-hidden">
          <div className="card-body p-0">
            <div className="row g-0">
              <div className="col-12 col-xl-3 border-end bg-white email-template-sidebar">
                <div className="email-template-sidebar__head">
                  <div className="fw-semibold">Template đã lưu</div>
                  <div className="small text-muted">Bấm để nạp template vào editor</div>
                </div>
                <div className="p-3 d-grid gap-2">
                  {templates.length === 0 ? (
                    <div className="text-muted small">Chưa có template nào.</div>
                  ) : (
                    templates.map((template) => {
                      const id = template.id as unknown as number;
                      const active = id === currentId;
                      return (
                        <button
                          key={id}
                          type="button"
                          className={cn("email-template-item text-start", active && "active")}
                          onClick={() => loadTemplate(template)}
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

              <div className="col-12 col-xl-4 border-end p-3 bg-light-subtle">
                <div className="fw-semibold mb-3">Trình soạn template</div>
                <div className="d-grid gap-3">
                  <input
                    className="form-control form-control-lg"
                    value={templateName}
                    onChange={(e) => setTemplateName(e.target.value)}
                    placeholder="Tên template"
                  />
                  <textarea
                    className="form-control font-monospace email-code-editor"
                    rows={18}
                    value={htmlContent}
                    onChange={(e) => setHtmlContent(e.target.value)}
                    spellCheck={false}
                    placeholder="Nhập HTML template..."
                  />
                  <textarea
                    className="form-control font-monospace email-code-editor"
                    rows={10}
                    value={cssContent}
                    onChange={(e) => setCssContent(e.target.value)}
                    spellCheck={false}
                    placeholder="Nhập CSS template..."
                  />
                  <div className="d-flex gap-2 flex-wrap">
                    <button className="btn btn-primary flex-fill" onClick={saveTemplate}>
                      {currentId ? "Cập nhật template" : "Lưu template"}
                    </button>
                    <button className="btn btn-outline-primary" onClick={resetEditor}>
                      Tạo mới
                    </button>
                  </div>
                </div>
              </div>

              <div className="col-12 col-xl-5 p-3 bg-white">
                <div className="d-flex align-items-center justify-content-between mb-3">
                  <div className="fw-semibold">Preview template</div>
                  <span className="badge text-bg-primary-subtle text-primary">{fields.length} biến động</span>
                </div>
                {fields.length > 0 ? (
                  <div className="card border-0 shadow-sm mb-3 rounded-4">
                    <div className="card-body">
                      <div className="fw-semibold mb-3">Dữ liệu động</div>
                      <div className="row g-3">
                        {fields.map((field) => (
                          <div key={field.key} className="col-12">
                            <label className="form-label">{field.label}</label>
                            <input
                              className="form-control"
                              value={fieldValues[field.key] ?? ""}
                              onChange={(e) => setFieldValues((current) => ({ ...current, [field.key]: e.target.value }))}
                              placeholder={`Nhập ${field.label.toLowerCase()}`}
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : null}
                <div className="card border-0 shadow-sm overflow-hidden rounded-4">
                  <iframe
                    title="template-preview"
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

      <style>{`
        .email-code-editor { min-height: 220px; border-radius: 18px; resize: vertical; }
        .email-template-sidebar__head { padding: 18px 18px 14px; border-bottom: 1px solid #e2e8f0; background: linear-gradient(180deg, #fff 0%, #f8fafc 100%); }
        .email-template-item { width: 100%; border: 1px solid #e2e8f0; background: #fff; border-radius: 18px; padding: 14px 16px; text-align: left; transition: all 0.18s ease; box-shadow: 0 1px 0 rgba(15, 23, 42, 0.02); }
        .email-template-item:hover { transform: translateY(-1px); border-color: rgba(249, 115, 22, 0.25); box-shadow: 0 12px 24px rgba(15, 23, 42, 0.06); }
        .email-template-item.active { border-color: rgba(249, 115, 22, 0.55); background: linear-gradient(135deg, rgba(255, 247, 237, 0.95), rgba(255, 255, 255, 1)); box-shadow: 0 12px 28px rgba(249, 115, 22, 0.12); }
      `}</style>
    </div>
  );
}

export const Route = createFileRoute("/_crm/_email/template")({ component: TemplatePage });
