import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { formatCurrency } from './utils';

// ─── resolve deeply nested key like "categories.name" ───
function resolveKey(row: any, key: string): any {
  if (!key.includes('.')) return row[key];
  return key.split('.').reduce((obj, k) => (obj ? obj[k] : undefined), row);
}

// ─── Excel export ─────────────────────────────────────────────────────────────
export function exportToExcel(
  data: any[],
  columns: { header: string; key: string; isCurrency?: boolean }[],
  filename: string
) {
  const worksheetData = data.map(row => {
    const out: any = {};
    columns.forEach(col => {
      const val = resolveKey(row, col.key);
      out[col.header] = col.isCurrency && typeof val === 'number' ? formatCurrency(val) : val ?? '-';
    });
    return out;
  });

  const worksheet = XLSX.utils.json_to_sheet(worksheetData);
  const workbook  = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Data');
  XLSX.writeFile(workbook, `${filename}.xlsx`);
}

// ─── PDF export (landscape A4, clean table layout) ───────────────────────────
export function exportToPDF(
  data: any[],
  columns: { header: string; key: string; isCurrency?: boolean }[],
  title: string,
  filename: string
) {
  const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });

  const pageW  = doc.internal.pageSize.getWidth();
  const accent: [number, number, number] = [92, 103, 242];   // #5C67F2
  const dark:   [number, number, number] = [21, 29, 72];     // #151D48

  // ── header band ──────────────────────────────────────────────────────────
  doc.setFillColor(...accent);
  doc.rect(0, 0, pageW, 18, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.setTextColor(255, 255, 255);
  doc.text(title, 12, 12);

  const now = new Date().toLocaleDateString('id-ID', {
    year: 'numeric', month: 'long', day: 'numeric'
  });
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(220, 220, 255);
  doc.text(`Dicetak: ${now}`, pageW - 12, 12, { align: 'right' });

  // ── table ─────────────────────────────────────────────────────────────────
  const headers  = columns.map(c => c.header);
  const currencyIdx = new Set(columns.map((c, i) => (c.isCurrency ? i : -1)).filter(i => i >= 0));

  const rows = data.map(row =>
    columns.map(col => {
      const val = resolveKey(row, col.key);
      if (col.isCurrency && typeof val === 'number') return formatCurrency(val);
      if (val instanceof Date) return val.toLocaleDateString('id-ID');
      return val ?? '-';
    })
  );

  autoTable(doc, {
    head:    [headers],
    body:    rows,
    startY:  24,
    margin:  { left: 12, right: 12 },
    theme:   'plain',
    styles: {
      font:      'helvetica',
      fontSize:  8,
      cellPadding: { top: 3, right: 4, bottom: 3, left: 4 },
      textColor: dark,
      lineColor: [220, 220, 230],
      lineWidth: 0.2,
      overflow:  'linebreak',
    },
    headStyles: {
      fillColor:  accent,
      textColor:  [255, 255, 255],
      fontStyle:  'bold',
      fontSize:   8.5,
      lineWidth:  0,
    },
    alternateRowStyles: { fillColor: [248, 250, 255] },
    columnStyles: Object.fromEntries(
      [...currencyIdx].map(i => [i, { halign: 'right', fontStyle: 'bold' }])
    ),
    didDrawPage: (_data: any) => {
      // page number footer
      const pageCount = (doc.internal as any).getNumberOfPages();
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7);
      doc.setTextColor(160, 160, 180);
      doc.text(
        `Halaman ${(doc.internal as any).getCurrentPageInfo().pageNumber} dari ${pageCount}`,
        pageW / 2, doc.internal.pageSize.getHeight() - 4,
        { align: 'center' }
      );
    },
  });

  doc.save(`${filename}.pdf`);
}
