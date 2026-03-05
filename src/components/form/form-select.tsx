import { FormBase, type FormControlProps } from "@/components/form/form-base";
import { useFieldContext, useFieldInvalid } from "@/components/form/hooks";
import { cn } from "@/lib/utils";

type SelectOption = {
  label: string;
  value: string | number;
};

type SelectGroup = {
  label: string;
  options: SelectOption[];
};

type FormSelectProps = Omit<FormControlProps, "label"> & {
  label: string;
  options?: SelectOption[];
  groups?: SelectGroup[];
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  onLoadMore?: () => void;
};

export function FormSelect({
  label,
  options,
  groups,
  placeholder = "Select",
  className,
  disabled,
  onLoadMore,
  ...baseProps
}: FormSelectProps) {
  const field = useFieldContext<string | number>();
  const isInvalid = useFieldInvalid();

  const handleScroll = (e: React.UIEvent<HTMLSelectElement>) => {
    if (!onLoadMore) return;

    const target = e.currentTarget;
    const isBottom = target.scrollHeight - target.scrollTop <= target.clientHeight + 1;

    if (isBottom) {
      onLoadMore();
    }
  };

  return (
    <FormBase {...baseProps} label={label}>
      <select
        className={cn("form-control", isInvalid && "is-invalid", className)}
        value={field.state.value ?? ""}
        disabled={disabled}
        onBlur={field.handleBlur}
        onChange={(e) => field.handleChange(e.target.value)}
        onScroll={handleScroll}
        style={{ cursor: disabled ? "default" : "pointer" }}
      >
        <option value="" disabled>
          {placeholder}
        </option>

        {options?.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}

        {groups?.map((group) => (
          <optgroup key={group.label} label={group.label}>
            {group.options.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </optgroup>
        ))}
      </select>

      {isInvalid && (
        <div className="invalid-feedback d-block mt-1">{field.state.meta.errors?.[0]}</div>
      )}
    </FormBase>
  );
}
