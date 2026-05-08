"use client";

import React, { useState, useEffect } from "react";
import { DocumentDownloadIcon, Document1Icon, ArrowUpIcon, ArrowDownIcon, WalletIcon, CalenderIcon, HelpIcon, MarginIcon, NegativeMarginIcon } from "@astraicons/react/bold";
import { Button } from "@/components/ui/Button";
import { MetricCard } from "@/components/dashboard/MetricCard";
import { FinancialChart } from "@/components/dashboard/FinancialChart";
import { CustomDatePicker } from "@/components/ui/CustomDatePicker";
import { getFinancialReport, getReportChartData } from "@/lib/db";
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

  const loadData = async () => {
    setLoading(true);
    const [reportSummary, reportChart] = await Promise.all([
      getFinancialReport(periodFrom, periodTo),
      getReportChartData(periodFrom, periodTo) 
    ]);

    setSummary(reportSummary);
    setChartData(reportChart);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);



  const handleApply = () => {
    loadData();
  };

  const exportColumns = [
    { header: 'Periode', key: 'name', width: 20 },
    { header: 'Pendapatan (Rp)', key: 'income', isCurrency: true, width: 24 },
    { header: 'Pengeluaran (Rp)', key: 'expense', isCurrency: true, width: 24 }
  ];

  const handleExportExcel = async () => {
    try {
      exportToExcel(chartData, exportColumns, `Laporan_Keuangan_${periodFrom}_${periodTo}`);
      toast("Ekspor Excel Selesai", {
        description: "Laporan keuangan berhasil diekspor ke format Excel.",
        icon: <div className="w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center bg-[#5C67F2]/10 text-[#5C67F2]"><ArrowDownIcon className="w-5 h-5" /></div>,
      });
      
      if (user) {
        await createAuditLog(user.id, 'create', 'Export', null, null, { description: `Laporan Keuangan (${periodFrom} - ${periodTo}) (Excel) berhasil diunduh` });
        window.dispatchEvent(new CustomEvent('refreshNotifications'));
      }
    } catch (error) {
      toast("Gagal Ekspor Excel", {
        description: "Terjadi kesalahan saat mengekspor data ke Excel.",
        icon: <div className="w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center bg-[#FA5A7D]/10 text-[#FA5A7D]"><HelpIcon className="w-5 h-5" /></div>,
      });
    }
  };

  const handleExportPDF = async () => {
    toast.info("Sedang menyiapkan PDF...");
    try {
      exportToPDF(chartData, exportColumns, 'Laporan Keuangan Bulanan', `Laporan_Keuangan_${periodFrom}_${periodTo}`);
      toast("Ekspor PDF Selesai", {
        description: "Laporan keuangan berhasil diunduh dalam format PDF.",
        icon: <div className="w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center bg-[#5C67F2]/10 text-[#5C67F2]"><ArrowDownIcon className="w-5 h-5" /></div>,
      });

      if (user) {
        await createAuditLog(user.id, 'create', 'Export', null, null, { description: `Laporan Keuangan (${periodFrom} - ${periodTo}) (PDF) berhasil diunduh` });
        window.dispatchEvent(new CustomEvent('refreshNotifications'));
      }
    } catch (error) {
      console.error("PDF Export Error:", error);
      toast("Gagal Ekspor PDF", {
        description: "Terjadi kesalahan saat mengekspor data ke PDF.",
        icon: <div className="w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center bg-[#FA5A7D]/10 text-[#FA5A7D]"><HelpIcon className="w-5 h-5" /></div>,
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

      {/* Export Actions */}
      <div className="bg-primary/5 border border-primary/20 rounded-2xl p-8 text-center flex flex-col items-center justify-center space-y-4">
        <div className="w-16 h-16 bg-surface rounded-2xl flex items-center justify-center text-primary shadow-sm">
          <Document1Icon className="w-8 h-8" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-text-primary">Unduh Laporan Lengkap</h3>
          <p className="text-sm text-text-secondary max-w-md mx-auto mt-1">
            Ekspor seluruh transaksi, buku besar, dan laba rugi untuk periode yang dipilih dalam format yang Anda butuhkan.
          </p>
        </div>
        <div className="flex gap-3 pt-2">
          <Button variant="danger" className="flex items-center gap-2" onClick={handleExportPDF}>
            <Document1Icon className="w-[18px] h-[18px]" /> Export PDF
          </Button>
          <Button className="bg-success hover:bg-success/90 text-white flex items-center gap-2 border-none" onClick={handleExportExcel}>
            <DocumentDownloadIcon className="w-[18px] h-[18px]" /> Export Excel
          </Button>
        </div>
      </div>
    </div>
  );
}
