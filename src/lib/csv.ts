export type CsvCell = string | number | boolean | null | undefined;

export interface CsvColumn<T> {
  header: string;
  value: (row: T) => CsvCell;
}

function escapeCell(cell: CsvCell): string {
  if (cell === null || cell === undefined) return "";
  let text = typeof cell === "boolean" ? (cell ? "نعم" : "لا") : String(cell);
  // Neutralise spreadsheet formula injection for text cells.
  if (typeof cell === "string" && /^[=+\-@\t\r]/.test(text)) text = `'${text}`;
  if (/[",\r\n]/.test(text)) text = `"${text.replace(/"/g, '""')}"`;
  return text;
}

/** Builds a CSV (with a UTF-8 BOM so Excel reads Arabic correctly). */
export function toCsv<T>(rows: T[], columns: CsvColumn<T>[]): string {
  const lines = [columns.map((c) => escapeCell(c.header)).join(",")];
  for (const row of rows) {
    lines.push(columns.map((c) => escapeCell(c.value(row))).join(","));
  }
  return "\uFEFF" + lines.join("\r\n") + "\r\n";
}
