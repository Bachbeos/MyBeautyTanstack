import { useEffect } from "react";
import { z } from "zod";
import { useAppForm } from "@/components/form/hooks";
import type { AppointmentDto } from "@/lib/types/appointment";

const scheduleSchema = z
  .object({
    id: z.number().optional(),
    title: z.string().min(1, "Tiêu đề không được để trống"),
    type: z.number().default(1),
    customerId: z.number().optional(),
    userId: z.number().optional(),
    startTime: z.string().min(1, "Vui lòng chọn thời gian bắt đầu"),
    endTime: z.string().min(1, "Vui lòng chọn thời gian kết thúc"),
    content: z.string().optional(),
    note: z.string().optional()
  })
  .refine((data) => new Date(data.endTime) > new Date(data.startTime), {
    message: "Ngày kết thúc phải sau ngày bắt đầu",
    path: ["endTime"]
  });

type ScheduleFormValues = z.infer<typeof scheduleSchema>;

type SelectOption = {
  label: string;
  value: string | number;
};

type AppointmentFormProps = {
  mode: "add" | "edit" | "detail";
  appointment?: AppointmentDto;
  onSubmit: (values: ScheduleFormValues) => Promise<void>;
  customerOptions: SelectOption[];
  userOptions: SelectOption[];
  onLoadMoreCustomers?: () => void;
  onLoadMoreUsers?: () => void;
};

const TYPE_OPTIONS = [
  { label: "Lịch thực hiện dịch vụ", value: 1 },
  { label: "Lịch tư vấn", value: 2 },
  { label: "Họp nội bộ", value: 3 }
];

export function AppointmentForm({
  mode,
  appointment,
  onSubmit,
  customerOptions,
  userOptions,
  onLoadMoreCustomers,
  onLoadMoreUsers
}: AppointmentFormProps) {
  const isReadOnly = mode === "detail";

  const form = useAppForm({
    defaultValues: {
      id: appointment?.id || 0,
      title: appointment?.title || "",
      type: appointment?.type || 1,
      customerId: appointment?.customerId,
      userId: appointment?.userId,
      startTime: appointment?.startTime ? appointment.startTime.substring(0, 16) : "",
      endTime: appointment?.endTime ? appointment.endTime.substring(0, 16) : "",
      content: appointment?.content || "",
      note: appointment?.note || ""
    } as ScheduleFormValues,
    validators: { onSubmit: scheduleSchema as any },
    onSubmit: async ({ value }) => {
      await onSubmit(value);
    }
  });

  const scheduleType = form.state.values.type;

  useEffect(() => {
    if (appointment) {
      form.reset({
        ...appointment,
        startTime: appointment.startTime?.substring(0, 16),
        endTime: appointment.endTime?.substring(0, 16)
      });
    }
  }, [appointment]);

  return (
    <form
      id="appointment-form"
      onSubmit={(e) => {
        e.preventDefault();
        form.handleSubmit();
      }}
    >
      <div className="row gx-3">
        <div className="col-12 mb-3">
          <form.AppField name="title">
            {(f) => <f.Input label="Tiêu đề *" disabled={isReadOnly} placeholder="Nhập tiêu đề" />}
          </form.AppField>
        </div>

        <div className="col-12 mb-3">
          <form.AppField name="type">
            {(f) => <f.Select label="Loại lịch" options={TYPE_OPTIONS} disabled={isReadOnly} />}
          </form.AppField>
        </div>

        {scheduleType !== 3 && (
          <>
            <div className="col-md-6 mb-3">
              <form.AppField name="customerId">
                {(f) => (
                  <f.Select
                    label="Khách hàng *"
                    options={customerOptions}
                    onLoadMore={onLoadMoreCustomers}
                    disabled={isReadOnly}
                    placeholder="Chọn khách hàng..."
                  />
                )}
              </form.AppField>
            </div>
            <div className="col-md-6 mb-3">
              <form.AppField name="userId">
                {(f) => (
                  <f.Select
                    label="Nhân viên phụ trách"
                    options={userOptions}
                    onLoadMore={onLoadMoreUsers}
                    disabled={isReadOnly}
                    placeholder="Chọn nhân viên..."
                  />
                )}
              </form.AppField>
            </div>
          </>
        )}

        <div className="col-md-6 mb-3">
          <form.AppField name="startTime">
            {(f) => <f.Input label="Bắt đầu *" type="datetime-local" disabled={isReadOnly} />}
          </form.AppField>
        </div>

        <div className="col-md-6 mb-3">
          <form.AppField name="endTime">
            {(f) => <f.Input label="Kết thúc *" type="datetime-local" disabled={isReadOnly} />}
          </form.AppField>
        </div>

        <div className="col-12 mb-3">
          <form.AppField name="content">
            {(f) => (
              <f.Textarea
                label="Nội dung"
                rows={3}
                disabled={isReadOnly}
                placeholder="Nhập nội dung"
              />
            )}
          </form.AppField>
        </div>

        <div className="col-12 mb-3">
          <form.AppField name="note">
            {(f) => (
              <f.Textarea
                label="Ghi chú"
                rows={2}
                disabled={isReadOnly}
                placeholder="Nhập ghi chú"
              />
            )}
          </form.AppField>
        </div>
      </div>
    </form>
  );
}
