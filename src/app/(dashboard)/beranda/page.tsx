"use client";

// Import React hook yang dipakai halaman beranda yang menampilkan ringkasan keuangan dan aktivitas terbaru, misalnya untuk state, efek setelah render, atau referensi elemen.
import React, { useEffect, useState } from "react";
// Import ikon yang dipakai halaman beranda yang menampilkan ringkasan keuangan dan aktivitas terbaru untuk memperjelas tombol, menu, status, dan aksi di layar.
import { DocumentDownloadIcon, StatusUpIcon, ArrowDownIcon, WalletIcon, DocumentIcon, ArrowUpRightIcon, CloseIcon, ChartIcon, SettingsIcon, CalenderIcon } from "@astraicons/react/bold";
// Import komponen UI reusable supaya halaman beranda yang menampilkan ringkasan keuangan dan aktivitas terbaru memakai tampilan tombol, modal, input, atau tabel yang konsisten.
import { CustomSelect } from "@/components/ui/CustomSelect";
// Import komponen UI reusable supaya halaman beranda yang menampilkan ringkasan keuangan dan aktivitas terbaru memakai tampilan tombol, modal, input, atau tabel yang konsisten.
import { ChartWrapper } from "@/components/ui/ChartWrapper";
// Import komponen UI reusable supaya halaman beranda yang menampilkan ringkasan keuangan dan aktivitas terbaru memakai tampilan tombol, modal, input, atau tabel yang konsisten.
import { Modal } from "@/components/ui/Modal";
// Import authStore supaya halaman beranda yang menampilkan ringkasan keuangan dan aktivitas terbaru bisa membaca user login, role, nama tampilan, atau mengosongkan session saat logout.
import { useAuthStore } from "@/store/authStore";
// Import helper database yang dipakai halaman beranda yang menampilkan ringkasan keuangan dan aktivitas terbaru untuk mengambil atau menyimpan data Supabase.
import { getDashboardSummary } from "@/lib/db";
// Import berikutnya mengambil komponen/helper yang langsung dipakai oleh halaman beranda.
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell
} from "recharts";
// Import helper database yang dipakai halaman beranda yang menampilkan ringkasan keuangan dan aktivitas terbaru untuk mengambil atau menyimpan data Supabase.
import { getDashboardChartData, getTopClientsStats, getRecentActivities, getDashboardYearlyData } from "@/lib/db";

// formatCompactCurrency mengubah data mentah menjadi teks yang mudah dibaca user di halaman beranda yang menampilkan ringkasan keuangan dan aktivitas terbaru.
const formatCompactCurrency = (value: number) => {
  const absValue = Math.abs(value);
  const sign = value < 0 ? "-" : "";
  
  // Kondisi if (absValue >= 1000000) membuat isi blok if di bawahnya hanya berjalan saat kondisi itu benar di halaman beranda.
  if (absValue >= 1000000000) {
    return `${sign}${(absValue / 1000000000).toLocaleString('id-ID', { maximumFractionDigits: 1 })} Miliyar`;
  } else if (absValue >= 1000000) {
    return `${sign}${(absValue / 1000000).toLocaleString('id-ID', { maximumFractionDigits: 1 })} Juta`;
  } else if (absValue >= 1000) {
    return `${sign}${(absValue / 1000).toLocaleString('id-ID', { maximumFractionDigits: 1 })} k`;
  }
  // sign mengembalikan hasil untuk halaman beranda, sesuai data yang dihitung tepat sebelum baris return ini.
  return `${sign}${absValue.toLocaleString('id-ID')}`;
};

// Tooltip Components
const CustomTooltip = ({ active, payload, label, hideHeader }: any) => {
  // Kondisi ini mengecek jumlah item agar daftar kosong, pagination, atau total bisa ditangani dengan benar.
  if (active && payload && payload.length) {
    // formatCompactCurrency menampilkan UI untuk halaman beranda yang menampilkan ringkasan keuangan dan aktivitas terbaru.
    return (
      <div className="bg-white p-3 px-4 border border-gray-100 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.12)]">
        {!hideHeader && label && <p className="font-bold text-[#151D48] mb-2 border-b border-gray-50 pb-1.5">{label}</p>}
        <div className="space-y-1.5">
          {/* map ini membuat satu output untuk setiap item daftar yang sedang dirender oleh halaman beranda. */}
          {payload.map((entry: any, index: number) => {
            // Mapping label names to be more readable
            const displayName = entry.name === 'current' || entry.name === 'laba' ? 'Laba Bersih' 
              : entry.name === 'last' ? 'Laba (Bulan Lalu)' 
              : entry.name;
            
            // formatCompactCurrency menampilkan UI untuk halaman beranda yang menampilkan ringkasan keuangan dan aktivitas terbaru.
            return (
              <div key={index} className="flex items-center justify-between gap-6 text-sm">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: entry.color }}></span>
                  <span className="text-gray-500 capitalize">{displayName}</span>
                </div>
                <span className="font-bold text-[#151D48]">
                  Rp {formatCompactCurrency(entry.value)}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    );
  }
  // displayName berhenti di sini karena syarat lanjut belum terpenuhi.
  return null;
};

// CustomPieTooltip adalah komponen React; komponen ini menghasilkan bagian tampilan yang bisa dipakai di halaman.
const CustomPieTooltip = ({ active, payload }: any) => {
  // Kondisi ini mengecek jumlah item agar daftar kosong, pagination, atau total bisa ditangani dengan benar.
  if (active && payload && payload.length) {
    // formatCompactCurrency menampilkan UI untuk halaman beranda yang menampilkan ringkasan keuangan dan aktivitas terbaru.
    return (
      <div className="bg-white p-3 border border-gray-100 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.12)]">
        <div className="flex items-center justify-between gap-4 text-sm">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full" style={{ backgroundColor: payload[0].payload.color }}></span>
            <span className="font-bold text-[#151D48]">{payload[0].name}</span>
          </div>
          <span className="font-semibold text-gray-500 bg-gray-50 px-2 py-0.5 rounded-md">{payload[0].value} Invoice</span>
        </div>
      </div>
    );
  }
  // CustomPieTooltip berhenti di sini karena syarat lanjut belum terpenuhi.
  return null;
};

// DashboardPage mengambil data ringkasan keuangan lalu menampilkannya sebagai kartu, grafik, aktivitas, dan daftar invoice.
export default function DashboardPage() {
  // renderComparison membuat label naik/turun dari persentase perubahan KPI di beranda.
  const renderComparison = (current: number, previous: number) => {
    // Kondisi if (previous === 0) membuat isi blok if di bawahnya hanya berjalan saat kondisi itu benar di halaman beranda.
    if (previous === 0) {
      // Kondisi if (current > 0) return <span className="text-[#76c893] font-semibold">+100% vs bulan lalu</span>; membuat isi blok if di bawahnya hanya berjalan saat kondisi itu benar di halaman beranda.
      if (current > 0) return <span className="text-[#76c893] font-semibold">+100% vs bulan lalu</span>;
      // DashboardPage menampilkan potongan UI yang dipakai di halaman beranda yang menampilkan ringkasan keuangan dan aktivitas terbaru.
      return <span className="text-gray-400 font-medium">0% vs bulan lalu</span>;
    }
    const diff = current - previous;
    // Bagian percent menyimpan logika yang dipakai di bawahnya.
    const percent = (diff / previous) * 100;
    const sign = percent > 0 ? "+" : "";
    const color = percent > 0 ? "text-[#76c893] font-semibold" : percent < 0 ? "text-[#f08a5d] font-semibold" : "text-gray-400 font-medium";
    // DashboardPage menampilkan potongan UI yang dipakai di halaman beranda yang menampilkan ringkasan keuangan dan aktivitas terbaru.
    return <span className={color}>{sign}{percent.toFixed(1)}% vs bulan lalu</span>;
  };

  // greeting menyimpan nilai greeting yang berubah saat user berinteraksi dengan halaman beranda yang menampilkan ringkasan keuangan dan aktivitas terbaru.
  const [greeting, setGreeting] = useState("Selamat Pagi");
  // isAktivitasModalOpen menyimpan nilai is aktivitas modal open yang berubah saat user berinteraksi dengan halaman beranda yang menampilkan ringkasan keuangan dan aktivitas terbaru.
  const [isAktivitasModalOpen, setIsAktivitasModalOpen] = useState(false);
  const [summary, setSummary] = useState<any>(null);
  const [chartData, setChartData] = useState<any[]>([]);
  const [topClients, setTopClients] = useState<any[]>([]);
  const [aktivitasTerbaru, setAktivitasTerbaru] = useState<any[]>([]);
  const [invoiceDonutData, setInvoiceDonutData] = useState<any[]>([]);
  const [yearlyData, setYearlyData] = useState<any[]>([]);

  // Period filter states
  const [selectedPeriod, setSelectedPeriod] = useState<string>("");
  const [loadedPeriod, setLoadedPeriod] = useState<string>("");
  const [periodOptions, setPeriodOptions] = useState<{ value: string, label: string }[]>([]);
  // isLoading menandai proses sedang berjalan supaya tombol bisa dibuat disabled atau layar loading muncul.
  const [isLoading, setIsLoading] = useState(true);

  const getDisplayName = useAuthStore((state) => state.getDisplayName);
  const displayName = getDisplayName();

  // Set greeting based on time of day
  useEffect(() => {
    const hour = new Date().getHours();
    // Kalau jam lokal masih pagi, sapaan dashboard/navbar diatur ke Selamat Pagi.
    if (hour >= 5 && hour < 12) setGreeting("Selamat Pagi");
    // Kalau jam lokal masuk siang, sapaan dashboard/navbar diatur ke Selamat Siang.
    else if (hour >= 12 && hour < 15) setGreeting("Selamat Siang");
    // Kalau jam lokal masuk sore, sapaan dashboard/navbar diatur ke Selamat Sore.
    else if (hour >= 15 && hour < 19) setGreeting("Selamat Sore");
    // Kondisi else setGreeting("Selamat Malam"); membuat isi blok if di bawahnya hanya berjalan saat kondisi itu benar di halaman beranda.
    else setGreeting("Selamat Malam");
  }, []);

  // Initialize selected period and available period options
  useEffect(() => {
    // initializePeriod memilih periode default dashboard berdasarkan tanggal hari ini.
    const initializePeriod = async () => {
      // await menunggu respons Supabase selesai sebelum kode memakai data atau error yang dikembalikan.
      const { createClient } = await import('@/utils/supabase/client');
      const supabase = createClient();
      const now = new Date();
      const currentYear = now.getFullYear();
      const currentMonth = now.getMonth() + 1;

      let defaultYear = currentYear;
      let defaultMonth = currentMonth;

      // try ini mengambil ringkasan dashboard, grafik, aktivitas terbaru, dan invoice belum bayar dari Supabase.
      try {
        // Query oldest transaction date to establish start bounds for filter dropdown
        const [oldestIncome, oldestExpense] = await Promise.all([
          supabase.from('income').select('date').order('date', { ascending: true }).limit(1),
          supabase.from('expense').select('date').order('date', { ascending: true }).limit(1)
        ]);

        const oldestIncomeDate = oldestIncome.data?.[0]?.date;
        const oldestExpenseDate = oldestExpense.data?.[0]?.date;
        let oldestDate = null;
        // Kondisi if (oldestIncomeDate && oldestExpenseDate) membuat isi blok if di bawahnya hanya berjalan saat kondisi itu benar di halaman beranda.
        if (oldestIncomeDate && oldestExpenseDate) {
          oldestDate = oldestIncomeDate < oldestExpenseDate ? oldestIncomeDate : oldestExpenseDate;
        } else if (oldestIncomeDate) {
          oldestDate = oldestIncomeDate;
        } else if (oldestExpenseDate) {
          oldestDate = oldestExpenseDate;
        }

        let startYear = currentYear;
        let startMonth = currentMonth;
        // Kondisi if (oldestDate) membuat isi blok if di bawahnya hanya berjalan saat kondisi itu benar di halaman beranda.
        if (oldestDate) {
          // map ini membuat satu output untuk setiap item daftar yang sedang dirender oleh halaman beranda.
          const [y, m] = oldestDate.split('-').map(Number);
          startYear = y;
          startMonth = m;
        }

        // Generate options array in Indonesian format from oldest month to current month
        const options = [];
        const monthNames = [
          "Januari", "Februari", "Maret", "April", "Mei", "Juni",
          "Juli", "Agustus", "September", "Oktober", "November", "Desember"
        ];

        let loopYear = startYear;
        let loopMonth = startMonth;

        while (
          loopYear < currentYear || 
          (loopYear === currentYear && loopMonth <= currentMonth)
        ) {
          options.push({
            value: `${loopYear}-${loopMonth}`,
            label: `${monthNames[loopMonth - 1]} ${loopYear}`
          });
          loopMonth++;
          // Kondisi if (loopMonth > 12) membuat isi blok if di bawahnya hanya berjalan saat kondisi itu benar di halaman beranda.
          if (loopMonth > 12) {
            loopMonth = 1;
            loopYear++;
          }
        }

        options.reverse(); // Reverse chronology for premium UI feel
        setPeriodOptions(options);
        setSelectedPeriod(`${defaultYear}-${defaultMonth}`);
        setIsLoading(false);
      } catch (err) {
        console.error("Error initializing dashboard period:", err);
        setSelectedPeriod(`${currentYear}-${currentMonth}`);
        setPeriodOptions([{ value: `${currentYear}-${currentMonth}`, label: `Mei ${currentYear}` }]);
        setIsLoading(false);
      }
    };

    initializePeriod();
  }, []);

  // Fetch dashboard data when active period selection changes
  useEffect(() => {
    // Kondisi if (!selectedPeriod) return; membuat isi blok if di bawahnya hanya berjalan saat kondisi itu benar di halaman beranda.
    if (!selectedPeriod) return;

    // map ini membuat satu output untuk setiap item daftar yang sedang dirender oleh halaman beranda.
    const [year, month] = selectedPeriod.split('-').map(Number);

    // loadData mengambil data yang dibutuhkan halaman beranda yang menampilkan ringkasan keuangan dan aktivitas terbaru dari Supabase lalu mengisi state halaman.
    const loadData = async () => {
      // await Promise.all menunggu beberapa query berjalan paralel sampai semuanya selesai.
      const [data, cData, clients, activities, yData] = await Promise.all([
        getDashboardSummary(year, month),
        getDashboardChartData(year, month),
        getTopClientsStats(4),
        getRecentActivities(6),
        getDashboardYearlyData(year)
      ]);

      console.log('[DEBUG] Dashboard filter loaded: year=', year, 'month=', month);
      console.log('[DEBUG] Summary result:', data);

      setSummary(data);
      setChartData(cData);
      setYearlyData(yData);
      
      // map ini membuat opsi/baris customer dari data clients yang sudah diambil dari Supabase.
      setTopClients(clients.map((c, i) => ({
        id: String(i + 1).padStart(2, '0'),
        name: c.name,
        percent: c.percent,
        color: c.color
      })));

      // map ini membuat satu baris aktivitas terbaru untuk kartu dashboard.
      setAktivitasTerbaru(activities.map(act => ({
        id: act.id,
        title: act.title,
        desc: act.desc,
        time: act.date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' }),
        type: act.type
      })));

      // Kondisi if (data) membuat isi blok if di bawahnya hanya berjalan saat kondisi itu benar di halaman beranda.
      if (data) {
        setInvoiceDonutData([
          { name: 'Lunas', value: data.paidInvoices, color: '#76c893' },
          { name: 'Belum', value: data.unpaidInvoices, color: '#ffd166' },
          { name: 'Jatuh T.', value: data.overdueInvoices, color: '#f08a5d' },
        ]);
      }
      setLoadedPeriod(selectedPeriod);
    };

    loadData();
  }, [selectedPeriod]);

  // loadData menampilkan UI untuk halaman beranda yang menampilkan ringkasan keuangan dan aktivitas terbaru.
  return (
    <div className="space-y-6">
      
      {/* Top Greeting & Period Filter */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8 pt-2 sm:pt-0">
        <div>
          <h1 className="text-2xl font-bold text-[#151D48] mb-1">
            {greeting}, {displayName}! 🌤️
          </h1>
          <p className="text-sm text-gray-500">
            {summary ? (
              summary.overdueInvoices > 0
                ? `Ada ${summary.overdueInvoices} invoice jatuh tempo yang perlu perhatian Anda segera ⚠️`
                : summary.unpaidInvoices > 0
                ? `Ada ${summary.unpaidInvoices} invoice yang belum dibayar menunggu pelunasan ⏳`
                : summary.totalInvoices > 0
                ? `Kerja bagus! Semua ${summary.paidInvoices} invoice telah lunas dibayar ✅`
                : "Belum ada invoice. Mulai catat pendapatan atau buat invoice baru 🚀"
            ) : (
              "Memuat ringkasan data..."
            )}
          </p>
        </div>

        {/* Period Filter Dropdown */}
        <div className="w-full md:w-52 shrink-0 relative z-20">
          <CalenderIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted pointer-events-none z-10" />
          <CustomSelect
            options={periodOptions}
            value={selectedPeriod}
            onChange={setSelectedPeriod}
            triggerClassName="pl-10 font-semibold text-[#151D48]"
          />
        </div>
      </div>

      {/* Top Row: Ringkasan */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Ringkasan Keuangan */}
        <div className="bg-white rounded-2xl p-6 lg:col-span-12">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-lg font-bold text-[#151D48]">Ringkasan Keuangan</h2>
              <p className="text-sm text-gray-500">
                {periodOptions.find(opt => opt.value === selectedPeriod)?.label || "Bulan Ini"}
              </p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            {/* Card 1: Pendapatan Bulan Ini */}
            <div className="bg-[#76c893]/10 rounded-xl p-4">
              <div className="w-10 h-10 rounded-full bg-[#76c893] text-white flex items-center justify-center mb-4">
                <StatusUpIcon className="w-5 h-5" />
              </div>
              <h3 className="text-2xl font-bold text-[#1E293B] mb-1">
                {summary ? `Rp ${formatCompactCurrency(summary.totalIncomeMonth)}` : "..."}
              </h3>
              <p className="text-sm font-medium text-[#1E293B] mb-2 leading-tight">Pendapatan<br/>Bulan Ini</p>
              <p className="text-xs mt-auto">
                {summary ? renderComparison(summary.totalIncomeMonth, summary.prevMonthIncomeMTD) : "..."}
              </p>
            </div>

            {/* Card 2: Pengeluaran Bulan Ini */}
            <div className="bg-[#f08a5d]/10 rounded-xl p-4 flex flex-col">
              <div className="w-10 h-10 rounded-full bg-[#f08a5d] text-white flex items-center justify-center mb-4">
                <ArrowDownIcon className="w-5 h-5" />
              </div>
              <h3 className="text-2xl font-bold text-[#1E293B] mb-1">
                {summary ? `Rp ${formatCompactCurrency(summary.totalExpenseMonth)}` : "..."}
              </h3>
              <p className="text-sm font-medium text-[#1E293B] mb-2 leading-tight">Pengeluaran<br/>Bulan Ini</p>
              <p className="text-xs mt-auto">
                {summary ? renderComparison(summary.totalExpenseMonth, summary.prevMonthExpenseMTD) : "..."}
              </p>
            </div>
            
            {/* Card 3: Saldo Saat Ini */}
            <div className="bg-[#7983ff]/10 rounded-xl p-4 flex flex-col">
              <div className="w-10 h-10 rounded-full bg-[#7983ff] text-white flex items-center justify-center mb-4">
                <WalletIcon className="w-5 h-5" />
              </div>
              <h3 className="text-2xl font-bold text-[#1E293B] mb-1">
                {summary ? `Rp ${formatCompactCurrency(summary.netProfit)}` : "..."}
              </h3>
              <p className="text-sm font-medium text-[#1E293B] mb-2 leading-tight">Saldo Saat Ini<br/>(Total)</p>
            </div>
            
            {/* Card 4: Invoice Belum Bayar */}
            <div className="bg-[#ffd166]/10 rounded-xl p-4 flex flex-col">
              <div className="w-10 h-10 rounded-full bg-[#ffd166] text-white flex items-center justify-center mb-4">
                <DocumentIcon className="w-5 h-5" />
              </div>
              <h3 className="text-2xl font-bold text-[#1E293B] mb-1">
                {summary ? (summary.unpaidInvoices + summary.overdueInvoices) : "..."}
              </h3>
              <p className="text-sm font-medium text-[#1E293B] mb-2 leading-tight">Invoice<br/>Belum Bayar</p>
              <p className="text-xs text-[#ffd166] mt-auto">
                {summary ? `Rp ${formatCompactCurrency(summary.totalPiutang)}` : "..."}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Middle Row: Tren Pendapatan, Tren Pengeluaran, Status Invoice */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Tren Pendapatan */}
        <div className="bg-white rounded-2xl p-6 lg:col-span-1 flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-bold text-[#151D48] flex items-center gap-2">
              <ChartIcon className="w-5 h-5 text-[#3CD856]" />
              Tren Pendapatan
            </h2>
          </div>
          <ChartWrapper height={210}>
            <ResponsiveContainer width="100%" height={210}>
              <LineChart key={`pendapatan-${JSON.stringify(chartData.map(d => d.pendapatan))}`} data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#9CA3AF' }} minTickGap={30} interval="equidistantPreserveStart" />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#9CA3AF' }} tickFormatter={(value) => formatCompactCurrency(value)} width={55} />
                <Tooltip 
                  cursor={{ stroke: '#F3F4F6', strokeWidth: 1 }}
                  content={<CustomTooltip />}
                />
                <Line type="monotone" dataKey="pendapatan" stroke="#76c893" strokeWidth={3} dot={false} activeDot={{ r: 6 }} animationDuration={800} animationEasing="ease-out" />
              </LineChart>
            </ResponsiveContainer>
          </ChartWrapper>
          <div className="flex justify-between items-center pt-4 border-t border-gray-100 mt-auto">
            <div className="text-sm">
              <span className="text-gray-500">Total Bulan Ini:</span>{" "}
              <span className="font-bold text-[#151D48] tabular-nums">
                Rp {formatCompactCurrency(chartData.reduce((sum, item) => sum + (item.pendapatan || 0), 0))}
              </span>
            </div>
          </div>
        </div>

        {/* Tren Pengeluaran */}
        <div className="bg-white rounded-2xl p-6 lg:col-span-1 flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-bold text-[#151D48] flex items-center gap-2">
              <ChartIcon className="w-5 h-5 text-[#f08a5d]" />
              Tren Pengeluaran
            </h2>
          </div>
          <ChartWrapper height={210}>
            <ResponsiveContainer width="100%" height={210}>
              <LineChart key={`pengeluaran-${JSON.stringify(chartData.map(d => d.pengeluaran))}`} data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#9CA3AF' }} minTickGap={30} interval="equidistantPreserveStart" />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#9CA3AF' }} tickFormatter={(value) => formatCompactCurrency(value)} width={55} />
                <Tooltip 
                  cursor={{ stroke: '#F3F4F6', strokeWidth: 1 }}
                  content={<CustomTooltip />}
                />
                <Line type="monotone" dataKey="pengeluaran" stroke="#f08a5d" strokeWidth={3} dot={false} activeDot={{ r: 6 }} animationDuration={800} animationEasing="ease-out" />
              </LineChart>
            </ResponsiveContainer>
          </ChartWrapper>
          <div className="flex justify-between items-center pt-4 border-t border-gray-100 mt-auto">
            <div className="text-sm">
              <span className="text-gray-500">Total Bulan Ini:</span>{" "}
              <span className="font-bold text-[#151D48] tabular-nums">
                Rp {formatCompactCurrency(chartData.reduce((sum, item) => sum + (item.pengeluaran || 0), 0))}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 lg:col-span-1">
          <h2 className="text-lg font-bold text-[#151D48] mb-4">Status Pembayaran Invoice</h2>
          <ChartWrapper height={180}>
            <div className="relative h-[180px] mt-2">
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none z-0">
                <span className="text-2xl font-bold text-[#151D48] leading-none mb-1">
                  {summary ? summary.totalInvoices : 0}
                </span>
                <span className="text-[10px] text-gray-500 uppercase tracking-wider">Total Invoice</span>
              </div>
              <ResponsiveContainer width="100%" height="100%" className="relative z-10">
                <PieChart>
                  <Pie
                    data={invoiceDonutData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={2}
                    dataKey="value"
                    stroke="none"
                  >
                    {/* map ini membuat satu output untuk setiap item daftar yang sedang dirender oleh halaman beranda. */}
                    {invoiceDonutData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    content={<CustomPieTooltip />}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </ChartWrapper>
          <div className="grid grid-cols-3 gap-2 mt-4 text-xs text-center">
            <div>
              <div className="flex items-center justify-center gap-1 text-gray-500 mb-1">
                <span className="w-2 h-2 rounded-full bg-[#76c893]"></span> Lunas
              </div>
              <p className="font-bold text-[#1E293B]">{summary ? summary.paidInvoices : 0}</p>
            </div>
            <div>
              <div className="flex items-center justify-center gap-1 text-gray-500 mb-1">
                <span className="w-2 h-2 rounded-full bg-[#ffd166]"></span> Belum
              </div>
              <p className="font-bold text-[#1E293B]">{summary ? summary.unpaidInvoices : 0}</p>
            </div>
            <div>
              <div className="flex items-center justify-center gap-1 text-gray-500 mb-1">
                <span className="w-2 h-2 rounded-full bg-[#f08a5d]"></span> Jatuh T.
              </div>
              <p className="font-bold text-[#1E293B]">{summary ? summary.overdueInvoices : 0}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Row: Customer Teratas, Aktivitas Terbaru */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Customer Teratas */}
        <div className="bg-white rounded-2xl p-6">
          <h2 className="text-lg font-bold text-[#151D48] mb-6">Customer Teratas</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-xs text-gray-400 border-b border-gray-100">
                <tr>
                  <th className="font-normal text-left pb-3 w-8">#</th>
                  <th className="font-normal text-left pb-3">Nama Customer</th>
                  <th className="font-normal text-left pb-3">Kontribusi</th>
                  <th className="font-normal text-right pb-3">Persentase</th>
                </tr>
              </thead>
              <tbody>
                {/* map ini membuat satu output untuk setiap item daftar yang sedang dirender oleh halaman beranda. */}
                {topClients.map((client) => (
                  <tr key={client.id} className="border-b border-gray-50 last:border-0">
                    <td className="py-4 text-gray-500">{client.id}</td>
                    <td className="py-4 text-[#151D48] font-medium">{client.name}</td>
                    <td className="py-4 w-32">
                      <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full rounded-full animate-pulse-slow" style={{ width: `${client.percent}%`, backgroundColor: client.color }}></div>
                      </div>
                    </td>
                    <td className="py-4 text-right">
                      <span className="px-2 py-1 rounded-xl border text-xs font-bold" style={{
                        borderColor: client.color,
                        color: client.color,
                        backgroundColor: `${client.color}1A` // 1A is hex for 10% alpha opacity
                      }}>
                        {client.percent}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Aktivitas Terbaru */}
        <div className="bg-white rounded-2xl p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-bold text-[#151D48]">Aktivitas Terbaru</h2>
            <button 
              onClick={() => setIsAktivitasModalOpen(true)}
              className="text-xs font-semibold text-[#5C67F2] bg-[#5C67F2]/10 hover:bg-[#5C67F2]/20 px-3 py-1.5 rounded-lg transition-colors"
            >
              Lihat Semua
            </button>
          </div>
          
          <div className="space-y-6">
            {/* map ini membuat satu output untuk setiap item daftar yang sedang dirender oleh halaman beranda. */}
            {aktivitasTerbaru.map((activity, idx) => (
              <div key={activity.id} className="flex gap-4 relative">
                {/* Timeline Line */}
                {idx !== aktivitasTerbaru.length - 1 && (
                  <div className="absolute left-5 top-10 bottom-[-24px] w-0.5 bg-gray-100"></div>
                )}
                
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 z-10 ${
                  activity.type === 'income' ? 'bg-[#76c893]/10 text-[#76c893]' :
                  activity.type === 'expense' ? 'bg-[#f08a5d]/10 text-[#f08a5d]' :
                  activity.type === 'system' ? 'bg-[#FF9F43]/10 text-[#FF9F43]' :
                  activity.type === 'reminder' ? 'bg-[#FF9F43]/10 text-[#FF9F43]' :
                  'bg-[#7983ff]/10 text-[#7983ff]'
                }`}>
                  {activity.type === 'income' ? <ArrowUpRightIcon className="w-[18px] h-[18px]" /> : 
                   activity.type === 'expense' ? <ArrowDownIcon className="w-[18px] h-[18px]" /> : 
                   activity.type === 'system' ? <SettingsIcon className="w-[18px] h-[18px]" /> :
                   activity.type === 'reminder' ? <CalenderIcon className="w-[18px] h-[18px]" /> :
                   <DocumentIcon className="w-[18px] h-[18px]" />}
                </div>
                
                <div className="flex-1 pb-1">
                  <div className="flex justify-between items-start mb-1">
                    <h4 className="font-semibold text-[#151D48] text-sm">{activity.title}</h4>
                    <span className="text-xs text-gray-500 whitespace-nowrap ml-2">{activity.time}</span>
                  </div>
                  <p className="text-sm text-gray-500">{activity.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      <Modal isOpen={isAktivitasModalOpen} onClose={() => setIsAktivitasModalOpen(false)}>
        <div className="bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
          <div className="flex items-center justify-between p-6 border-b border-gray-100 shrink-0">
            <div>
              <h2 className="text-xl font-bold text-[#151D48]">Semua Aktivitas Terbaru</h2>
              <p className="text-sm text-gray-500 mt-1">Riwayat lengkap transaksi dan aktivitas sistem.</p>
            </div>
            <button 
              onClick={() => setIsAktivitasModalOpen(false)}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <CloseIcon className="w-5 h-5 text-gray-500" />
            </button>
          </div>
          
          <div className="overflow-y-auto flex-1">
            <div className="p-6 space-y-6">
              {/* map ini membuat satu output untuk setiap item daftar yang sedang dirender oleh halaman beranda. */}
              {aktivitasTerbaru.map((activity, idx, arr) => (
                <div key={`${activity.id}-${idx}`} className="flex gap-4 relative">
                  {idx !== arr.length - 1 && (
                    <div className="absolute left-5 top-10 bottom-[-24px] w-0.5 bg-gray-100"></div>
                  )}
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 z-10 ${
                    activity.type === 'income' ? 'bg-[#76c893]/10 text-[#76c893]' :
                    activity.type === 'expense' ? 'bg-[#f08a5d]/10 text-[#f08a5d]' :
                    activity.type === 'system' ? 'bg-[#FF9F43]/10 text-[#FF9F43]' :
                    activity.type === 'reminder' ? 'bg-[#FF9F43]/10 text-[#FF9F43]' :
                    'bg-[#7983ff]/10 text-[#7983ff]'
                  }`}>
                    {activity.type === 'income' ? <ArrowUpRightIcon className="w-[18px] h-[18px]" /> : 
                     activity.type === 'expense' ? <ArrowDownIcon className="w-[18px] h-[18px]" /> : 
                     activity.type === 'system' ? <SettingsIcon className="w-[18px] h-[18px]" /> :
                     activity.type === 'reminder' ? <CalenderIcon className="w-[18px] h-[18px]" /> :
                     <DocumentIcon className="w-[18px] h-[18px]" />}
                  </div>
                  <div className="flex-1 pb-1">
                    <div className="flex justify-between items-start mb-1">
                      <h4 className="font-semibold text-[#151D48] text-sm">{activity.title}</h4>
                      <span className="text-xs text-gray-500 whitespace-nowrap ml-2">{activity.time}</span>
                    </div>
                    <p className="text-sm text-gray-500">{activity.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
}
