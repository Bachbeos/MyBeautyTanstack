import { FormBase, type FormControlProps } from "@/components/form/form-base";
import { useFieldContext, useFieldInvalid } from "@/components/form/hooks";
import { cn } from "@/lib/utils";

type FormInputControlProps = FormControlProps & {
  placeholder?: string;
  type?: string;
  className?: string;
};

export function FormInput({
  placeholder,
  type = "text",
  className,
  ...baseProps
}: FormInputControlProps) {
  const field = useFieldContext<string>();
  // const meta = field.state.meta;

  const isInvalid = useFieldInvalid();

  return (
    <FormBase {...baseProps}>
      <input
        id={field.name}
        name={field.name}
        type={type}
        value={field.state.value ?? ""}
        onBlur={field.handleBlur}
        onChange={(e) => field.handleChange(e.target.value)}
        placeholder={placeholder}
        className={cn("form-control", isInvalid && "is-invalid", className)}
      />
    </FormBase>
  );
}
