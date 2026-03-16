import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import type { Table } from "@tanstack/react-table";

import fontUrl from "@assets/fonts/NotoSans-Regular.ttf";

function arrayBufferToBase64(buffer: ArrayBuffer) {
  let binary = "";
  const bytes = new Uint8Array(buffer);
  const chunkSize = 0x8000;

  for (let i = 0; i < bytes.length; i += chunkSize) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunkSize));
  }

  return btoa(binary);
}

async function loadFont(url: string) {
  const res = await fetch(url);
  const buffer = await res.arrayBuffer();
  return arrayBufferToBase64(buffer);
}

export async function exportVisibleTableToPDF<T>(table: Table<T>) {
  const columns = table.getVisibleLeafColumns().filter((col) => col.id !== "actions");

  const rows = table.getRowModel().rows;

  const headers = columns.map((col) => {
    const header = col.columnDef.header;

    if (typeof header === "string") return header;

    return String(col.id);
  });

  const data = rows.map((row) =>
    columns.map((col) => {
      const value = row.getValue(col.id);

      if (value === null || value === undefined) return "";

      if (typeof value === "string") return value;

      if (typeof value === "number" || typeof value === "boolean") return String(value);

      if (typeof value === "object") return JSON.stringify(value);

      return String(value);
    })
  );

  const fontBase64 = await loadFont(fontUrl);

  const doc = new jsPDF({
    orientation: "landscape"
  });

  doc.addFileToVFS("NotoSans.ttf", fontBase64);
  doc.addFont("NotoSans.ttf", "NotoSans", "normal");
  doc.setFont("NotoSans", "normal");

  autoTable(doc, {
    head: [headers],
    body: data,
    styles: {
      font: "NotoSans",
      fontStyle: "normal",
      fontSize: 10
    },
    headStyles: {
      font: "NotoSans",
      fontStyle: "normal"
    }
  });

  doc.save("table-export.pdf");
}
