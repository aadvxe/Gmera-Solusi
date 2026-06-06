// Import React hook yang dipakai kartu invoice belum bayar dan invoice jatuh tempo, misalnya untuk state, efek setelah render, atau referensi elemen.
import React from "react";
// Import ikon yang dipakai kartu invoice belum bayar dan invoice jatuh tempo untuk memperjelas tombol, menu, status, dan aksi di layar.
import { InfoIcon, ArrowRightIcon } from "@astraicons/react/bold";
// Import Link supaya menu/tombol di kartu invoice belum bayar dan invoice jatuh tempo bisa berpindah halaman tanpa reload penuh.
import Link from "next/link";

// Interface ini menjelaskan field yang dipakai kartu invoice belum bayar dan invoice jatuh tempo supaya data form/database tidak salah bentuk.
interface Invoice {
  id: string;
  client: string;
  amount: string;
  date: string;
  isOverdue?: boolean;
}

// Interface ini menjelaskan field yang dipakai kartu invoice belum bayar dan invoice jatuh tempo supaya data form/database tidak salah bentuk.
interface UnpaidInvoicesProps {
  invoices: Invoice[];
}

// UnpaidInvoices menampilkan invoice yang belum dibayar dan menandai mana yang sudah jatuh tempo.
export function UnpaidInvoices({ invoices }: UnpaidInvoicesProps) {
  // UnpaidInvoices menampilkan UI untuk kartu invoice belum bayar dan invoice jatuh tempo.
  return (
    <div className="bg-surface rounded-xl border border-border shadow-sm flex flex-col h-full">
      <div className="p-6 border-b border-border flex justify-between items-center">
        <h3 className="text-lg font-semibold text-text-primary flex items-center">
          Invoice Belum Bayar
        </h3>
        <span className="bg-warning/20 text-warning px-2.5 py-0.5 rounded-full text-xs font-semibold flex items-center gap-1">
          <InfoIcon className="w-3 h-3" />
          {/* filter ini menyisakan data UnpaidInvoices yang cocok dengan pencarian, status, role, atau tanggal aktif. */}
          {invoices.filter(i => i.isOverdue).length} Overdue
        </span>
      </div>

      <div className="p-4 flex-1 flex flex-col gap-2">
        {/* map ini membuat baris invoice dari daftar invoice yang sedang ditampilkan user. */}
        {invoices.map((invoice) => (
          <div 
            key={invoice.id} 
            className="flex justify-between items-center p-3 rounded-lg hover:bg-background transition-colors group"
          >
            <div className="flex items-center gap-3">
              <div className={`w-1 h-10 rounded-full ${invoice.isOverdue ? "bg-danger" : "bg-warning"}`} />
              <div>
                <div className="font-medium text-sm text-text-primary group-hover:text-primary transition-colors">
                  {invoice.client}
                </div>
                <div className="text-xs text-text-secondary flex gap-2">
                  <span className="font-mono">{invoice.id}</span>
                  <span>•</span>
                  <span>{invoice.date}</span>
                </div>
              </div>
            </div>
            <div className="text-sm font-semibold text-text-primary tabular-nums">
              {invoice.amount}
            </div>
          </div>
        ))}
      </div>

      <div className="p-4 border-t border-border mt-auto">
        <Link href="/e-invoice" className="text-sm font-medium text-primary hover:text-primary/80 flex items-center justify-center gap-1 w-full transition-colors">
          Lihat Semua Invoice <ArrowRightIcon className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}
