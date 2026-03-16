import { useRef, useEffect, useState } from "react";

type Props = {
  onExport?: (format: "pdf" | "xls") => void;
  className?: string;
};

export default function ExportButton({ onExport, className }: Props) {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

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
          <i className="ti ti-package-export me-2"></i>
          Export
        </button>

        <div
          className={`dropdown-menu dropdown-menu-end${open ? " show" : ""}`}
          style={{ right: 0, left: "auto" }}
        >
          <ul className="list-unstyled mb-0">
            <li>
              <button
                type="button"
                className="dropdown-item"
                onClick={() => {
                  setOpen(false);
                  onExport?.("pdf");
                }}
              >
                <i className="ti ti-file-type-pdf me-1"></i>
                Export as PDF
              </button>
            </li>

            <li>
              <button
                type="button"
                className="dropdown-item"
                onClick={() => {
                  setOpen(false);
                  onExport?.("xls");
                }}
              >
                <i className="ti ti-file-type-xls me-1"></i>
                Export as Excel
              </button>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
