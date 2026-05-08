import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

// ─── Helpers ─────────────────────────────────────────────────────────────────

function resolveKey(row: any, key: string): any {
  if (!key.includes('.')) return row[key];
  return key.split('.').reduce((obj, k) => (obj ? obj[k] : undefined), row);
}

/** Accounting-style number: 1.234.567,00 */
function fmtAccounting(val: number): string {
  return new Intl.NumberFormat('id-ID', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(val);
}

/** Format a date string to dd/MM/yyyy */
function fmtDate(val: any): string {
  if (!val) return '-';
  const d = new Date(val);
  if (isNaN(d.getTime())) return String(val);
  return d.toLocaleDateString('id-ID', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

// ─── Column definition ──────────────────────────────────────────────────────

export interface ExportColumn {
  header: string;
  key: string;
  isCurrency?: boolean;
  isDate?: boolean;
  width?: number;        // Excel col width in characters
}

// ═══════════════════════════════════════════════════════════════════════════════
//  EXCEL EXPORT — accounting-grade worksheet
// ═══════════════════════════════════════════════════════════════════════════════

export function exportToExcel(
  data: any[],
  columns: ExportColumn[],
  filename: string,
) {
  // ── build header row ──────────────────────────────────────────────────────
  const headerRow = ['No.', ...columns.map(c => c.header)];

  // ── build data rows ───────────────────────────────────────────────────────
  const bodyRows = data.map((row, idx) => {
    const cells: any[] = [idx + 1]; // row number
    columns.forEach(col => {
      let val = resolveKey(row, col.key);
      if (col.isCurrency && typeof val === 'number') {
        cells.push(val);                       // keep as number for Excel
      } else if (col.isDate || col.key === 'date' || col.key.includes('_date')) {
        cells.push(fmtDate(val));
      } else {
        cells.push(val ?? '-');
      }
    });
    return cells;
  });

  // ── totals row for currency columns ───────────────────────────────────────
  const totalsRow: any[] = [''];
  columns.forEach((col, i) => {
    if (col.isCurrency) {
      const sum = data.reduce((acc, row) => {
        const v = resolveKey(row, col.key);
        return acc + (typeof v === 'number' ? v : 0);
      }, 0);
      totalsRow.push(sum);
    } else if (i === 0) {
      totalsRow.push('TOTAL');
    } else {
      totalsRow.push('');
    }
  });

  const allRows = [headerRow, ...bodyRows, totalsRow];

  // ── create worksheet ──────────────────────────────────────────────────────
  const ws = XLSX.utils.aoa_to_sheet(allRows);

  // column widths
  const colWidths: XLSX.ColInfo[] = [
    { wch: 5 }, // No.
    ...columns.map(col => ({ wch: col.width ?? (col.isCurrency ? 20 : 18) })),
  ];
  ws['!cols'] = colWidths;

  // Number format for currency columns (accounting style with 2 decimals)
  const range = XLSX.utils.decode_range(ws['!ref'] || 'A1');
  for (let R = 1; R <= range.e.r; R++) {
    columns.forEach((col, ci) => {
      if (col.isCurrency) {
        const cellAddr = XLSX.utils.encode_cell({ r: R, c: ci + 1 });
        const cell = ws[cellAddr];
        if (cell && typeof cell.v === 'number') {
          cell.z = '#,##0.00';   // Excel number format
        }
      }
    });
  }

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Laporan');
  XLSX.writeFile(wb, `${filename}.xlsx`);
}


// ═══════════════════════════════════════════════════════════════════════════════
//  PDF EXPORT — accounting-standard report
// ═══════════════════════════════════════════════════════════════════════════════

export function exportToPDF(
  data: any[],
  columns: ExportColumn[],
  title: string,
  filename: string,
) {
  const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();

  const primary:  [number, number, number] = [92, 103, 242];
  const darkText: [number, number, number] = [30, 30, 50];
  const gray:     [number, number, number] = [120, 120, 140];

  // ── Company header ────────────────────────────────────────────────────────
  doc.setFillColor(...primary);
  doc.rect(0, 0, pageW, 2, 'F'); // thin accent line at top

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(...darkText);
  doc.text(title.toUpperCase(), 14, 14);

  const now = new Date();
  const printDate = now.toLocaleDateString('id-ID', {
    day: '2-digit', month: 'long', year: 'numeric',
  });
  const printTime = now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(...gray);
  doc.text(`Dicetak: ${printDate}, ${printTime}`, 14, 19);

  // right side — period info
  doc.setFontSize(8);
  doc.text(`Jumlah data: ${data.length} baris`, pageW - 14, 14, { align: 'right' });

  // divider
  doc.setDrawColor(220, 220, 230);
  doc.setLineWidth(0.3);
  doc.line(14, 22, pageW - 14, 22);

  // ── Table headers ─────────────────────────────────────────────────────────
  const headers = ['No.', ...columns.map(c => c.header)];

  // ── Identify column types ─────────────────────────────────────────────────
  const currencyColIndices = new Set<number>();
  columns.forEach((c, i) => { if (c.isCurrency) currencyColIndices.add(i + 1); }); // +1 for No. col

  // ── Table body ────────────────────────────────────────────────────────────
  const body = data.map((row, idx) => {
    const cells: string[] = [String(idx + 1)];
    columns.forEach(col => {
      const val = resolveKey(row, col.key);
      if (col.isCurrency && typeof val === 'number') {
        cells.push(fmtAccounting(val));
      } else if (col.isDate || col.key === 'date' || col.key.includes('_date')) {
        cells.push(fmtDate(val));
      } else {
        cells.push(String(val ?? '-'));
      }
    });
    return cells;
  });

  // ── Totals row ────────────────────────────────────────────────────────────
  const totalsRow: string[] = [''];
  columns.forEach((col, i) => {
    if (col.isCurrency) {
      const sum = data.reduce((acc, row) => {
        const v = resolveKey(row, col.key);
        return acc + (typeof v === 'number' ? v : 0);
      }, 0);
      totalsRow.push(fmtAccounting(sum));
    } else if (i === 0) {
      totalsRow.push('TOTAL');
    } else {
      totalsRow.push('');
    }
  });

  // ── Column styles ─────────────────────────────────────────────────────────
  const colStyles: Record<number, any> = {
    0: { halign: 'center', cellWidth: 10 },  // No.
  };
  currencyColIndices.forEach(i => {
    colStyles[i] = { halign: 'right', fontStyle: 'normal' };
  });

  // ── Render table ──────────────────────────────────────────────────────────
  autoTable(doc, {
    head: [headers],
    body: [...body, totalsRow],
    startY: 25,
    margin: { left: 14, right: 14 },
    theme: 'plain',
    styles: {
      font: 'helvetica',
      fontSize: 7.5,
      cellPadding: { top: 2.5, right: 3, bottom: 2.5, left: 3 },
      textColor: darkText,
      lineColor: [200, 200, 210],
      lineWidth: 0.15,
      valign: 'middle',
    },
    headStyles: {
      fillColor: [245, 246, 255],
      textColor: primary,
      fontStyle: 'bold',
      fontSize: 7.5,
      lineWidth: 0.3,
      lineColor: primary,
    },
    bodyStyles: {
      lineWidth: 0.15,
      lineColor: [230, 230, 240],
    },
    alternateRowStyles: { fillColor: [250, 251, 255] },
    columnStyles: colStyles,
    // Style the totals row (last row)
    didParseCell: (hookData: any) => {
      if (hookData.section === 'body' && hookData.row.index === body.length) {
        // This is the totals row
        hookData.cell.styles.fontStyle = 'bold';
        hookData.cell.styles.fillColor = [235, 237, 255];
        hookData.cell.styles.lineWidth = 0.4;
        hookData.cell.styles.lineColor = primary;
        hookData.cell.styles.fontSize = 8;
      }
    },
    didDrawPage: () => {
      // Page footer
      const totalPages = (doc.internal as any).getNumberOfPages();
      const currentPage = (doc.internal as any).getCurrentPageInfo().pageNumber;
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7);
      doc.setTextColor(...gray);
      doc.text(
        `Halaman ${currentPage} dari ${totalPages}`,
        pageW / 2, pageH - 6,
        { align: 'center' }
      );
      // Re-draw accent line on subsequent pages
      doc.setFillColor(...primary);
      doc.rect(0, 0, pageW, 2, 'F');
    },
  });

  doc.save(`${filename}.pdf`);
}
