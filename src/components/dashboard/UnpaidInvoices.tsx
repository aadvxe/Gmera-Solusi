import React from "react";
import { InfoIcon, ArrowRightIcon } from "@astraicons/react/bold";
import Link from "next/link";

interface Invoice {
  id: string;
  client: string;
  amount: string;
  date: string;
  isOverdue?: boolean;
}

interface UnpaidInvoicesProps {
  invoices: Invoice[];
}

export function UnpaidInvoices({ invoices }: UnpaidInvoicesProps) {
  return (
    <div className="bg-surface rounded-xl border border-border shadow-sm flex flex-col h-full">
      <div className="p-6 border-b border-border flex justify-between items-center">
        <h3 className="text-lg font-semibold text-text-primary flex items-center">
          Invoice Belum Bayar
        </h3>
        <span className="bg-warning/20 text-warning px-2.5 py-0.5 rounded-full text-xs font-semibold flex items-center gap-1">
          <InfoIcon className="w-3 h-3" />
          {invoices.filter(i => i.isOverdue).length} Overdue
        </span>
      </div>

      <div className="p-4 flex-1 flex flex-col gap-2">
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
