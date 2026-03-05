import { useEffect, useRef } from "react";
import { Tooltip } from "bootstrap";
import { type Row } from "@tanstack/react-table";

interface ActionsTableProps<TData> {
  row: Row<TData>;
  onEdit?: (data: TData) => void;
  onDelete?: (data: TData) => void;
  onView?: (data: TData) => void;
  onPermission?: (data: TData) => void;
  extra?: (data: TData) => React.ReactNode;
}

export default function ActionsTable<TData>({
  row,
  onEdit,
  onDelete,
  onView,
  onPermission,
  extra
}: ActionsTableProps<TData>) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const data = row.original;

  useEffect(() => {
    if (!containerRef.current) return;
    const nodes = containerRef.current.querySelectorAll<HTMLElement>("[data-bs-toggle='tooltip']");
    const tooltips = Array.from(nodes).map((el) => new Tooltip(el));
    return () => tooltips.forEach((t) => t.dispose());
  }, [onEdit, onDelete, onView, onPermission, extra]);

  return (
    <div className="d-flex gap-2" ref={containerRef}>
      {onEdit && (
        <button
          className="btn btn-sm btn-light"
          onClick={() => onEdit(data)}
          data-bs-toggle="tooltip"
          data-bs-placement="top"
          title="Chỉnh sửa"
        >
          <i className="ti ti-edit"></i>
        </button>
      )}

      {onDelete && (
        <button
          className="btn btn-sm btn-danger"
          onClick={() => onDelete(data)}
          data-bs-toggle="tooltip"
          data-bs-placement="top"
          title="Xóa"
        >
          <i className="ti ti-trash"></i>
        </button>
      )}

      {onView && (
        <button
          className="btn btn-sm btn-info"
          onClick={() => onView(data)}
          data-bs-toggle="tooltip"
          data-bs-placement="top"
          title="Xem chi tiết"
        >
          <i className="ti ti-eye"></i>
        </button>
      )}

      {onPermission && (
        <button
          className="btn btn-sm btn-warning"
          onClick={() => onPermission(data)}
          data-bs-toggle="tooltip"
          data-bs-placement="top"
          title="Phân quyền"
        >
          <i className="ti ti-shield"></i>
        </button>
      )}

      {extra && extra(data)}
    </div>
  );
}
