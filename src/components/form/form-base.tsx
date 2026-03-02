import type { ReactNode } from "react";
import { useFieldContext } from "@/components/form/hooks";

type ErrorStrategy = "touched" | "dirty" | "submit" | "always";

export type FormControlProps = {
  label: string;
  description?: string;
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
  errorStrategy = "touched",
  wrapperClassName = "mb-3"
}: FormBaseProps) {
  const field = useFieldContext<any>();
  const meta = field.state.meta;

  const isInvalid = shouldShowError(errorStrategy, meta);
  const firstError = meta.errors?.find(Boolean)?.message;

  return (
    <div className={wrapperClassName}>
      <label className="form-label" htmlFor={field.name}>
        {label}
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
