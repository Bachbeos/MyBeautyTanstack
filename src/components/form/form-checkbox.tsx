import { FormBase, type FormControlProps } from "@/components/form/form-base";
import { useFieldContext, useFieldInvalid } from "@/components/form/hooks";
import { cn } from "@/lib/utils";

type FormCheckboxProps = Omit<FormControlProps, "label"> & {
  label: string;
  className?: string;
  disabled?: boolean;
};

export function FormCheckbox({ label, className, disabled, ...baseProps }: FormCheckboxProps) {
  const field = useFieldContext<boolean>();
  const isInvalid = useFieldInvalid();

  return (
    <FormBase {...baseProps} label="">
      <div className={cn("form-check", className)}>
        <input
          id={field.name}
          name={field.name}
          type="checkbox"
          className={cn("form-check-input", isInvalid && "is-invalid")}
          checked={!!field.state.value}
          onBlur={field.handleBlur}
          onChange={(e) => field.handleChange(e.target.checked)}
          disabled={disabled}
        />
        <label className="form-check-label" htmlFor={field.name}>
          {label}
        </label>
      </div>
    </FormBase>
  );
}
