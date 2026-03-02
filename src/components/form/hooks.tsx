import { FormInput } from "@/components/form/form-input";
import { FormPassword } from "@/components/form/form-password";
import { FormPhone } from "@/components/form/form-phone";
import { createFormHook, createFormHookContexts } from "@tanstack/react-form";

const { fieldContext, formContext, useFieldContext, useFormContext } = createFormHookContexts();

const { useAppForm } = createFormHook({
  fieldComponents: { Input: FormInput, Password: FormPassword, Phone: FormPhone },
  formComponents: {},
  fieldContext,
  formContext
});

function useFieldInvalid() {
  const field = useFieldContext<any>();
  return (
    field.state.meta.errors.length > 0 &&
    (field.state.meta.isTouched || field.form.state.isSubmitted)
  );
}

export { useAppForm, useFieldContext, useFormContext, useFieldInvalid };
