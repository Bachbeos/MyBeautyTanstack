import Header from "@/components/header/header";
import Sidebar from "@/components/sidebar/sidebar";
import { createFileRoute } from "@tanstack/react-router";
import {
  createColumnHelper,
  getCoreRowModel,
  useReactTable,
  getPaginationRowModel,
  getFilteredRowModel
} from "@tanstack/react-table";
import { useState, useMemo } from "react";
import { DataTable } from "@/components/table/data-table"; // File data-table.tsx bạn đã gửi

// 1. Định nghĩa kiểu dữ liệu Resource
type Resource = {
  id: string;
  name: string;
  code: string;
  description: string;
  status: "Active" | "Inactive";
};

// 2. Tạo Mock Data
const MOCK_DATA: Resource[] = [
  {
    id: "1",
    name: "Máy chủ 01",
    code: "SRV-001",
    description: "Máy chủ sản xuất",
    status: "Active"
  },
  {
    id: "2",
    name: "Cơ sở dữ liệu",
    code: "DB-MAIN",
    description: "Lưu trữ thông tin khách hàng",
    status: "Active"
  },
  {
    id: "3",
    name: "Tên miền crm.vn",
    code: "DOM-01",
    description: "Tên miền chính thức",
    status: "Inactive"
  },
  {
    id: "4",
    name: "SSL Certificate",
    code: "SSL-S1",
    description: "Chứng chỉ bảo mật",
    status: "Active"
  },
  {
    id: "5",
    name: "Máy chủ Backup",
    code: "SRV-BK",
    description: "Sao lưu định kỳ",
    status: "Inactive"
  },
  {
    id: "6",
    name: "API Gateway",
    code: "GW-01",
    description: "Điều phối request",
    status: "Active"
  }
];

const columnHelper = createColumnHelper<Resource>();

export const Route = createFileRoute("/_resource/resource")({
  component: RouteComponent
});

function RouteComponent() {
  const [globalFilter, setGlobalFilter] = useState("");

  // 3. Cấu hình các cột (Giữ nguyên class CSS cũ thông qua cell render)
  const columns = useMemo(
    () => [
      columnHelper.accessor("code", {
        header: "Mã tài nguyên",
        cell: (info) => <span className="fw-medium text-primary">{info.getValue()}</span>
      }),
      columnHelper.accessor("name", {
        header: "Tên tài nguyên"
      }),
      columnHelper.accessor("description", {
        header: "Mô tả"
      }),
      columnHelper.accessor("status", {
        header: "Trạng thái",
        cell: (info) => (
          <span
            className={`badge ${info.getValue() === "Active" ? "bg-success-subtle text-success" : "bg-danger-subtle text-danger"}`}
          >
            {info.getValue()}
          </span>
        )
      }),
      columnHelper.display({
        id: "actions",
        header: "Thao tác",
        cell: (info) => (
          <div className="d-flex gap-2">
            <button
              className="btn btn-sm btn-light border"
              onClick={() => console.log("Edit", info.row.original)}
            >
              <i className="ti ti-edit"></i>
            </button>
            <button
              className="btn btn-sm btn-light border text-danger"
              onClick={() => alert("Xóa " + info.row.original.name)}
            >
              <i className="ti ti-trash"></i>
            </button>
          </div>
        )
      })
    ],
    []
  );

  // 4. Khởi tạo Table instance
  const table = useReactTable({
    data: MOCK_DATA,
    columns,
    state: {
      globalFilter
    },
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(), // Tích hợp phân trang tự động
    initialState: {
      pagination: {
        pageSize: 5
      }
    }
  });

  return (
    <div className="main-wrapper">
      <Header />
      <Sidebar />

      {/* page-wrapper là class quan trọng để layout co giãn khi sidebar đóng/mở */}
      <div className="page-wrapper p-4">
        <div className="container-fluid">
          {/* Header & Breadcrumb */}
          <div className="d-flex justify-content-between align-items-center mb-4">
            <div>
              <h4 className="fw-bold mb-0">
                Danh sách tài nguyên
                <span className="badge bg-primary-subtle text-primary ms-2">
                  {MOCK_DATA.length}
                </span>
              </h4>
            </div>
            <button className="btn btn-primary d-flex align-items-center">
              <i className="ti ti-plus me-1"></i> Thêm tài nguyên
            </button>
          </div>

          <div className="card border-0 shadow-sm">
            <div className="card-body p-3">
              {/* Sử dụng component DataTable mới, tự động ăn CSS Bootstrap */}
              <DataTable
                table={table}
                filterable={true}
                filterKeyPlaceholder="Tìm nhanh tài nguyên..."
                // Logic Search kết nối với GlobalFilter của TanStack
                toolbarLeft={
                  <div className="text-muted small">Dữ liệu được cập nhật từ hệ thống quản trị</div>
                }
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
