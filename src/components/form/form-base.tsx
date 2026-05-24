import type { ReactNode } from "react";
import { useFieldContext } from "@/components/form/hooks";

type ErrorStrategy = "touched" | "dirty" | "submit" | "always";

export type FormControlProps = {
  label: string;
  description?: string;
  required?: boolean;
  disabled?: boolean;
  errorStrategy?: ErrorStrategy;
  wrapperClassName?: string;
};

function shouldShowError(strategy: ErrorStrategy, meta: any): boolean {
  switch (strategy) {
    case "always":
      return !meta.isValid;
    case "dirty":
      return meta.isDirty && !meta.isValid;
    case "submit":
      return Boolean(meta.submitCount && meta.submitCount > 0 && !meta.isValid);
    default:
      return meta.isTouched && !meta.isValid;
  }
}

type FormBaseProps = FormControlProps & {
  children: ReactNode;
};

export function FormBase({
  children,
  label,
  description,
  required,
  errorStrategy = "touched",
  wrapperClassName = "mb-0"
}: FormBaseProps) {
  const field = useFieldContext<any>();
  const meta = field.state.meta;

  const isInvalid = shouldShowError(errorStrategy, meta);
  const errorObj = meta.errors?.find(Boolean);
  const firstError =
    typeof errorObj === "object" && errorObj !== null && "message" in errorObj
      ? (errorObj as any).message
      : errorObj;

  return (
    <div className={wrapperClassName}>
      <label className="form-label" htmlFor={field.name}>
        {label}
        {required && <span className="text-danger ms-1">*</span>}
      </label>

      {children}

      {description && <small className="text-muted">{description}</small>}

      {isInvalid && firstError && (
        <div className="invalid-feedback d-block" role="alert">
          {firstError}
        </div>
      )}
    </div>
  );
}
