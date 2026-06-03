import Select from "react-select";

export type AppSelectOption = {
  label: string;
  value: string | number;
};

type AppSelectProps = {
  value?: AppSelectOption | AppSelectOption[] | null;
  options: AppSelectOption[];
  placeholder?: string;
  isDisabled?: boolean;
  isClearable?: boolean;
  isMulti?: boolean;
  onChange?: (value: AppSelectOption | AppSelectOption[] | null) => void;
  onMenuScrollToBottom?: () => void;
  className?: string;
};

export default function AppSelect({
  value,
  options,
  placeholder = "Chọn",
  isDisabled,
  isClearable = true,
  isMulti = false,
  onChange,
  onMenuScrollToBottom,
  className
}: AppSelectProps) {
  return (
    <Select
      className={className}
      value={value as any}
      onChange={(next) => onChange?.((next as any) ?? null)}
      options={options}
      placeholder={placeholder}
      isDisabled={isDisabled}
      isClearable={isClearable}
      isMulti={isMulti}
      onMenuScrollToBottom={onMenuScrollToBottom}
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
          border: state.isFocused ? "1.6px solid #dc3545" : "1.2px solid #e8e8e8",
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
  );
}
