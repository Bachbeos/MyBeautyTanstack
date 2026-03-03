import Dropdown from "react-bootstrap/Dropdown";
import { type Table } from "@tanstack/react-table";
import "./pagination.scss";

interface DataTablePaginationProps<TData> {
  table: Table<TData>;
  perPageOptions?: number[];
  className?: string;
}

export function Pagination<TData>({
  table,
  perPageOptions = [5, 10, 30, 50],
  className
}: DataTablePaginationProps<TData>) {
  // Lấy trạng thái từ TanStack Table
  const { pagination } = table.getState();
  const total = table.getRowCount(); // Tổng số bản ghi
  const page = pagination.pageIndex + 1; // TanStack dùng 0-based index
  const perPage = pagination.pageSize;
  const totalPages = table.getPageCount();

  const startItem = total === 0 ? 0 : pagination.pageIndex * perPage + 1;
  const endItem = total === 0 ? 0 : Math.min(total, (pagination.pageIndex + 1) * perPage);

  // Logic tạo dải trang (Giữ nguyên từ bản cũ của bạn)
  const displayNumber = 3;
  const pages: (number | "...")[] = [];
  if (totalPages <= displayNumber + 2) {
    for (let i = 1; i <= totalPages; i++) pages.push(i);
  } else {
    pages.push(1);
    const left = Math.max(2, page - 1);
    const right = Math.min(totalPages - 1, page + 1);
    if (left > 2) pages.push("...");
    for (let i = left; i <= right; i++) pages.push(i);
    if (right < totalPages - 1) pages.push("...");
    pages.push(totalPages);
  }

  return (
    <div
      className={`pagination d-flex align-items-center justify-content-between flex-wrap ${className ?? ""}`}
    >
      {/* Hiển thị kết quả - Giữ nguyên class count-item */}
      <div className="count-item">
        Hiển thị kết quả từ {startItem} - {endItem} trên tổng {total}
      </div>

      {/* Chọn số dòng/trang - Giữ nguyên class và cấu trúc Dropdown */}
      <div className="d-flex align-items-center gap-2">
        <span>Hiển thị</span>
        <Dropdown>
          <Dropdown.Toggle
            id="perpage-dropdown"
            size="sm"
            variant="light"
            style={{
              width: 70,
              border: "1px solid #e8e8e8",
              backgroundColor: "#fff",
              color: "#707070"
            }}
          >
            {perPage}
          </Dropdown.Toggle>
          <Dropdown.Menu>
            {perPageOptions.map((opt) => (
              <Dropdown.Item
                as="button"
                key={opt}
                active={opt === perPage}
                onClick={() => table.setPageSize(Number(opt))}
              >
                {opt}
              </Dropdown.Item>
            ))}
          </Dropdown.Menu>
        </Dropdown>
        <span>dòng/trang</span>
      </div>

      {/* Các nút chuyển trang - Giữ nguyên cấu trúc nav và ul cũ */}
      <nav aria-label="Pagination">
        <ul
          className="dataTables_paginate pagination pagination-sm mb-0"
          id="pipeline-list_paginate"
        >
          <li
            className={`paginate_button page-item ${!table.getCanPreviousPage() ? "disabled" : ""}`}
          >
            <button
              className="page-link"
              onClick={() => table.previousPage()}
              aria-label="Previous"
              type="button"
            >
              &lt;
            </button>
          </li>

          {pages.map((p, i) =>
            p === "..." ? (
              <li key={`ellipsis-${i}`} className="paginate_button page-item disabled">
                <span className="page-link">…</span>
              </li>
            ) : (
              <li key={p} className={`page-item ${p === page ? "active" : ""}`}>
                <button
                  type="button"
                  onClick={() => table.setPageIndex(Number(p) - 1)}
                  className={`page-link${p === page ? " btn btn-primary text-white" : ""}`}
                  aria-current={p === page ? "page" : undefined}
                >
                  {p}
                </button>
              </li>
            )
          )}

          <li className={`page-item cursor-pointer ${!table.getCanNextPage() ? "disabled" : ""}`}>
            <button
              className="page-link next"
              onClick={() => table.nextPage()}
              aria-label="Next"
              type="button"
            >
              &gt;
            </button>
          </li>
        </ul>
      </nav>
    </div>
  );
}
