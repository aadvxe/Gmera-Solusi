// Import React hook yang dipakai kartu aktivitas terbaru dari income, expense, dan invoice, misalnya untuk state, efek setelah render, atau referensi elemen.
import React from "react";
// Import ikon yang dipakai kartu aktivitas terbaru dari income, expense, dan invoice untuk memperjelas tombol, menu, status, dan aksi di layar.
import { ArrowRightIcon, WalletIcon, DocumentIcon, Document1Icon } from "@astraicons/react/bold";
// Import Link supaya menu/tombol di kartu aktivitas terbaru dari income, expense, dan invoice bisa berpindah halaman tanpa reload penuh.
import Link from "next/link";

// Interface ini menjelaskan field yang dipakai kartu aktivitas terbaru dari income, expense, dan invoice supaya data form/database tidak salah bentuk.
interface Transaction {
  id: string;
  title: string;
  type: "income" | "expense" | "invoice";
  amount: string;
  date: string;
  description: string;
}

// Interface ini menjelaskan field yang dipakai kartu aktivitas terbaru dari income, expense, dan invoice supaya data form/database tidak salah bentuk.
interface RecentTransactionsProps {
  transactions: Transaction[];
}

// RecentTransactions mengubah daftar aktivitas terbaru menjadi baris-baris ringkas di dashboard.
export function RecentTransactions({ transactions }: RecentTransactionsProps) {
  // getIcon mengambil atau menghitung data yang dibutuhkan kartu aktivitas terbaru dari income, expense, dan invoice.
  const getIcon = (type: string) => {
    switch (type) {
      case "income": return <WalletIcon className="w-[18px] h-[18px] text-success" />;
      case "expense": return <DocumentIcon className="w-[18px] h-[18px] text-danger" />;
      case "invoice": return <Document1Icon className="w-[18px] h-[18px] text-info" />;
      default: return <WalletIcon className="w-[18px] h-[18px]" />;
    }
  };

  // getIconBg mengambil atau menghitung data yang dibutuhkan kartu aktivitas terbaru dari income, expense, dan invoice.
  const getIconBg = (type: string) => {
    switch (type) {
      case "income": return "bg-success/10";
      case "expense": return "bg-danger/10";
      case "invoice": return "bg-info/10";
      default: return "bg-background";
    }
  };

  // getIconBg menampilkan UI untuk kartu aktivitas terbaru dari income, expense, dan invoice.
  return (
    <div className="bg-surface rounded-xl border border-border shadow-sm flex flex-col h-full">
      <div className="p-6 border-b border-border">
        <h3 className="text-lg font-semibold text-text-primary">
          Aktivitas Terbaru
        </h3>
      </div>

      <div className="p-4 flex-1 flex flex-col gap-3">
        {/* map ini membuat satu output untuk setiap item daftar yang sedang dirender oleh RecentTransactions. */}
        {transactions.map((tx) => (
          <div key={tx.id} className="flex items-start gap-4 p-2 rounded-lg hover:bg-background transition-colors">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${getIconBg(tx.type)}`}>
              {getIcon(tx.type)}
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex justify-between items-start mb-0.5">
                <p className="text-sm font-semibold text-text-primary truncate pr-4">
                  {tx.title}
                </p>
                <p className={`text-sm font-semibold whitespace-nowrap tabular-nums ${
                  tx.type === "expense" ? "text-danger" : "text-success"
                }`}>
                  {tx.type === "expense" ? "-" : "+"}{tx.amount}
                </p>
              </div>
              <div className="flex justify-between items-center text-xs text-text-secondary">
                <span className="truncate">{tx.description}</span>
                <span className="whitespace-nowrap ml-4">{tx.date}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="p-4 border-t border-border mt-auto">
        <Link href="/laporan" className="text-sm font-medium text-primary hover:text-primary/80 flex items-center justify-center gap-1 w-full transition-colors">
          Lihat Semua Aktivitas <ArrowRightIcon className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}
