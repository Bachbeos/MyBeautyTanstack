import { FormBase, type FormControlProps } from "@/components/form/form-base";
import { useFieldContext, useFieldInvalid } from "@/components/form/hooks";
import { cn } from "@/lib/utils";

type FormPhoneProps = FormControlProps & {
  placeholder?: string;
  wrapperClassName?: string;
};

export function FormPhone({
  placeholder,
  wrapperClassName = "input-group input-group-flat",
  ...baseProps
}: FormPhoneProps) {
  const field = useFieldContext<string>();
  // const meta = field.state.meta;

  const isInvalid = useFieldInvalid();

  function normalize(value: string) {
    return value.replace(/[^\d+]/g, "");
  }

  return (
    <FormBase {...baseProps}>
      <div className={wrapperClassName}>
        <input
          id={field.name}
          name={field.name}
          type="tel"
          className={cn("form-control", {
            "is-invalid": isInvalid
          })}
          value={field.state.value ?? ""}
          onBlur={field.handleBlur}
          onChange={(e) => {
            const normalized = normalize(e.target.value);
            field.handleChange(normalized);
          }}
          placeholder={placeholder}
        />

        <span
          className={cn("input-group-text", {
            "text-danger border-danger bg-danger-lt": isInvalid
          })}
        >
          <i className="ti ti-phone" />
        </span>
      </div>
    </FormBase>
  );
}
