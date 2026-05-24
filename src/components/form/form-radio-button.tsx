import { FormBase, type FormControlProps } from "@/components/form/form-base";
import { useFieldContext, useFieldInvalid } from "@/components/form/hooks";
import { cn } from "@/lib/utils";

type RadioOption = {
  label: string;
  value: string | number;
};

type FormRadioButtonProps = Omit<FormControlProps, "label"> & {
  label: string;
  options: RadioOption[];
  className?: string;
  disabled?: boolean;
  inline?: boolean;
};

export function FormRadioButton({
  label,
  options,
  className,
  disabled,
  inline = true,
  ...baseProps
}: FormRadioButtonProps) {
  const field = useFieldContext<string | number>();
  const isInvalid = useFieldInvalid();

  return (
    <FormBase {...baseProps} label={label}>
      <div className={cn("mt-2", className)}>
        {options.map((option) => {
          const id = `${field.name}-${option.value}`;
          const isChecked = field.state.value === option.value;

          return (
            <div
              key={option.value}
              className={cn("form-check", inline ? "form-check-inline" : "mb-1")}
            >
              <input
                className={cn("form-check-input", isInvalid && "is-invalid")}
                type="radio"
                name={field.name}
                id={id}
                value={option.value}
                checked={isChecked}
                disabled={disabled}
                onBlur={field.handleBlur}
                onChange={() => field.handleChange(option.value)}
                style={{ cursor: disabled ? "default" : "pointer" }}
              />
              <label
                className="form-check-label"
                htmlFor={id}
                style={{ cursor: disabled ? "default" : "pointer" }}
              >
                {option.label}
              </label>
            </div>
          );
        })}

        {isInvalid && (
          <div className="invalid-feedback d-block mt-1">
            {(() => {
              const err = field.state.meta.errors?.[0];
              return typeof err === "object" && err !== null && "message" in err
                ? (err as any).message
                : err;
            })()}
          </div>
        )}
      </div>
    </FormBase>
  );
}
