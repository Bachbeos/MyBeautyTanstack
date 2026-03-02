import { flexRender, type Table as TanStackTable } from "@tanstack/react-table";
// import { DataTablePagination } from "@/components/table/pagination";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";

interface DataTableProps<TData> {
  table: TanStackTable<TData>;
  filterable?: boolean;
  filterKey?: string;
  filterKeyPlaceholder?: string;
  toolbarLeft?: React.ReactNode;
  toolbarRight?: React.ReactNode;
}

export function DataTable<TData>({
  table,
  filterable = true,
  filterKey = "name",
  filterKeyPlaceholder,
  toolbarLeft,
  toolbarRight
}: DataTableProps<TData>) {
  return (
    <div className="d-flex flex-column h-100 gap-4">
      {/* Toolbar */}
      <div className="d-flex flex-column flex-sm-row justify-content-between align-items-sm-center gap-3">
        <div className="d-flex align-items-center gap-3 flex-fill">
          {filterable && (
            <div className="position-relative w-100" style={{ maxWidth: 320 }}>
              <input
                type="text"
                className="form-control rounded-pill ps-4"
                placeholder={filterKeyPlaceholder || "Tìm kiếm..."}
                value={(table.getColumn(filterKey)?.getFilterValue() as string) ?? ""}
                onChange={(e) => table.getColumn(filterKey)?.setFilterValue(e.target.value)}
              />
            </div>
          )}

          {toolbarLeft}
        </div>

        <div className="d-flex align-items-center gap-2">{toolbarRight}</div>
      </div>

      {/* Table */}
      <div className="flex-fill">
        <div className="card border-0">
          <div className="card-body p-0">
            <Table className="table-hover mb-0">
              <TableHeader className="table-light">
                {table.getHeaderGroups().map((hg) => (
                  <TableRow key={hg.id}>
                    {hg.headers.map((header) => (
                      <TableHead key={header.id} className="text-uppercase small fw-bold">
                        {!header.isPlaceholder &&
                          flexRender(header.column.columnDef.header, header.getContext())}
                      </TableHead>
                    ))}
                  </TableRow>
                ))}
              </TableHeader>

              <TableBody>
                {table.getRowModel().rows.length ? (
                  table.getRowModel().rows.map((row) => (
                    <TableRow key={row.id} className={row.getIsSelected() ? "table-active" : ""}>
                      {row.getVisibleCells().map((cell) => (
                        <TableCell key={cell.id}>
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={table.getAllColumns().length} className="text-center py-5">
                      <span className="text-muted">Không tìm thấy dữ liệu phù hợp.</span>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>

      {/* Pagination */}
      {/* <div className="border-top pt-3">
        <DataTablePagination table={table} />
      </div> */}
    </div>
  );
}
