import { cn } from "@/lib/utils";

type BaseCheckboxProps = {
  id?: string;
  label?: string;
  checked?: boolean;
  onChange?: (checked: boolean) => void;
  disabled?: boolean;
  className?: string;
};

export function BaseCheckbox({
  id,
  label,
  checked,
  onChange,
  disabled,
  className
}: BaseCheckboxProps) {
  return (
    <div className={cn("form-check", className)}>
      <input
        id={id}
        type="checkbox"
        className="form-check-input"
        checked={checked}
        disabled={disabled}
        onChange={(e) => onChange?.(e.target.checked)}
        style={{ cursor: disabled ? "default" : "pointer" }}
      />
      {label && (
        <label className="form-check-label" htmlFor={id} style={{ cursor: "pointer" }}>
          {label}
        </label>
      )}
    </div>
  );
}
