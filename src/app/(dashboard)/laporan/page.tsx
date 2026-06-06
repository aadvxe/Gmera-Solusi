"use client";

// Import React hook yang dipakai halaman laporan yang menghitung pendapatan, pengeluaran, laba, dan export, misalnya untuk state, efek setelah render, atau referensi elemen.
import React, { useState, useEffect } from "react";
// Import ikon yang dipakai halaman laporan yang menghitung pendapatan, pengeluaran, laba, dan export untuk memperjelas tombol, menu, status, dan aksi di layar.
import { DocumentDownloadIcon, Document1Icon, ArrowUpIcon, ArrowDownIcon, WalletIcon, CalenderIcon, HelpIcon, MarginIcon, NegativeMarginIcon } from "@astraicons/react/bold";
// Import komponen UI reusable supaya halaman laporan yang menghitung pendapatan, pengeluaran, laba, dan export memakai tampilan tombol, modal, input, atau tabel yang konsisten.
import { Button } from "@/components/ui/Button";
// Import MetricCard untuk menampilkan angka laporan seperti pendapatan, pengeluaran, dan laba dalam kartu ringkasan.
import { MetricCard } from "@/components/dashboard/MetricCard";
// Import FinancialChart untuk menggambar grafik pendapatan dan pengeluaran pada laporan.
import { FinancialChart } from "@/components/dashboard/FinancialChart";
// Import komponen UI reusable supaya halaman laporan yang menghitung pendapatan, pengeluaran, laba, dan export memakai tampilan tombol, modal, input, atau tabel yang konsisten.
import { CustomDatePicker } from "@/components/ui/CustomDatePicker";
// Import helper database yang dipakai halaman laporan yang menghitung pendapatan, pengeluaran, laba, dan export untuk mengambil atau menyimpan data Supabase.
import { getFinancialReport, getReportChartData, getAccountingReportsData } from "@/lib/db";
// Import helper database yang dipakai halaman laporan yang menghitung pendapatan, pengeluaran, laba, dan export untuk mengambil atau menyimpan data Supabase.
import { getCompanyProfile } from "@/lib/db/users";
// Import utility project supaya halaman laporan yang menghitung pendapatan, pengeluaran, laba, dan export bisa memformat class Tailwind atau angka Rupiah dengan cara yang sama.
import { formatCurrency } from "@/lib/utils";
// Import helper export supaya halaman laporan bisa membuat PDF/Excel dari ringkasan pendapatan, pengeluaran, laba, dan transaksi pada rentang tanggal aktif.
import { exportToExcel, exportToPDF } from "@/lib/export";
// Import helper database yang dipakai halaman laporan yang menghitung pendapatan, pengeluaran, laba, dan export untuk mengambil atau menyimpan data Supabase.
import { createAuditLog } from "@/lib/db/users";
// Import authStore supaya halaman laporan yang menghitung pendapatan, pengeluaran, laba, dan export bisa membaca user login, role, nama tampilan, atau mengosongkan session saat logout.
import { useAuthStore } from "@/store/authStore";
// Import Sonner untuk menampilkan toast sukses/error di halaman laporan yang menghitung pendapatan, pengeluaran, laba, dan export.
import { toast } from "sonner";

const SHOW_LABA_RUGI = false; // Toggle to true to show the Laba Rugi button/card in the future

// LaporanPage mengambil transaksi pada rentang tanggal lalu menyiapkan ringkasan dan file export laporan.
export default function LaporanPage() {
  // periodFrom menyimpan nilai period from yang berubah saat user berinteraksi dengan halaman laporan yang menghitung pendapatan, pengeluaran, laba, dan export.
  const [periodFrom, setPeriodFrom] = useState("2026-01-01");
  // periodTo menyimpan nilai period to yang berubah saat user berinteraksi dengan halaman laporan yang menghitung pendapatan, pengeluaran, laba, dan export.
  const [periodTo, setPeriodTo] = useState("2026-12-31");
  // loading menyimpan nilai loading yang berubah saat user berinteraksi dengan halaman laporan yang menghitung pendapatan, pengeluaran, laba, dan export.
  const [loading, setLoading] = useState(true);
  const user = useAuthStore(state => state.user);

  // summary menyimpan nilai summary yang berubah saat user berinteraksi dengan halaman laporan yang menghitung pendapatan, pengeluaran, laba, dan export.
  const [summary, setSummary] = useState({ totalIncome: 0, totalExpense: 0, netProfit: 0 });
  const [chartData, setChartData] = useState<any[]>([]);
  const [rawTransactions, setRawTransactions] = useState<any[]>([]);
  // companyName menyimpan nilai company name yang berubah saat user berinteraksi dengan halaman laporan yang menghitung pendapatan, pengeluaran, laba, dan export.
  const [companyName, setCompanyName] = useState("PT GMERA SOLUSI");

  // loadData mengambil data yang dibutuhkan halaman laporan yang menghitung pendapatan, pengeluaran, laba, dan export dari Supabase lalu mengisi state halaman.
  const loadData = async () => {
    setLoading(true);
    // await Promise.all menunggu beberapa query berjalan paralel sampai semuanya selesai.
    const [reportSummary, reportChart, raw, company] = await Promise.all([
      getFinancialReport(periodFrom, periodTo),
      getReportChartData(periodFrom, periodTo),
      getAccountingReportsData(periodFrom, periodTo),
      getCompanyProfile()
    ]);

    setSummary(reportSummary);
    setChartData(reportChart);
    setRawTransactions(raw);
    // Kondisi if (company?.company_name) setCompanyName(company.company_name); membuat isi blok if di bawahnya hanya berjalan saat kondisi itu benar di halaman laporan.
    if (company?.company_name) setCompanyName(company.company_name);
    setLoading(false);
  };

  // Effect ini mengambil data yang diperlukan halaman laporan yang menghitung pendapatan, pengeluaran, laba, dan export saat halaman dibuka atau filter berubah.
  useEffect(() => {
    loadData();
  }, []);

  // handleApply adalah fungsi penangan aksi user; fungsi ini berjalan saat user mengklik, mengetik, memilih, atau submit sesuatu.
  const handleApply = () => {
    loadData();
  };

  // handleExport menangani aksi user di halaman laporan yang menghitung pendapatan, pengeluaran, laba, dan export, seperti klik tombol, submit form, atau perubahan input.
  const handleExport = async (type: 'transaksi' | 'bukubesar' | 'labarugi', format: 'pdf' | 'excel') => {
    toast.info(`Sedang menyiapkan ekspor ${type.toUpperCase()}...`);
    // try ini mengambil data laporan dari Supabase lalu menyiapkan ringkasan, grafik, atau file export.
    try {
      const pFormat = new Intl.DateTimeFormat('id-ID', { month: 'long', year: 'numeric' });
      const p = `${pFormat.format(new Date(periodFrom))} - ${pFormat.format(new Date(periodTo))}`;

      let data: any[] = [];
      let cols: any[] = [];
      let title = "";

      // Kondisi if (type === 'transaksi') membuat isi blok if di bawahnya hanya berjalan saat kondisi itu benar di halaman laporan.
      if (type === 'transaksi') {
        title = "Laporan Transaksi";
        cols = [
          { header: 'Tanggal', key: 'date', width: 12, isDate: true },
          { header: 'Jenis', key: 'type', width: 15 },
          { header: 'Keterangan', key: 'description', width: 35 },
          { header: 'Kategori', key: 'category', width: 15 },
          { header: 'Nominal', key: 'amount', isCurrency: true, width: 20 },
        ];
        // map ini membuat satu output untuk setiap item daftar yang sedang dirender oleh halaman laporan.
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
        // map ini membuat satu output untuk setiap item daftar yang sedang dirender oleh halaman laporan.
        data = rawTransactions.map(t => {
          // Kondisi if (t.type === 'income') runningBalance += t.amount; membuat isi blok if di bawahnya hanya berjalan saat kondisi itu benar di halaman laporan.
          if (t.type === 'income') runningBalance += t.amount;
          // Kondisi else runningBalance -= t.amount; membuat isi blok if di bawahnya hanya berjalan saat kondisi itu benar di halaman laporan.
          else runningBalance -= t.amount;

          // handleExport mengirim hasil akhir yang dibutuhkan oleh bagian kode yang memanggilnya.
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
        // filter ini menyisakan data halaman laporan yang cocok dengan pencarian, status, role, atau tanggal aktif.
        rawTransactions.filter(t => t.type === 'income').forEach(t => {
          pendapatanGroup[t.category] = (pendapatanGroup[t.category] || 0) + t.amount;
        });

        // Group by category for Pengeluaran
        const pengeluaranGroup: Record<string, number> = {};
        // filter ini menyisakan data halaman laporan yang cocok dengan pencarian, status, role, atau tanggal aktif.
        rawTransactions.filter(t => t.type === 'expense').forEach(t => {
          pengeluaranGroup[t.category] = (pengeluaranGroup[t.category] || 0) + t.amount;
        });

        // map ini membuat satu output untuk setiap item daftar yang sedang dirender oleh halaman laporan.
        const incomeItems = Object.keys(pendapatanGroup).map(k => ({
          keterangan: k,
          total: pendapatanGroup[k]
        }));

        // map ini membuat satu output untuk setiap item daftar yang sedang dirender oleh halaman laporan.
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

      // Kondisi if (format === 'pdf') membuat isi blok if di bawahnya hanya berjalan saat kondisi itu benar di halaman laporan.
      if (format === 'pdf') {
        exportToPDF(data, cols, title, `${title.replace(/\s/g, '_')}_${periodFrom}_${periodTo}`, companyName, p, type === 'labarugi');
      } else {
        exportToExcel(data, cols, `${title.replace(/\s/g, '_')}_${periodFrom}_${periodTo}`, type === 'labarugi');
      }

      toast.success("Ekspor Selesai", {
        description: `${title} berhasil diunduh dalam format ${format.toUpperCase()}.`,
      });

      // Kalau data user tersedia, lanjutkan proses yang membutuhkan akun login.
      if (user) {
        // await menunggu proses async selesai sebelum kode ini melanjutkan langkah berikutnya.
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

  // handleExport menampilkan UI untuk halaman laporan yang menghitung pendapatan, pengeluaran, laba, dan export.
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
            Ekspor seluruh transaksi, dan buku besar untuk periode yang dipilih dalam format PDF yang rapi atau Excel untuk analisis lebih lanjut.
          </p>
        </div>

        <div className={`grid grid-cols-1 ${SHOW_LABA_RUGI ? 'md:grid-cols-3' : 'md:grid-cols-2'} gap-6`}>
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
          {SHOW_LABA_RUGI && (
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
          )}
        </div>
      </div>
    </div>
  );
}
