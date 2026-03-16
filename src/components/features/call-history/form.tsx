import { z } from "zod";
import { useAppForm } from "@/components/form/hooks";
import type { callHistoryDto } from "@/lib/types/call-history";
import { useEffect } from "react";

const callHistorySchema = z.object({
  id: z.custom<callHistoryDto["id"]>().or(z.undefined()),
  userId: z.number().min(1, "Vui lòng chọn nhân viên"),
  customerId: z.number().min(1, "Vui lòng chọn khách hàng"),
  callType: z.number(),
  outcome: z.number(),
  duration: z.number().int().min(0),
  interestLevel: z.number().int().min(0).max(5),
  note: z.string(),
  status: z.number()
});

type CallHistoryFormValues = z.infer<typeof callHistorySchema>;

type CallHistoryFormProps = {
  mode: "add" | "edit" | "detail";
  callHistory?: callHistoryDto;
  userOptions: { label: string; value: number }[];
  customerOptions: { label: string; value: number }[];
  onSubmit: (values: CallHistoryFormValues) => Promise<void>;
  onLoadMoreUsers?: () => void;
  onLoadMoreCustomers?: () => void;
};

export function CallHistoryForm({
  mode,
  callHistory,
  userOptions,
  customerOptions,
  onSubmit,
  onLoadMoreUsers,
  onLoadMoreCustomers
}: CallHistoryFormProps) {
  const isReadOnly = mode === "detail";

  const outcomeOptions = [
    { label: "Gọi đến", value: 1 },
    { label: "Gọi đi", value: 2 },
    { label: "Gọi nhỡ", value: 3 }
  ];

  const form = useAppForm({
    defaultValues: {
      id: callHistory?.id,
      userId: callHistory?.userId ?? 0,
      customerId: callHistory?.customerId ?? 0,
      callType: callHistory?.callType ?? 1,
      outcome: callHistory?.outcome ?? 1,
      duration: callHistory?.duration ?? 0,
      interestLevel: callHistory?.interestLevel ?? 3,
      note: callHistory?.note ?? "",
      status: callHistory?.status ?? 1
    },
    validators: { onSubmit: callHistorySchema },
    onSubmit: async ({ value }) => {
      const payload = { ...value };
      if (payload.outcome === 3) {
        payload.duration = 0;
        payload.interestLevel = 0;
      }
      await onSubmit(payload);
    }
  });

  const currentOutcome = form.state.values.outcome;

  useEffect(() => {
    if (callHistory) {
      form.reset({
        id: callHistory?.id,
        userId: callHistory?.userId ?? 0,
        customerId: callHistory?.customerId ?? 0,
        callType: callHistory?.callType ?? 1,
        outcome: callHistory?.outcome ?? 1,
        duration: callHistory?.duration ?? 0,
        interestLevel: callHistory?.interestLevel ?? 3,
        note: callHistory?.note ?? "",
        status: callHistory?.status ?? 1
      });
    }
  }, [callHistory]);

  return (
    <form
      id="call-history-form"
      onSubmit={(e) => {
        e.preventDefault();
        form.handleSubmit();
      }}
    >
      <div className="row">
        <div className="col-md-6 mb-3">
          <form.AppField name="userId">
            {(field) => (
              <field.Select
                label="Nhân viên"
                required
                options={userOptions}
                disabled={isReadOnly}
                onLoadMore={onLoadMoreUsers}
              />
            )}
          </form.AppField>
        </div>

        <div className="col-md-6 mb-3">
          <form.AppField name="customerId">
            {(field) => (
              <field.Select
                label="Khách hàng"
                required
                options={customerOptions}
                disabled={isReadOnly}
                onLoadMore={onLoadMoreCustomers}
              />
            )}
          </form.AppField>
        </div>

        <div className="col-md-6 mb-3">
          <form.AppField name="callType">
            {(field) => (
              <field.Radio
                label="Loại cuộc gọi"
                options={[
                  { label: "Audio", value: 1 },
                  { label: "Video", value: 2 }
                ]}
                disabled={isReadOnly}
                inline
              />
            )}
          </form.AppField>
        </div>

        <div className="col-md-6 mb-3">
          <form.AppField name="status">
            {(field) => (
              <field.Radio
                label="Trạng thái"
                options={[
                  { label: "Đang hoạt động", value: 1 },
                  { label: "Ngưng hoạt động", value: 0 }
                ]}
                disabled={isReadOnly}
                inline
              />
            )}
          </form.AppField>
        </div>

        <div className="col-md-6 mb-3">
          <form.AppField name="outcome">
            {(field) => (
              <field.Select
                label="Kết quả cuộc gọi"
                options={outcomeOptions}
                disabled={isReadOnly}
              />
            )}
          </form.AppField>
        </div>

        <div className="col-md-6 mb-3">
          <form.AppField name="duration">
            {(field) => (
              <field.Input
                type="number"
                label="Thời lượng (giây)"
                disabled={isReadOnly || currentOutcome === 3}
              />
            )}
          </form.AppField>
        </div>

        <div className="col-12">
          <form.AppField name="interestLevel">
            {(field) => (
              <div className="mb-3">
                <label className="form-label me-3">Mức độ hài lòng:</label>
                <div
                  className={`d-inline-flex gap-2 align-items-center ${currentOutcome === 3 || isReadOnly ? "opacity-50 pe-none" : ""}`}
                >
                  {[1, 2, 3, 4, 5].map((star) => (
                    <i
                      key={star}
                      className={`ti ti-star fs-4 cursor-pointer ${field.state.value >= star ? "text-warning" : "text-muted"}`}
                      onClick={() => !isReadOnly && field.handleChange(star)}
                    ></i>
                  ))}
                </div>
              </div>
            )}
          </form.AppField>
        </div>

        <div className="col-12">
          <form.AppField name="note">
            {(field) => (
              <field.Textarea
                label="Ghi chú"
                rows={3}
                placeholder="Nội dung cuộc gọi"
                disabled={isReadOnly}
              />
            )}
          </form.AppField>
        </div>
      </div>
    </form>
  );
}
