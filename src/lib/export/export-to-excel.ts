import * as XLSX from "xlsx";
import type { Table } from "@tanstack/react-table";

export function exportVisibleTableToXLSX<T>(table: Table<T>) {
  const columns = table.getVisibleLeafColumns().filter((col) => col.id !== "actions");

  const rows = table.getRowModel().rows;

  const headers = columns.map((col) => {
    const header = col.columnDef.header;
    return typeof header === "string" ? header : String(col.id);
  });

  const data = rows.map((row) =>
    columns.map((col) => {
      const value = row.getValue(col.id);

      if (value === null || value === undefined) return "";

      if (typeof value === "string") return value;
      if (typeof value === "number") return value;
      if (typeof value === "boolean") return value ? "Yes" : "No";

      if (value instanceof Date) return value.toLocaleDateString();

      if (typeof value === "object") return JSON.stringify(value);

      return String(value);
    })
  );

  const sheetData = [headers, ...data];

  const worksheet = XLSX.utils.aoa_to_sheet(sheetData);

  const colWidths = headers.map((header, i) => {
    const maxCellLength = Math.max(header.length, ...data.map((row) => String(row[i]).length));

    return { wch: Math.min(maxCellLength + 4, 40) };
  });

  worksheet["!cols"] = colWidths;

  worksheet["!autofilter"] = {
    ref: XLSX.utils.encode_range({
      s: { r: 0, c: 0 },
      e: { r: data.length, c: headers.length - 1 }
    })
  };

  worksheet["!freeze"] = { xSplit: 0, ySplit: 1 };

  const workbook = XLSX.utils.book_new();

  XLSX.utils.book_append_sheet(workbook, worksheet, "Export");

  XLSX.writeFile(workbook, "table-export.xlsx");
}
