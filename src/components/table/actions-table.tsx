import { useEffect, useRef } from "react";
import { usePermission } from "@/hooks/use-permission";
import { Tooltip } from "bootstrap";
import { type Row } from "@tanstack/react-table";

interface ActionsTableProps<TData> {
  row: Row<TData>;
  onEdit?: (data: TData) => void;
  onDelete?: (data: TData) => void;
  onView?: (data: TData) => void;
  onPermission?: (data: TData) => void;
  extra?: (data: TData) => React.ReactNode;
  resource?: string; // Optional resource code for auto permission check
}

export default function ActionsTable<TData>({
  row,
  onEdit,
  onDelete,
  onView,
  onPermission,
  extra,
  resource
}: ActionsTableProps<TData>) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const data = row.original;
  
  const { canView, canEdit, canDelete } = usePermission(resource || "");
  const hasResource = !!resource;

  useEffect(() => {
    if (!containerRef.current) return;
    const nodes = containerRef.current.querySelectorAll<HTMLElement>("[data-bs-toggle='tooltip']");
    const tooltips = Array.from(nodes).map((el) => new Tooltip(el));
    return () => tooltips.forEach((t) => t.dispose());
  }, [onEdit, onDelete, onView, onPermission, extra]);

  return (
    <div className="d-flex gap-2" ref={containerRef}>
      {onEdit && (!hasResource || canEdit) && (
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

      {onDelete && (!hasResource || canDelete) && (
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

      {onView && (!hasResource || canView) && (
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
