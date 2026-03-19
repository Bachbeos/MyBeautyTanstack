import { createFileRoute } from "@tanstack/react-router";
import { useRef, useState } from "react";
import EmailEditor, { type EditorRef, type EmailEditorProps } from "react-email-editor";
import { useMutation, useQuery } from "@tanstack/react-query";
import { z } from "zod";

import { EmailTemplateId, type EmailTemplateDto } from "@/lib/types/email-template";
import { emailTemplateMutations } from "@/lib/tanstack/options/email-template";
import { emailTemplateQueries } from "@/lib/tanstack/options/email-template";
import { mailMutations } from "@/lib/tanstack/options/mail";
import { cn } from "@/lib/utils";
import { useAppForm } from "@/components/form/hooks";

export const Route = createFileRoute("/_crm/_email/email")({
  component: EmailPage
});

const sendMailSchema = z.object({
  to: z.string().email("Email không hợp lệ"),
  subject: z.string().min(1, "Vui lòng nhập tiêu đề")
});

type SendMailValues = z.infer<typeof sendMailSchema>;

function EmailPage() {
  const emailEditorRef = useRef<EditorRef>(null);

  const [design, setDesign] = useState<Record<string, unknown> | null>(null);
  const [name, setName] = useState("");
  const [currentId, setCurrentId] = useState<number | null>(null);

  const createMutation = useMutation(emailTemplateMutations.create());
  const updateMutation = useMutation(emailTemplateMutations.update());
  const sendMailMutation = useMutation(mailMutations.send());

  const { data: listData } = useQuery(
    emailTemplateQueries.list({
      page: 1,
      limit: 50
    })
  );

  const templates = listData?.result?.items ?? [];

  const form = useAppForm({
    defaultValues: {
      to: "",
      subject: ""
    } satisfies SendMailValues,
    validators: {
      onSubmit: sendMailSchema
    },
    onSubmit: async ({ value }) => {
      const unlayer = emailEditorRef.current?.editor;

      unlayer?.exportHtml(({ html }: { html: string }) => {
        sendMailMutation.mutate({
          to: value.to,
          subject: value.subject,
          html
        });
      });
    }
  });

  const saveTemplate = () => {
    const unlayer = emailEditorRef.current?.editor;

    unlayer?.saveDesign((designData: Record<string, unknown>) => {
      const payload = {
        name: name || "Template chưa đặt tên",
        designJson: JSON.stringify(designData)
      };

      if (currentId) {
        updateMutation.mutate({
          id: EmailTemplateId(currentId),
          body: payload
        });
      } else {
        createMutation.mutate(payload, {
          onSuccess: (res) => {
            const id = res?.result?.id;
            if (id) setCurrentId(id as number);
          }
        });
      }

      setDesign(designData);
    });
  };

  const saveAsNewTemplate = () => {
    const unlayer = emailEditorRef.current?.editor;

    unlayer?.saveDesign((designData: Record<string, unknown>) => {
      const payload = {
        name: name || "Template mới",
        designJson: JSON.stringify(designData)
      };

      createMutation.mutate(payload, {
        onSuccess: (res) => {
          const id = res?.result?.id;
          if (id) setCurrentId(id as number);
        }
      });

      setDesign(designData);
    });
  };

  const clearCurrentTemplate = () => {
    const unlayer = emailEditorRef.current?.editor;

    setCurrentId(null);
    setName("");
    setDesign(null);

    unlayer?.loadDesign({});
  };

  const loadTemplateFromServer = (template: EmailTemplateDto) => {
    const unlayer = emailEditorRef.current?.editor;
    const parsed = JSON.parse(template.designJson);

    setCurrentId(template.id as unknown as number);
    setName(template.name);
    setDesign(parsed);

    unlayer?.loadDesign(parsed);
  };

  const onReady: EmailEditorProps["onReady"] = (unlayer) => {
    if (design) {
      unlayer.loadDesign(design);
    }
  };

  return (
    <div className="page-wrapper">
      <div className="content pb-0">
        <div className="d-flex align-items-center justify-content-between gap-2 mb-4 flex-wrap">
          <div>
            <h4 className="mb-1 fw-bold">
              Email Templates
              <span className="badge badge-soft-primary ms-2">{templates.length}</span>
            </h4>
            <div className="text-muted small">Email / Quản lý template</div>
          </div>

          <div className="gap-2 d-flex align-items-center flex-wrap">
            <button
              className="btn btn-primary"
              onClick={saveTemplate}
              disabled={createMutation.isPending || updateMutation.isPending}
            >
              {currentId ? "Cập nhật Template" : "Lưu Template"}
            </button>

            <button
              className="btn btn-outline-primary"
              onClick={saveAsNewTemplate}
              disabled={createMutation.isPending}
            >
              Lưu thành Template mới
            </button>

            <button
              className="btn btn-outline-danger"
              onClick={clearCurrentTemplate}
              disabled={!currentId && !design}
            >
              Bỏ chọn Template
            </button>
          </div>
        </div>

        <div className="card border-0 rounded-0 shadow-sm">
          <div className="card-body p-0">
            <div className="row g-0" style={{ height: "calc(100vh - 180px)" }}>
              <div className="col-3 border-end p-3 overflow-auto">
                <h6 className="fw-bold mb-3">Danh sách Template</h6>

                {templates.map((t) => (
                  <div
                    key={t.id as unknown as number}
                    onClick={() => loadTemplateFromServer(t)}
                    className={cn(
                      "p-2 mb-2 border rounded cursor-pointer",
                      (t.id as unknown as number) === currentId
                        ? "bg-light border-primary"
                        : "bg-white"
                    )}
                  >
                    <div className="fw-semibold">{t.name}</div>
                    <div className="text-muted small">ID: {t.id as unknown as number}</div>
                  </div>
                ))}
              </div>

              <div className="col-6 border-end">
                <EmailEditor ref={emailEditorRef} onReady={onReady} />
              </div>

              <div className="col-3 p-3">
                <div className="mb-3">
                  <label className="form-label">Tên Template</label>
                  <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="form-control"
                    placeholder="Nhập tên template"
                  />
                </div>

                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    form.handleSubmit();
                  }}
                >
                  <div className="mb-3">
                    <form.AppField name="to">
                      {(field) => (
                        <field.Input label="Email nhận" required placeholder="example@gmail.com" />
                      )}
                    </form.AppField>
                  </div>

                  <div className="mb-3">
                    <form.AppField name="subject">
                      {(field) => (
                        <field.Input label="Tiêu đề" required placeholder="Nhập tiêu đề email" />
                      )}
                    </form.AppField>
                  </div>

                  <div className="d-grid gap-2">
                    <button
                      type="submit"
                      className="btn btn-success"
                      disabled={sendMailMutation.isPending}
                    >
                      Gửi Email
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
