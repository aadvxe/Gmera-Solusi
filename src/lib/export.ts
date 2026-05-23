// @ts-ignore
import * as XLSX from 'xlsx-js-style';
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
  if (!val) return '';
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
  isAccountingLayout: boolean = false
) {
  // ── build header row ──────────────────────────────────────────────────────
  const headerRow = isAccountingLayout ? columns.map(c => c.header) : ['No.', ...columns.map(c => c.header)];

  // ── build data rows ───────────────────────────────────────────────────────
  const bodyRows = data.map((row, idx) => {
    const cells: any[] = isAccountingLayout ? [] : [idx + 1]; // row number only for standard layout
    columns.forEach(col => {
      let val = resolveKey(row, col.key);
      
      // Strip accounting layout prefix markers
      if (typeof val === 'string') {
        if (val.startsWith('HDR: ')) val = val.replace('HDR: ', '');
        else if (val.startsWith('SUB: ')) val = val.replace('SUB: ', '');
        else if (val.startsWith('FTR: ')) val = val.replace('FTR: ', '');
      }

      if (col.isCurrency && typeof val === 'number') {
        cells.push(val);                       // keep as number for Excel
      } else if (col.isDate || col.key === 'date' || col.key.includes('_date')) {
        cells.push(fmtDate(val));
      } else {
        let strVal = val ?? '';
        if (typeof strVal === 'string') {
          if (strVal === 'paid') strVal = 'Paid';
          else if (strVal === 'pending') strVal = 'Pending';
          else if (strVal === 'lunas') strVal = 'Lunas';
          else if (strVal === 'belum bayar') strVal = 'Belum Bayar';
        }
        cells.push(strVal);
      }
    });
    return cells;
  });

  // ── totals row for currency columns ───────────────────────────────────────
  const totalsRow: any[] = isAccountingLayout ? [] : [''];
  if (!isAccountingLayout) {
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
  }

  const allRows = isAccountingLayout 
    ? [headerRow, ...bodyRows] 
    : [headerRow, ...bodyRows, totalsRow];

  // ── create worksheet ──────────────────────────────────────────────────────
  const ws = XLSX.utils.aoa_to_sheet(allRows);

  // column widths
  const colWidths: XLSX.ColInfo[] = isAccountingLayout
    ? columns.map(col => ({ wch: col.width ?? (col.isCurrency ? 20 : 18) }))
    : [
        { wch: 5 }, // No.
        ...columns.map(col => ({ wch: col.width ?? (col.isCurrency ? 20 : 18) })),
      ];
  ws['!cols'] = colWidths;

  // Track special row indices in accounting layout
  const hdrRows = new Set<number>();
  const subRows = new Set<number>();
  const ftrRows = new Set<number>();
  if (isAccountingLayout) {
    data.forEach((row, idx) => {
      const val = resolveKey(row, columns[0].key);
      if (typeof val === 'string') {
        if (val.startsWith('HDR: ')) hdrRows.add(idx + 1);
        else if (val.startsWith('SUB: ')) subRows.add(idx + 1);
        else if (val.startsWith('FTR: ')) ftrRows.add(idx + 1);
      }
    });
  }

  // Number format for currency columns and styling every cell
  const range = XLSX.utils.decode_range(ws['!ref'] || 'A1');
  const currencyColOffset = isAccountingLayout ? 0 : 1;

  for (let R = 0; R <= range.e.r; R++) {
    for (let C = 0; C <= range.e.c; C++) {
      const cellAddr = XLSX.utils.encode_cell({ r: R, c: C });
      const cell = ws[cellAddr];
      if (!cell) continue;

      // Define default premium cell style
      const cellStyle: any = {
        font: { name: 'Arial', sz: 9.5, bold: false, color: { rgb: '1E1E32' } },
        fill: { patternType: 'solid', fgColor: { rgb: 'FFFFFF' } },
        alignment: { vertical: 'center', horizontal: 'left' },
        border: {
          top: { style: 'thin', color: { rgb: 'E6E6F0' } },
          bottom: { style: 'thin', color: { rgb: 'E6E6F0' } },
          left: { style: 'thin', color: { rgb: 'E6E6F0' } },
          right: { style: 'thin', color: { rgb: 'E6E6F0' } }
        }
      };

      // Check alignment
      const isFirstCol = C === 0;
      const colIndex = isAccountingLayout ? C : C - 1;
      const col = columns[colIndex];
      const isCurrencyCol = col?.isCurrency;

      if (!isAccountingLayout && isFirstCol) {
        cellStyle.alignment.horizontal = 'center';
      } else if (isCurrencyCol) {
        cellStyle.alignment.horizontal = 'right';
      }

      // Apply styling based on row classifications
      if (R === 0) {
        // Table Header row (Vibrant Royal Blue)
        cellStyle.fill.fgColor = { rgb: '2563EB' };
        cellStyle.font.color = { rgb: 'FFFFFF' };
        cellStyle.font.bold = true;
        cellStyle.font.sz = 10;
        cellStyle.alignment.horizontal = 'center';
        cellStyle.border = {
          top: { style: 'thin', color: { rgb: '1E40AF' } },
          bottom: { style: 'thin', color: { rgb: '1E40AF' } },
          left: { style: 'thin', color: { rgb: '1E40AF' } },
          right: { style: 'thin', color: { rgb: '1E40AF' } }
        };
      } else if (isAccountingLayout && hdrRows.has(R)) {
        // Laba Rugi HDR Row
        cellStyle.fill.fgColor = { rgb: '2563EB' };
        cellStyle.font.color = { rgb: 'FFFFFF' };
        cellStyle.font.bold = true;
        cellStyle.font.sz = 10;
        cellStyle.border = {
          top: { style: 'thin', color: { rgb: '1E40AF' } },
          bottom: { style: 'thin', color: { rgb: '1E40AF' } },
          left: { style: 'thin', color: { rgb: '1E40AF' } },
          right: { style: 'thin', color: { rgb: '1E40AF' } }
        };
      } else if (isAccountingLayout && subRows.has(R)) {
        // Laba Rugi SUB Row (Light Blue subtotal)
        cellStyle.fill.fgColor = { rgb: 'EFF6FF' };
        cellStyle.font.bold = true;
        cellStyle.border = {
          top: { style: 'thin', color: { rgb: 'C8C8D2' } },
          bottom: { style: 'thin', color: { rgb: 'C8C8D2' } },
          left: { style: 'thin', color: { rgb: 'C8C8D2' } },
          right: { style: 'thin', color: { rgb: 'C8C8D2' } }
        };
      } else if (isAccountingLayout && ftrRows.has(R)) {
        // Laba Rugi FTR Row (LABA/RUGI BERSIH)
        cellStyle.fill.fgColor = { rgb: '2563EB' };
        cellStyle.font.color = { rgb: 'FFFFFF' };
        cellStyle.font.bold = true;
        cellStyle.font.sz = 10;
        cellStyle.border = {
          top: { style: 'thin', color: { rgb: '1E40AF' } },
          bottom: { style: 'thin', color: { rgb: '1E40AF' } },
          left: { style: 'thin', color: { rgb: '1E40AF' } },
          right: { style: 'thin', color: { rgb: '1E40AF' } }
        };
      } else if (!isAccountingLayout && R === range.e.r) {
        // Standard TOTAL Row
        cellStyle.fill.fgColor = { rgb: 'EFF6FF' };
        cellStyle.font.bold = true;
        cellStyle.border = {
          top: { style: 'thin', color: { rgb: 'C8C8D2' } },
          bottom: { style: 'thin', color: { rgb: 'C8C8D2' } },
          left: { style: 'thin', color: { rgb: 'C8C8D2' } },
          right: { style: 'thin', color: { rgb: 'C8C8D2' } }
        };
      } else {
        // Alternate Row zebra coloring
        if (R % 2 === 0) {
          cellStyle.fill.fgColor = { rgb: 'FAFBFF' };
        }
        
        // Format Status strings green/red
        const valStr = String(cell.v || '').trim();
        if (valStr === 'Paid' || valStr === 'Lunas') {
          cellStyle.font.color = { rgb: '16A34A' };
          cellStyle.font.bold = true;
        } else if (valStr === 'Pending' || valStr === 'Belum Bayar') {
          cellStyle.font.color = { rgb: 'DC2626' };
          cellStyle.font.bold = true;
        }
      }

      // Keep Excel currency format on number cells
      if (isCurrencyCol && typeof cell.v === 'number') {
        cell.z = '#,##0.00';
      }

      cell.s = cellStyle;
    }
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
  companyName: string = "PT GMERA SOLUSI",
  periode: string = "",
  isAccountingLayout: boolean = false
) {
  const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();

  const primary:  [number, number, number] = [37, 99, 235]; // Royal Blue
  const darkText: [number, number, number] = [30, 30, 50];
  const gray:     [number, number, number] = [120, 120, 140];

  // ── Company header ────────────────────────────────────────────────────────
  doc.setFillColor(...primary);
  doc.rect(0, 0, pageW, 2, 'F'); // thin accent line at top

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(...darkText);
  doc.text(companyName.toUpperCase(), 14, 14);

  doc.setFontSize(11);
  doc.text(title.toUpperCase(), 14, 21);

  const now = new Date();
  const printDate = now.toLocaleDateString('id-ID', {
    day: '2-digit', month: 'long', year: 'numeric',
  });
  const printTime = now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(...gray);

  let currentY = 26;
  if (periode) {
    doc.text(`Periode: ${periode}`, 14, currentY);
    currentY += 4;
  }
  doc.text(`Dicetak: ${printDate} ${printTime}`, 14, currentY);

  // right side — period info
  doc.setFontSize(8);
  doc.text(`Jumlah data: ${data.length} baris`, pageW - 14, 14, { align: 'right' });

  // divider
  doc.setDrawColor(220, 220, 230);
  doc.setLineWidth(0.3);
  doc.line(14, currentY + 3, pageW - 14, currentY + 3);

  // ── Table headers ─────────────────────────────────────────────────────────
  const headers = isAccountingLayout ? columns.map(c => c.header) : ['No.', ...columns.map(c => c.header)];

  // ── Identify column types ─────────────────────────────────────────────────
  const currencyColIndices = new Set<number>();
  columns.forEach((c, i) => { if (c.isCurrency) currencyColIndices.add(isAccountingLayout ? i : i + 1); });

  // ── Table body ────────────────────────────────────────────────────────────
  const body = data.map((row, idx) => {
    const cells: string[] = isAccountingLayout ? [] : [String(idx + 1)];
    columns.forEach(col => {
      const rawVal = resolveKey(row, col.key);
      let val = rawVal;
      
      // Keep special styling markers for hook later
      if (typeof val === 'string' && (val.startsWith('HDR: ') || val.startsWith('SUB: ') || val.startsWith('FTR: '))) {
        // Just store it exactly as is, we will strip it in the hook, or wait, if we strip it in the hook, the hook only sees the text inside the cell AFTER it's drawn?
        // Actually, autoTable draws what we put in the cell. If we strip it here, the hook can't find it. 
        // We MUST put it in the cell, then strip it in `didParseCell`.
      }
      if (col.isCurrency && typeof val === 'number') {
        cells.push(fmtAccounting(val));
      } else if (col.isDate || col.key === 'date' || col.key.includes('_date')) {
        cells.push(fmtDate(val));
      } else {
        let strVal = String(val ?? '');
        if (strVal === 'paid') strVal = 'Paid';
        else if (strVal === 'pending') strVal = 'Pending';
        else if (strVal === 'lunas') strVal = 'Lunas';
        else if (strVal === 'belum bayar') strVal = 'Belum Bayar';
        cells.push(strVal);
      }
    });
    return cells;
  });

  const totalsRow: string[] = isAccountingLayout ? [] : [''];
  if (!isAccountingLayout) {
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
  }

  // ── Column styles ─────────────────────────────────────────────────────────
  const colStyles: Record<number, any> = {};
  if (!isAccountingLayout) {
    colStyles[0] = { halign: 'center', cellWidth: 10 }; // No.
  }
  currencyColIndices.forEach(i => {
    colStyles[i] = { halign: 'right', fontStyle: 'normal' };
  });

  // ── Render table ──────────────────────────────────────────────────────────
  autoTable(doc, {
    head: isAccountingLayout ? [] : [headers],
    body: isAccountingLayout ? body : [...body, totalsRow],
    startY: currentY + 6,
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
      fillColor: [37, 99, 235], // vibrant royal blue header
      textColor: [255, 255, 255], // white text
      fontStyle: 'bold',
      fontSize: 7.5,
      lineWidth: 0.15,
      lineColor: [200, 200, 210],
    },
    bodyStyles: {
      lineWidth: 0.15,
      lineColor: [200, 200, 210],
    },
    alternateRowStyles: { fillColor: [250, 251, 255] },
    columnStyles: colStyles,
    // Style the totals row (last row) and specific texts
    didParseCell: (hookData: any) => {
      if (hookData.section === 'body') {
        const rowData = hookData.row.raw as string[];
        const firstColText = rowData[0] || '';
        
        if (!isAccountingLayout && hookData.row.index === body.length) {
          // Default Totals row
          hookData.cell.styles.fontStyle = 'bold';
          hookData.cell.styles.fillColor = [239, 246, 255]; // elegant light blue matching screenshot
          hookData.cell.styles.lineWidth = 0.15;
          hookData.cell.styles.lineColor = [200, 200, 210];
          hookData.cell.styles.fontSize = 8;
          hookData.cell.styles.textColor = darkText;
        } else if (isAccountingLayout) {
          // Handle accounting layout styling
          if (firstColText.startsWith('HDR: ')) {
            hookData.cell.styles.fillColor = [37, 99, 235]; // vibrant royal blue header
            hookData.cell.styles.textColor = [255, 255, 255];
            hookData.cell.styles.fontStyle = 'bold';
            hookData.cell.styles.lineWidth = 0.15;
            hookData.cell.styles.lineColor = [200, 200, 210];
            if (hookData.column.index === 0) {
              hookData.cell.text = [(hookData.cell.raw as string).replace('HDR: ', '')];
            } else {
              hookData.cell.text = [''];
            }
          } else if (firstColText.startsWith('SUB: ')) {
            hookData.cell.styles.fillColor = [239, 246, 255]; // matching light blue for subtotal
            hookData.cell.styles.textColor = darkText;
            hookData.cell.styles.fontStyle = 'bold';
            hookData.cell.styles.lineWidth = 0.15;
            hookData.cell.styles.lineColor = [200, 200, 210];
            if (hookData.column.index === 0) {
              hookData.cell.text = [(hookData.cell.raw as string).replace('SUB: ', '')];
            }
          } else if (firstColText.startsWith('FTR: ')) {
            hookData.cell.styles.fillColor = [37, 99, 235]; // vibrant royal blue footer
            hookData.cell.styles.textColor = [255, 255, 255];
            hookData.cell.styles.fontStyle = 'bold';
            hookData.cell.styles.lineWidth = 0.15;
            hookData.cell.styles.lineColor = [200, 200, 210];
            if (hookData.column.index === 0) {
              hookData.cell.text = [(hookData.cell.raw as string).replace('FTR: ', '')];
            }
          }
        } else {
          // Format specific texts (only for non-accounting layouts to avoid collision)
          const textStr = String(hookData.cell.raw || '').toLowerCase().trim();
          if (textStr === 'paid' || textStr === 'lunas' || textStr === 'pemasukan') {
            hookData.cell.styles.textColor = [22, 163, 74]; // professional medium green
            hookData.cell.styles.fontStyle = 'bold';
          } else if (textStr === 'pending' || textStr === 'belum bayar' || textStr === 'pengeluaran') {
            hookData.cell.styles.textColor = [220, 38, 38]; // professional medium red
            hookData.cell.styles.fontStyle = 'bold';
          }
        }
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
