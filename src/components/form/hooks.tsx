import { FormInput } from "@/components/form/form-input";
import { FormPassword } from "@/components/form/form-password";
import { FormPhone } from "@/components/form/form-phone";
import { FormTextarea } from "@/components/form/form-textarea";
import { createFormHook, createFormHookContexts } from "@tanstack/react-form";
import { FormCheckbox } from "@/components/form/form-checkbox";
import { FormRadioButton } from "./form-radio-button";
import { FormCheckboxGroup } from "./form-checkbox-group";
import { FormSelect } from "./form-select";

const { fieldContext, formContext, useFieldContext, useFormContext } = createFormHookContexts();

const { useAppForm } = createFormHook({
  fieldComponents: {
    Input: FormInput,
    Password: FormPassword,
    Phone: FormPhone,
    Textarea: FormTextarea,
    Checkbox: FormCheckbox,
    Radio: FormRadioButton,
    FormCheckboxGroup: FormCheckboxGroup,
    Select: FormSelect
  },
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
