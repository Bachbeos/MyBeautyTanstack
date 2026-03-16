import { FormBase, type FormControlProps } from "@/components/form/form-base";
import { useFieldContext, useFieldInvalid } from "@/components/form/hooks";
import { cn } from "@/lib/utils";

type CheckboxOption = {
  label: string;
  value: string;
};

type FormCheckboxGroupProps = Omit<FormControlProps, "label"> & {
  label: string;
  options: CheckboxOption[];
  className?: string;
  disabled?: boolean;
};

export function FormCheckboxGroup({
  label,
  options,
  className,
  disabled,
  ...baseProps
}: FormCheckboxGroupProps) {
  const field = useFieldContext<string[]>();
  const isInvalid = useFieldInvalid();

  const handleToggle = (val: string, checked: boolean) => {
    const currentValues = Array.isArray(field.state.value) ? field.state.value : [];
    if (checked) {
      field.handleChange([...currentValues, val]);
    } else {
      field.handleChange(currentValues.filter((v) => v !== val));
    }
  };

  return (
    <FormBase {...baseProps} label={label}>
      <div className={cn("d-flex gap-3 flex-wrap mt-2", className)}>
        {options.map((opt) => {
          const id = `${field.name}-${opt.value}`;
          const isChecked = field.state.value?.includes(opt.value);

          return (
            <div className="form-check" key={opt.value}>
              <input
                id={id}
                type="checkbox"
                className={cn("form-check-input", isInvalid && "is-invalid")}
                checked={!!isChecked}
                disabled={disabled}
                onBlur={field.handleBlur}
                onChange={(e) => handleToggle(opt.value, e.target.checked)}
                style={{ cursor: disabled ? "default" : "pointer" }}
              />
              <label
                className="form-check-label"
                htmlFor={id}
                style={{ cursor: disabled ? "default" : "pointer" }}
              >
                {opt.label}
              </label>
            </div>
          );
        })}
      </div>
    </FormBase>
  );
}
