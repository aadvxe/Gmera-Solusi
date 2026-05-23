"use client";

import React, { useState, useEffect } from "react";
import { DocumentDownloadIcon, Document1Icon, ArrowUpIcon, ArrowDownIcon, WalletIcon, CalenderIcon, HelpIcon, MarginIcon, NegativeMarginIcon } from "@astraicons/react/bold";
import { Button } from "@/components/ui/Button";
import { MetricCard } from "@/components/dashboard/MetricCard";
import { FinancialChart } from "@/components/dashboard/FinancialChart";
import { CustomDatePicker } from "@/components/ui/CustomDatePicker";
import { getFinancialReport, getReportChartData, getAccountingReportsData } from "@/lib/db";
import { getCompanyProfile } from "@/lib/db/users";
import { formatCurrency } from "@/lib/utils";
import { exportToExcel, exportToPDF } from "@/lib/export";
import { createAuditLog } from "@/lib/db/users";
import { useAuthStore } from "@/store/authStore";
import { toast } from "sonner";

export default function LaporanPage() {
  const [periodFrom, setPeriodFrom] = useState("2026-01-01");
  const [periodTo, setPeriodTo] = useState("2026-12-31");
  const [loading, setLoading] = useState(true);
  const user = useAuthStore(state => state.user);
  
  const [summary, setSummary] = useState({ totalIncome: 0, totalExpense: 0, netProfit: 0 });
  const [chartData, setChartData] = useState<any[]>([]);
  const [rawTransactions, setRawTransactions] = useState<any[]>([]);
  const [companyName, setCompanyName] = useState("PT GMERA SOLUSI");

  const loadData = async () => {
    setLoading(true);
    const [reportSummary, reportChart, raw, company] = await Promise.all([
      getFinancialReport(periodFrom, periodTo),
      getReportChartData(periodFrom, periodTo),
      getAccountingReportsData(periodFrom, periodTo),
      getCompanyProfile()
    ]);

    setSummary(reportSummary);
    setChartData(reportChart);
    setRawTransactions(raw);
    if (company?.company_name) setCompanyName(company.company_name);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleApply = () => {
    loadData();
  };

  const handleExport = async (type: 'transaksi' | 'bukubesar' | 'labarugi', format: 'pdf' | 'excel') => {
    toast.info(`Sedang menyiapkan ekspor ${type.toUpperCase()}...`);
    try {
      const pFormat = new Intl.DateTimeFormat('id-ID', { month: 'long', year: 'numeric' });
      const p = `${pFormat.format(new Date(periodFrom))} - ${pFormat.format(new Date(periodTo))}`;
      
      let data: any[] = [];
      let cols: any[] = [];
      let title = "";
      
      if (type === 'transaksi') {
        title = "Laporan Transaksi";
        cols = [
          { header: 'Tanggal', key: 'date', width: 12, isDate: true },
          { header: 'Jenis', key: 'type', width: 15 },
          { header: 'Keterangan', key: 'description', width: 35 },
          { header: 'Kategori', key: 'category', width: 15 },
          { header: 'Nominal', key: 'amount', isCurrency: true, width: 20 },
        ];
        data = rawTransactions.map(t => ({
          ...t,
          type: t.type === 'income' ? 'Pemasukan' : 'Pengeluaran',
          description: t.title + (t.description ? ` - ${t.description}` : ''),
        }));
      } else if (type === 'bukubesar') {
        title = "Buku Besar";
        cols = [
          { header: 'Tanggal', key: 'date', width: 12, isDate: true },
          { header: 'Keterangan', key: 'description', width: 25 },
          { header: 'Kategori', key: 'category', width: 15 },
          { header: 'Debit (Masuk)', key: 'debit', isCurrency: true, width: 20 },
          { header: 'Kredit (Keluar)', key: 'kredit', isCurrency: true, width: 20 },
          { header: 'Saldo', key: 'saldo', isCurrency: true, width: 20 },
        ];
        let runningBalance = 0;
        data = rawTransactions.map(t => {
          if (t.type === 'income') runningBalance += t.amount;
          else runningBalance -= t.amount;
          
          return {
            date: t.date,
            description: t.title + (t.description ? ` - ${t.description}` : ''),
            category: t.category,
            debit: t.type === 'income' ? t.amount : null,
            kredit: t.type === 'expense' ? t.amount : null,
            saldo: runningBalance
          };
        });
      } else if (type === 'labarugi') {
        title = "Laporan Laba Rugi";
        cols = [
          { header: 'Keterangan', key: 'keterangan', width: 45 },
          { header: 'Total', key: 'total', isCurrency: true, width: 30 },
        ];
        
        // Group by category for Pendapatan
        const pendapatanGroup: Record<string, number> = {};
        rawTransactions.filter(t => t.type === 'income').forEach(t => {
          pendapatanGroup[t.category] = (pendapatanGroup[t.category] || 0) + t.amount;
        });

        // Group by category for Pengeluaran
        const pengeluaranGroup: Record<string, number> = {};
        rawTransactions.filter(t => t.type === 'expense').forEach(t => {
          pengeluaranGroup[t.category] = (pengeluaranGroup[t.category] || 0) + t.amount;
        });

        const incomeItems = Object.keys(pendapatanGroup).map(k => ({
          keterangan: k,
          total: pendapatanGroup[k]
        }));
        
        const expenseItems = Object.keys(pengeluaranGroup).map(k => ({
          keterangan: k,
          total: pengeluaranGroup[k]
        }));

        data = [
          { keterangan: 'HDR: Pendapatan', total: null },
          ...incomeItems,
          { keterangan: 'SUB: Jumlah Pendapatan', total: summary.totalIncome },
          { keterangan: 'HDR: Pengeluaran', total: null },
          ...expenseItems,
          { keterangan: 'SUB: Jumlah Pengeluaran', total: summary.totalExpense },
          { keterangan: 'FTR: LABA/ RUGI BERSIH', total: summary.netProfit },
        ];
      }

      if (format === 'pdf') {
        exportToPDF(data, cols, title, `${title.replace(/\s/g, '_')}_${periodFrom}_${periodTo}`, companyName, p, type === 'labarugi');
      } else {
        exportToExcel(data, cols, `${title.replace(/\s/g, '_')}_${periodFrom}_${periodTo}`, type === 'labarugi');
      }

      toast.success("Ekspor Selesai", {
        description: `${title} berhasil diunduh dalam format ${format.toUpperCase()}.`,
      });

      if (user) {
        await createAuditLog(user.id, 'create', 'Export', null, null, { description: `${title} (${periodFrom} - ${periodTo}) (${format.toUpperCase()}) berhasil diunduh` });
        window.dispatchEvent(new CustomEvent('refreshNotifications'));
      }
    } catch (error) {
      console.error("Export Error:", error);
      toast.error("Gagal Ekspor", {
        description: "Terjadi kesalahan saat mengekspor data.",
      });
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header & Filter */}
      <div className="bg-surface border border-border rounded-2xl shadow-sm p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Laporan Keuangan</h1>
          <p className="text-sm text-text-secondary mt-1">Analitik dan ringkasan arus kas perusahaan</p>
        </div>
        
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
          <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
            <CustomDatePicker 
              value={periodFrom} 
              onChange={setPeriodFrom} 
              className="w-full sm:w-40" 
            />
            <span className="text-text-secondary font-medium hidden sm:block">s/d</span>
            <CustomDatePicker 
              value={periodTo} 
              onChange={setPeriodTo} 
              className="w-full sm:w-40" 
            />
          </div>
          <Button onClick={handleApply} disabled={loading} className="w-full sm:w-auto shrink-0 px-6 rounded-xl">
            {loading ? "Memuat..." : "Terapkan"}
          </Button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <MetricCard 
          title="Total Pendapatan" 
          amount={formatCurrency(summary.totalIncome)} 
          period="Periode Terpilih" 
          icon={ArrowUpIcon} 
          variant="success" 
        />
        <MetricCard 
          title="Total Pengeluaran" 
          amount={formatCurrency(summary.totalExpense)} 
          period="Periode Terpilih" 
          icon={ArrowDownIcon} 
          variant="danger" 
        />
        <MetricCard 
          title="Laba Bersih (Net Profit)" 
          amount={formatCurrency(summary.netProfit)} 
          period="Periode Terpilih" 
          icon={WalletIcon} 
          variant="info" 
        />
      </div>



      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <FinancialChart 
          title="Tren Pendapatan"
          icon={MarginIcon}
          rawData={chartData}
          dataKey="income"
          color="#76c893"
          total={formatCurrency(summary.totalIncome)}
        />
        <FinancialChart 
          title="Tren Pengeluaran"
          icon={NegativeMarginIcon}
          rawData={chartData}
          dataKey="expense"
          color="#f08a5d"
          total={formatCurrency(summary.totalExpense)}
        />
      </div>

      {/* Export Actions Section (Moved to bottom) */}
      <div className="bg-primary/5 border border-primary/20 rounded-2xl p-8 shadow-sm">
        <div className="text-center mb-8 flex flex-col items-center">
          <div className="w-16 h-16 bg-surface rounded-2xl flex items-center justify-center text-primary shadow-sm mb-4">
            <Document1Icon className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-bold text-text-primary">Unduh Laporan Lengkap</h3>
          <p className="text-sm text-text-secondary max-w-lg mx-auto mt-2">
            Ekspor seluruh transaksi, buku besar, dan laba rugi untuk periode yang dipilih dalam format PDF yang rapi atau Excel untuk analisis lebih lanjut.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Laporan Transaksi */}
          <div className="bg-white border border-primary/10 rounded-2xl p-6 text-center shadow-sm flex flex-col items-center">
            <h3 className="text-lg font-bold text-[#151D48] mb-2">Laporan Transaksi</h3>
            <p className="text-xs text-gray-500 mb-6 flex-1">
              Daftar lengkap seluruh pendapatan dan pengeluaran secara kronologis.
            </p>
            <div className="flex gap-2 w-full">
              <Button variant="outline" className="flex-1 flex items-center justify-center gap-1.5 text-xs text-red-500 hover:text-white border-red-200 hover:bg-red-500 hover:border-red-500 transition-colors" onClick={() => handleExport('transaksi', 'pdf')} disabled={loading}>
                <Document1Icon className="w-4 h-4" /> PDF
              </Button>
              <Button variant="outline" className="flex-1 flex items-center justify-center gap-1.5 text-xs text-[#3CD856] hover:text-white border-[#3CD856]/30 hover:bg-[#3CD856] hover:border-[#3CD856] transition-colors" onClick={() => handleExport('transaksi', 'excel')} disabled={loading}>
                <DocumentDownloadIcon className="w-4 h-4" /> Excel
              </Button>
            </div>
          </div>

          {/* Buku Besar */}
          <div className="bg-white border border-primary/10 rounded-2xl p-6 text-center shadow-sm flex flex-col items-center">
            <h3 className="text-lg font-bold text-[#151D48] mb-2">Buku Besar</h3>
            <p className="text-xs text-gray-500 mb-6 flex-1">
              Format debit, kredit, dan saldo berjalan (running balance) per transaksi.
            </p>
            <div className="flex gap-2 w-full">
              <Button variant="outline" className="flex-1 flex items-center justify-center gap-1.5 text-xs text-red-500 hover:text-white border-red-200 hover:bg-red-500 hover:border-red-500 transition-colors" onClick={() => handleExport('bukubesar', 'pdf')} disabled={loading}>
                <Document1Icon className="w-4 h-4" /> PDF
              </Button>
              <Button variant="outline" className="flex-1 flex items-center justify-center gap-1.5 text-xs text-[#3CD856] hover:text-white border-[#3CD856]/30 hover:bg-[#3CD856] hover:border-[#3CD856] transition-colors" onClick={() => handleExport('bukubesar', 'excel')} disabled={loading}>
                <DocumentDownloadIcon className="w-4 h-4" /> Excel
              </Button>
            </div>
          </div>

          {/* Laba Rugi */}
          <div className="bg-white border border-primary/10 rounded-2xl p-6 text-center shadow-sm flex flex-col items-center">
            <h3 className="text-lg font-bold text-[#151D48] mb-2">Laba Rugi</h3>
            <p className="text-xs text-gray-500 mb-6 flex-1">
              Ringkasan total pendapatan dan pengeluaran untuk melihat net profit.
            </p>
            <div className="flex gap-2 w-full">
              <Button variant="outline" className="flex-1 flex items-center justify-center gap-1.5 text-xs text-red-500 hover:text-white border-red-200 hover:bg-red-500 hover:border-red-500 transition-colors" onClick={() => handleExport('labarugi', 'pdf')} disabled={loading}>
                <Document1Icon className="w-4 h-4" /> PDF
              </Button>
              <Button variant="outline" className="flex-1 flex items-center justify-center gap-1.5 text-xs text-[#3CD856] hover:text-white border-[#3CD856]/30 hover:bg-[#3CD856] hover:border-[#3CD856] transition-colors" onClick={() => handleExport('labarugi', 'excel')} disabled={loading}>
                <DocumentDownloadIcon className="w-4 h-4" /> Excel
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
