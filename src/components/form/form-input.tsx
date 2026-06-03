import { FormBase, type FormControlProps } from "@/components/form/form-base";
import { useFieldContext, useFieldInvalid } from "@/components/form/hooks";
import { cn } from "@/lib/utils";

type FormInputControlProps = FormControlProps & {
  placeholder?: string;
  type?: string;
  inputMode?: React.HTMLAttributes<HTMLInputElement>["inputMode"];
  className?: string;
  disabled?: boolean;
  list?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void;
};

export function FormInput({
  placeholder,
  type = "text",
  inputMode,
  className,
  disabled,
  list,
  onChange,
  onBlur,
  ...baseProps
}: FormInputControlProps) {
  const field = useFieldContext<string>();
  const isInvalid = useFieldInvalid();

  return (
    <FormBase {...baseProps}>
      <input
        id={field.name}
        name={field.name}
        type={type}
        inputMode={inputMode}
        value={field.state.value ?? ""}
        list={list}
        // onBlur={field.handleBlur}
        // onChange={(e) => field.handleChange(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        className={cn("form-control", isInvalid && "is-invalid", className)}
        onBlur={(e) => {
          field.handleBlur();
          onBlur?.(e);
        }}
        onChange={(e) => {
          field.handleChange(e.target.value);
          onChange?.(e);
        }}
      />
    </FormBase>
  );
}
