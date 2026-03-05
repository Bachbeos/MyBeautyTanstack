import Select from "react-select";
import { FormBase, type FormControlProps } from "@/components/form/form-base";
import { useFieldContext, useFieldInvalid } from "@/components/form/hooks";

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
  isClearable?: boolean;
};

export function FormSelect({
  label,
  options,
  groups,
  placeholder = "Chọn",
  disabled,
  onLoadMore,
  isClearable = true,
  ...baseProps
}: FormSelectProps) {
  const field = useFieldContext<string | number>();
  const isInvalid = useFieldInvalid();

  const selectOptions = groups
    ? groups.map((g) => ({ label: g.label, options: g.options }))
    : options;

  const getValue = () => {
    if (groups) {
      for (const group of groups) {
        const found = group.options.find((opt) => opt.value === field.state.value);
        if (found) return found;
      }
    }
    return options?.find((opt) => opt.value === field.state.value) || null;
  };

  return (
    <FormBase {...baseProps} label={label}>
      <Select
        instanceId={field.name}
        value={getValue()}
        onChange={(option: any) => field.handleChange(option ? option.value : "")}
        options={selectOptions}
        onBlur={field.handleBlur}
        placeholder={placeholder}
        isDisabled={disabled}
        isClearable={isClearable}
        onMenuScrollToBottom={onLoadMore}
        menuPortalTarget={typeof document !== "undefined" ? document.body : null}
        menuPosition="fixed"
        theme={(theme) => ({
          ...theme,
          colors: {
            ...theme.colors,
            primary: "#dc3545"
          }
        })}
        styles={{
          menuPortal: (base) => ({ ...base, zIndex: 9999 }),
          control: (base, state) => ({
            ...base,
            border: isInvalid
              ? "1.2px solid #dc3545"
              : state.isFocused
                ? "1.6px solid #dc3545"
                : "1.2px solid #e8e8e8",
            boxShadow: "none",
            "&:hover": {
              border: "1.2px solid #dc3545"
            },
            minHeight: "38px"
          }),
          placeholder: (base) => ({ ...base, fontSize: 14 }),
          option: (base) => ({ ...base, fontSize: 14 }),
          singleValue: (base) => ({ ...base, fontSize: 14, color: "#707070" })
        }}
        noOptionsMessage={({ inputValue }) =>
          inputValue ? `Không tìm thấy "${inputValue}"` : "Không có lựa chọn"
        }
      />
    </FormBase>
  );
}
