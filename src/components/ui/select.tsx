import * as React from "react";

interface SelectContextValue {
  value: string;
  onChange: (value: string) => void;
}

const SelectContext = React.createContext<SelectContextValue | null>(null);

interface SelectProps {
  value: string;
  onValueChange: (value: string) => void;
  children: React.ReactNode;
}

export function Select({ value, onValueChange, children }: SelectProps) {
  return (
    <SelectContext.Provider value={{ value, onChange: onValueChange }}>
      {children}
    </SelectContext.Provider>
  );
}

export function SelectTrigger({
  className = "",
  children
}: {
  className?: string;
  children: React.ReactNode;
}) {
  const ctx = React.useContext(SelectContext);
  if (!ctx) return null;

  return (
    <select
      className={`form-select ${className}`}
      value={ctx.value}
      onChange={(e) => ctx.onChange(e.target.value)}
    >
      {children}
    </select>
  );
}

export function SelectItem({ value, children }: { value: string; children: React.ReactNode }) {
  return <option value={value}>{children}</option>;
}
