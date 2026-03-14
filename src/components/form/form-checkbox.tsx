import { FormBase, type FormControlProps } from "@/components/form/form-base";
import { useFieldContext } from "@/components/form/hooks";
import { BaseCheckbox } from "./base-checkbox";

type FormCheckboxProps = Omit<FormControlProps, "label"> & {
  label: string;
  fieldLabel?: string;
  className?: string;
  disabled?: boolean;
};

export function FormCheckbox({
  label,
  fieldLabel,
  className,
  disabled,
  ...baseProps
}: FormCheckboxProps) {
  const field = useFieldContext<boolean | number>();

  const id = `${field.name}-${label.replace(/\s+/g, "-").toLowerCase()}`;

  return (
    <FormBase {...baseProps} label={fieldLabel ?? ""}>
      <div className="mt-2">
        <BaseCheckbox
          id={id}
          label={label}
          className={className}
          disabled={disabled}
          checked={!!field.state.value}
          onChange={(checked) => field.handleChange(checked)}
        />
      </div>
    </FormBase>
  );
}
