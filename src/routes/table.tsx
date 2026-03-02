import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/table")({
  component: RouteComponent
});

function RouteComponent() {
  return <AdminOrders />;
}
import { useMemo, useState } from "react";
import {
  getCoreRowModel,
  useReactTable,
  type SortingState,
  type PaginationState,
  type ColumnFiltersState
} from "@tanstack/react-table";

import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/table/data-table";
import { Select, SelectItem, SelectTrigger } from "@/components/ui/select";

type OrderStatus = "NEW" | "CONFIRMED" | "SHIPPING" | "COMPLETED" | "CANCELLED" | "REFUNDED";

interface Order {
  id: number;
  customerName: string;
  totalAmount: number;
  status: OrderStatus;
  createdAt: string;
}

function AdminOrders() {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10
  });

  const [statusFilter, setStatusFilter] = useState<OrderStatus | "ALL">("ALL");

  const mockOrders: Order[] = useMemo(
    () =>
      Array.from({ length: 57 }).map((_, i) => ({
        id: i + 1,
        customerName: `Customer ${i + 1}`,
        totalAmount: Math.floor(Math.random() * 5_000_000),
        status: ["NEW", "CONFIRMED", "SHIPPING", "COMPLETED", "CANCELLED", "REFUNDED"][
          i % 6
        ] as OrderStatus,
        createdAt: new Date().toISOString()
      })),
    []
  );

  const filteredOrders = useMemo(() => {
    if (statusFilter === "ALL") return mockOrders;
    return mockOrders.filter((o) => o.status === statusFilter);
  }, [mockOrders, statusFilter]);

  const paginatedOrders = useMemo(() => {
    const start = pagination.pageIndex * pagination.pageSize;
    const end = start + pagination.pageSize;
    return filteredOrders.slice(start, end);
  }, [filteredOrders, pagination]);

  const columns = useMemo(
    () => [
      {
        accessorKey: "id",
        header: "ID"
      },
      {
        accessorKey: "customerName",
        header: "Khách hàng"
      },
      {
        accessorKey: "totalAmount",
        header: "Tổng tiền",
        cell: ({ row }) =>
          new Intl.NumberFormat("vi-VN", {
            style: "currency",
            currency: "VND"
          }).format(row.original.totalAmount)
      },
      {
        accessorKey: "status",
        header: "Trạng thái"
      },
      {
        accessorKey: "createdAt",
        header: "Ngày tạo",
        cell: ({ row }) => new Date(row.original.createdAt).toLocaleDateString("vi-VN")
      }
    ],
    []
  );

  const table = useReactTable({
    data: paginatedOrders,
    columns,
    manualPagination: true,
    pageCount: Math.ceil(filteredOrders.length / pagination.pageSize),
    state: { pagination, sorting, columnFilters },
    onPaginationChange: setPagination,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel()
  });

  return (
    <div className="container mx-auto space-y-4 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Quản lý đơn hàng (Mock)</h1>
          <p className="text-muted-foreground text-sm">Demo dữ liệu giả không cần backend.</p>
        </div>
      </div>

      {/* <DataTable table={table} filterable={false} /> */}

      <Select
        value={statusFilter}
        onValueChange={(value) => setStatusFilter(value as OrderStatus | "ALL")}
      >
        <SelectTrigger className="w-auto">
          <SelectItem value="ALL">Tất cả trạng thái</SelectItem>
          <SelectItem value="NEW">Mới</SelectItem>
          <SelectItem value="CONFIRMED">Đã xác nhận</SelectItem>
          <SelectItem value="SHIPPING">Đang giao</SelectItem>
          <SelectItem value="COMPLETED">Hoàn thành</SelectItem>
          <SelectItem value="CANCELLED">Đã hủy</SelectItem>
          <SelectItem value="REFUNDED">Hoàn tiền</SelectItem>
        </SelectTrigger>
      </Select>
    </div>
  );
}
