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
  onValueChange?: (value: string | number | "") => void;
  isClearable?: boolean;
  isMulti?: boolean;
  multiValueSeparator?: string;
};

export function FormSelect({
  label,
  options,
  groups,
  placeholder = "Chọn",
  disabled,
  onLoadMore,
  onValueChange,
  isClearable = true,
  isMulti = false,
  multiValueSeparator = ",",
  ...baseProps
}: FormSelectProps) {
  const field = useFieldContext<any>();
  const isInvalid = useFieldInvalid();

  const selectOptions = groups
    ? groups.map((g) => ({ label: g.label, options: g.options }))
    : options;

  const getFlatOptions = (): SelectOption[] => {
    if (groups) return groups.flatMap((g) => g.options);
    return options ?? [];
  };

  const parseMultiValue = (raw: unknown): string[] => {
    if (Array.isArray(raw)) {
      return raw.map((x) => String(x)).filter(Boolean);
    }

    if (typeof raw === "string") {
      const trimmed = raw.trim();
      if (!trimmed) return [];

      try {
        const parsed = JSON.parse(trimmed);
        if (Array.isArray(parsed)) {
          return parsed.map((x) => String(x)).filter(Boolean);
        }
      } catch {}

      return trimmed
        .split(multiValueSeparator)
        .map((x) => x.trim())
        .filter(Boolean);
    }

    if (raw == null) return [];
    return [String(raw)].filter(Boolean);
  };

  const getValue = () => {
    if (isMulti) {
      const flatOptions = getFlatOptions();
      const selectedValues = new Set(parseMultiValue(field.state.value));
      return flatOptions.filter((opt) => selectedValues.has(String(opt.value)));
    }

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
        onChange={(option: any) => {
          if (isMulti) {
            const selectedValues = Array.isArray(option)
              ? option.map((opt) => String(opt?.value ?? "")).filter(Boolean)
              : [];
            const nextValue = selectedValues.join(multiValueSeparator);
            field.handleChange(nextValue);
            onValueChange?.(nextValue);
            return;
          }

          const nextValue = option ? option.value : "";
          field.handleChange(nextValue);
          onValueChange?.(nextValue);
        }}
        options={selectOptions}
        onBlur={field.handleBlur}
        placeholder={placeholder}
        isDisabled={disabled}
        isClearable={isClearable}
        isMulti={isMulti}
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
          singleValue: (base) => ({ ...base, fontSize: 14, color: "#707070" }),
          multiValueLabel: (base) => ({ ...base, fontSize: 13 }),
          multiValueRemove: (base) => ({
            ...base,
            cursor: "pointer"
          })
        }}
        noOptionsMessage={({ inputValue }) =>
          inputValue ? `Không tìm thấy "${inputValue}"` : "Không có lựa chọn"
        }
      />
    </FormBase>
  );
}
