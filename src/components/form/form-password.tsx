import { useState } from "react";
import { FormBase, type FormControlProps } from "./form-base";
import { useFieldContext, useFieldInvalid } from "./hooks";
import { cn } from "@/lib/utils";

type FormPasswordProps = FormControlProps & {
  placeholder?: string;
  wrapperClassName?: string;
};

export function FormPassword({
  placeholder,
  wrapperClassName = "input-group input-group-flat pass-group",
  ...baseProps
}: FormPasswordProps) {
  const field = useFieldContext<string>();
  const [visible, setVisible] = useState(false);

  //   const meta = field.state.meta;
  const isInvalid = useFieldInvalid();

  return (
    <FormBase {...baseProps}>
      <div className={wrapperClassName}>
        <input
          id={field.name}
          name={field.name}
          type={visible ? "text" : "password"}
          className={cn("form-control", {
            "is-invalid": isInvalid
          })}
          value={field.state.value ?? ""}
          onBlur={field.handleBlur}
          onChange={(e) => field.handleChange(e.target.value)}
          placeholder={placeholder}
        />

        <span
          className={cn("input-group-text", {
            "text-danger border-danger bg-danger-lt": isInvalid
          })}
          style={{ cursor: "pointer" }}
          onClick={() => setVisible((v) => !v)}
        >
          <i className={`ti ${visible ? "ti-eye" : "ti-eye-off"}`} />
        </span>
      </div>
    </FormBase>
  );
}
