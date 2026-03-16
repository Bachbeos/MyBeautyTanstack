import { FormBase, type FormControlProps } from "@/components/form/form-base";
import { useFieldContext, useFieldInvalid } from "@/components/form/hooks";
import { cn } from "@/lib/utils";

type FormTextareaProps = FormControlProps & {
  placeholder?: string;
  rows?: number;
  className?: string;
  disabled?: boolean;
  onChange?: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  onBlur?: (e: React.FocusEvent<HTMLTextAreaElement>) => void;
};

export function FormTextarea({
  placeholder,
  rows = 3,
  className,
  disabled,
  onChange,
  onBlur,
  ...baseProps
}: FormTextareaProps) {
  const field = useFieldContext<string>();
  const isInvalid = useFieldInvalid();

  return (
    <FormBase {...baseProps}>
      <textarea
        id={field.name}
        name={field.name}
        rows={rows}
        value={field.state.value ?? ""}
        onBlur={(e) => {
          field.handleBlur();
          onBlur?.(e);
        }}
        onChange={(e) => {
          field.handleChange(e.target.value);
          onChange?.(e);
        }}
        placeholder={placeholder}
        disabled={disabled}
        className={cn("form-control", isInvalid && "is-invalid", className)}
      />
    </FormBase>
  );
}
