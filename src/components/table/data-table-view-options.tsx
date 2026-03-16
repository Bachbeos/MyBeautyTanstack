import type { Table } from "@tanstack/react-table";
import { useId, useState, useRef, useEffect } from "react";

type Props<TData> = {
  table: Table<TData>;
};

export function DataTableViewOptions<TData>({ table }: Props<TData>) {
  const dropdownId = useId();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const columns = table
    .getAllColumns()
    .filter((column) => typeof column.accessorFn !== "undefined" && column.getCanHide());

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="dropdown" ref={ref}>
      <button
        className="btn btn-outline-secondary btn-sm dropdown-toggle"
        type="button"
        id={dropdownId}
        onClick={() => setOpen((v) => !v)}
      >
        <i className="ti ti-settings me-1"></i>
        View
      </button>

      <ul
        className={`dropdown-menu dropdown-menu-end ${open ? "show" : ""}`}
        aria-labelledby={dropdownId}
      >
        <li className="dropdown-header">Toggle columns</li>

        {columns.map((column) => (
          <li key={column.id}>
            <label className="dropdown-item d-flex align-items-center gap-2">
              <input
                type="checkbox"
                className="form-check-input"
                checked={column.getIsVisible()}
                onChange={(e) => column.toggleVisibility(e.target.checked)}
              />
              {typeof column.columnDef.header === "string" ? column.columnDef.header : column.id}
            </label>
          </li>
        ))}
      </ul>
    </div>
  );
}
