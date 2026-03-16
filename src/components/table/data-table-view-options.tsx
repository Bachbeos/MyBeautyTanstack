import type { Table } from "@tanstack/react-table";
import { useId, useState, useRef, useEffect } from "react";

type Props<TData> = {
  table: Table<TData>;
  className?: string;
};

export function DataTableViewOptions<TData>({ table, className }: Props<TData>) {
  const dropdownId = useId();
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const columns = table
    .getAllColumns()
    .filter((column) => typeof column.accessorFn !== "undefined" && column.getCanHide());

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }

    if (open) document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  return (
    <div className={className}>
      <div className="dropdown" ref={dropdownRef}>
        <button
          className={`dropdown-toggle btn btn-outline-light px-2 shadow${open ? " active" : ""}`}
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
        >
          <i className="ti ti-settings me-2"></i>
          Quản lý cột
        </button>

        <div
          className={`dropdown-menu dropdown-menu-end${open ? " show" : ""}`}
          style={{ right: 0, left: "auto", minWidth: "200px" }}
        >
          <div className="dropdown-header border-bottom mb-2 pb-2 fw-bold text-dark">
            Hiển thị cột
          </div>

          <ul className="list-unstyled mb-0">
            {columns.map((column) => (
              <li key={column.id}>
                <label
                  className="dropdown-item d-flex align-items-center gap-2 py-2 cursor-pointer"
                  style={{ userSelect: "none" }}
                >
                  <input
                    type="checkbox"
                    className="form-check-input mt-0"
                    checked={column.getIsVisible()}
                    onChange={(e) => column.toggleVisibility(e.target.checked)}
                  />
                  <span className="fs-14">
                    {typeof column.columnDef.header === "string"
                      ? column.columnDef.header
                      : column.id}
                  </span>
                </label>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
