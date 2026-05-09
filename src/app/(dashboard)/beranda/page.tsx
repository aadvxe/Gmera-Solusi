"use client";

import React, { useEffect, useState } from "react";
import { DocumentDownloadIcon, StatusUpIcon, ArrowDownIcon, WalletIcon, DocumentIcon, ArrowUpRightIcon, CloseIcon, ChartIcon, SettingsIcon, CalenderIcon } from "@astraicons/react/bold";
import { CustomSelect } from "@/components/ui/CustomSelect";
import { ChartWrapper } from "@/components/ui/ChartWrapper";
import { Modal } from "@/components/ui/Modal";
import { useAuthStore } from "@/store/authStore";
import { getDashboardSummary } from "@/lib/db";
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
import { getDashboardChartData, getTopClientsStats, getRecentActivities } from "@/lib/db";

const formatCompactCurrency = (value: number) => {
  const absValue = Math.abs(value);
  const sign = value < 0 ? "-" : "";
  
  if (absValue >= 1000000) {
    return `${sign}${(absValue / 1000000).toLocaleString('id-ID', { maximumFractionDigits: 1 })} Jt`;
  } else if (absValue >= 1000) {
    return `${sign}${(absValue / 1000).toLocaleString('id-ID', { maximumFractionDigits: 1 })} k`;
  }
  return `${sign}${absValue.toLocaleString('id-ID')}`;
};

// Tooltip Components
const CustomTooltip = ({ active, payload, label, hideHeader }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-3 px-4 border border-gray-100 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.12)]">
        {!hideHeader && label && <p className="font-bold text-[#151D48] mb-2 border-b border-gray-50 pb-1.5">{label}</p>}
        <div className="space-y-1.5">
          {payload.map((entry: any, index: number) => {
            // Mapping label names to be more readable
            const displayName = entry.name === 'current' || entry.name === 'laba' ? 'Laba Bersih' 
              : entry.name === 'last' ? 'Laba (Bulan Lalu)' 
              : entry.name;
            
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
  return null;
};

const CustomPieTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
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
  return null;
};

export default function DashboardPage() {
  const [greeting, setGreeting] = useState("Selamat Pagi");
  const [periodeKas, setPeriodeKas] = useState("Bulan Ini");
  const [isAktivitasModalOpen, setIsAktivitasModalOpen] = useState(false);
  const [summary, setSummary] = useState<any>(null);
  const [chartData, setChartData] = useState<any[]>([]);
  const [topClients, setTopClients] = useState<any[]>([]);
  const [aktivitasTerbaru, setAktivitasTerbaru] = useState<any[]>([]);
  const [invoiceDonutData, setInvoiceDonutData] = useState<any[]>([]);

  const getDisplayName = useAuthStore((state) => state.getDisplayName);
  const displayName = getDisplayName();

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) setGreeting("Selamat Pagi");
    else if (hour >= 12 && hour < 15) setGreeting("Selamat Siang");
    else if (hour >= 15 && hour < 19) setGreeting("Selamat Sore");
    else setGreeting("Selamat Malam");

    const loadData = async () => {
      const now = new Date();
      const year = now.getFullYear();
      const month = now.getMonth() + 1;

      const [data, cData, clients, activities] = await Promise.all([
        getDashboardSummary(),
        getDashboardChartData(year, month),
        getTopClientsStats(4),
        getRecentActivities(6)
      ]);
      
      setSummary(data);
      setChartData(cData);
      
      // Calculate percentages for top clients based on total of all top clients
      const totalTopClientsValue = clients.reduce((acc, c) => acc + c.total, 0);
      setTopClients(clients.map((c, i) => ({
        id: String(i + 1).padStart(2, '0'),
        name: c.name,
        percent: totalTopClientsValue ? Math.round((c.total / totalTopClientsValue) * 100) : 0,
        color: c.color
      })));

      setAktivitasTerbaru(activities.map(act => ({
        id: act.id,
        title: act.title,
        desc: act.desc,
        time: act.date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' }),
        type: act.type
      })));

      if (data) {
        setInvoiceDonutData([
          { name: 'Lunas', value: data.paidInvoices, color: '#76c893' },
          { name: 'Belum', value: data.unpaidInvoices, color: '#ffd166' },
          { name: 'Jatuh T.', value: data.overdueInvoices, color: '#f08a5d' },
        ]);
      }
    };
    loadData();
  }, []);

  return (
    <div className="space-y-6">
      
      {/* Top Greeting */}
      <div className="mb-8">
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

      {/* Top Row: Ringkasan & Tren Arus Kas */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Ringkasan Keuangan */}
        <div className="bg-white rounded-2xl p-6 lg:col-span-7">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-lg font-bold text-[#151D48]">Ringkasan Keuangan</h2>
              <p className="text-sm text-gray-500">Bulan Ini</p>
            </div>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {/* Card 1: Pendapatan Bulan Ini */}
            <div className="bg-[#76c893]/10 rounded-xl p-4">
              <div className="w-10 h-10 rounded-full bg-[#76c893] text-white flex items-center justify-center mb-4">
                <StatusUpIcon className="w-5 h-5" />
              </div>
              <h3 className="text-2xl font-bold text-[#1E293B] mb-1">
                {summary ? `Rp ${formatCompactCurrency(summary.totalIncomeMonth)}` : "..."}
              </h3>
              <p className="text-sm font-medium text-[#1E293B] mb-2 leading-tight">Pendapatan<br/>Bulan Ini</p>
              <p className="text-xs text-[#76c893] mt-auto">Bulan berjalan</p>
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
              <p className="text-xs text-[#f08a5d] mt-auto">Bulan berjalan</p>
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

        {/* Tren Arus Kas */}
        <div className="bg-white rounded-2xl p-6 lg:col-span-5">
          <h2 className="text-lg font-bold text-[#151D48] mb-6 flex items-center gap-2">
            <ChartIcon className="w-5 h-5 text-[#5C67F2]" />
            Tren Arus Kas
          </h2>
          <ChartWrapper height={220}>
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#9CA3AF' }} minTickGap={30} interval="equidistantPreserveStart" />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#9CA3AF' }} tickFormatter={(value) => formatCompactCurrency(value)} />
                <Tooltip 
                  cursor={{ stroke: '#5C67F2', strokeWidth: 1, strokeDasharray: '4 4' }} 
                  content={<CustomTooltip />}
                />
                <Line type="monotone" dataKey="pendapatan" stroke="#76c893" strokeWidth={3} dot={false} />
                <Line type="monotone" dataKey="pengeluaran" stroke="#f08a5d" strokeWidth={3} dot={false} />
                <Line type="monotone" dataKey="laba" stroke="#7983ff" strokeWidth={3} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </ChartWrapper>
          <div className="flex justify-center gap-4 mt-2 text-xs text-gray-500">
            <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-[#76c893]"></span> Pendapatan</div>
            <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-[#f08a5d]"></span> Pengeluaran</div>
            <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-[#7983ff]"></span> Laba Bersih</div>
          </div>
        </div>
      </div>

      {/* Middle Row: Arus Kas Harian, Laba Bersih, Status Invoice */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Perbandingan Arus Kas */}
        <div className="bg-white rounded-2xl p-6 lg:col-span-1 flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-bold text-[#151D48] flex items-center gap-2">
              <ChartIcon className="w-5 h-5 text-[#3CD856]" />
              Perbandingan Arus Kas
            </h2>
            <div className="w-36">
              <CustomSelect 
                options={[
                  { value: "Minggu Ini", label: "Minggu Ini" },
                  { value: "Bulan Ini", label: "Bulan Ini" },
                  { value: "Tahun Ini", label: "Tahun Ini" }
                ]}
                value={periodeKas}
                onChange={setPeriodeKas}
                className="w-full bg-[#F9FAFB] border border-gray-200 rounded-lg px-3 py-1.5 text-xs text-gray-600"
              />
            </div>
          </div>
          <ChartWrapper height={180}>
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={(() => {
                if (periodeKas === "Minggu Ini") {
                  const now = new Date();
                  const dayOfWeek = now.getDay();
                  const monday = new Date(now);
                  monday.setDate(now.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));
                  
                  const weekDays = ["Sen", "Sel", "Rab", "Kam", "Jum", "Sab", "Min"];
                  return weekDays.map((dayName, index) => {
                    const date = new Date(monday);
                    date.setDate(monday.getDate() + index);
                    const dayNum = date.getDate();
                    const dayData = chartData.find(d => parseInt(d.name) === dayNum);
                    return {
                      name: dayName,
                      pendapatan: dayData?.pendapatan || 0,
                      pengeluaran: dayData?.pengeluaran || 0,
                      laba: dayData?.laba || 0
                    };
                  });
                }
                if (periodeKas === "Tahun Ini") {
                  const months = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Ags", "Sep", "Okt", "Nov", "Des"];
                  // Placeholder: using current month data for the current month index, 0 for others
                  // In a real app, this would fetch year-wide data.
                  const currentMonthIdx = new Date().getMonth();
                  return months.map((m, idx) => ({
                    name: m,
                    pendapatan: idx === currentMonthIdx ? summary?.totalIncomeMonth || 0 : 0,
                    pengeluaran: idx === currentMonthIdx ? summary?.totalExpenseMonth || 0 : 0,
                    laba: idx === currentMonthIdx ? summary?.netProfit || 0 : 0
                  }));
                }
                return chartData;
              })()} barGap={4}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#9CA3AF' }} minTickGap={30} interval="equidistantPreserveStart" />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#9CA3AF' }} tickFormatter={(value) => formatCompactCurrency(value)} />
                <Tooltip 
                  cursor={{ fill: '#F3F4F6' }}
                  content={<CustomTooltip />}
                />
                <Bar dataKey="pendapatan" fill="#76c893" radius={[4, 4, 0, 0]} barSize={8} />
                <Bar dataKey="pengeluaran" fill="#f08a5d" radius={[4, 4, 0, 0]} barSize={8} />
              </BarChart>
            </ResponsiveContainer>
          </ChartWrapper>
          <div className="flex justify-center gap-6 mt-4 text-xs text-gray-500">
            <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-[#76c893]"></span> Pendapatan</div>
            <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-[#f08a5d]"></span> Pengeluaran</div>
          </div>
        </div>

        {/* Pertumbuhan Laba Bersih */}
        <div className="bg-white rounded-2xl p-6 lg:col-span-1">
          <h2 className="text-lg font-bold text-[#151D48] mb-6 flex items-center gap-2">
            <StatusUpIcon className="w-5 h-5 text-[#5C67F2]" />
            Pertumbuhan Laba Bersih
          </h2>
          <ChartWrapper height={140}>
            <ResponsiveContainer width="100%" height={140}>
              <AreaChart data={chartData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorCurrent" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#7983ff" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#7983ff" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                <XAxis dataKey="name" hide />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#9CA3AF' }} tickFormatter={(value) => formatCompactCurrency(value)} width={60} />
                <Tooltip 
                  cursor={{ stroke: '#5C67F2', strokeWidth: 1, strokeDasharray: '4 4' }}
                  content={<CustomTooltip hideHeader={true} />}
                />
                <Area type="monotone" dataKey="last" stroke="#76c893" fill="none" strokeWidth={2} dot={false} />
                <Area type="monotone" dataKey="laba" stroke="#7983ff" fill="url(#colorCurrent)" strokeWidth={2} dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          </ChartWrapper>
          <div className="flex justify-center gap-6 mt-6 pt-4 border-t border-gray-100">
            <div className="text-center">
              <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-1 justify-center">
                <span className="w-3 h-1 bg-[#76c893] rounded-full"></span> Laba Bulan Lalu
              </div>
              <p className="font-bold text-[#1E293B]">
                {summary ? `Rp ${formatCompactCurrency(summary.prevNetProfitMTD)}` : "..."}
              </p>
            </div>
            <div className="w-px bg-gray-100"></div>
            <div className="text-center">
              <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-1 justify-center">
                <span className="w-3 h-1 bg-[#7983ff] rounded-full"></span> Laba Bulan Ini
              </div>
              <p className="font-bold text-[#1E293B]">
                {summary ? `Rp ${formatCompactCurrency(summary.netProfit)}` : "..."}
              </p>
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

      {/* Bottom Row: Klien Teratas, Aktivitas Terbaru */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Klien Teratas */}
        <div className="bg-white rounded-2xl p-6">
          <h2 className="text-lg font-bold text-[#151D48] mb-6">Klien Teratas</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-xs text-gray-400 border-b border-gray-100">
                <tr>
                  <th className="font-normal text-left pb-3 w-8">#</th>
                  <th className="font-normal text-left pb-3">Nama Klien</th>
                  <th className="font-normal text-left pb-3">Kontribusi</th>
                  <th className="font-normal text-right pb-3">Persentase</th>
                </tr>
              </thead>
              <tbody>
                {topClients.map((client) => (
                  <tr key={client.id} className="border-b border-gray-50 last:border-0">
                    <td className="py-4 text-gray-500">{client.id}</td>
                    <td className="py-4 text-[#151D48] font-medium">{client.name}</td>
                    <td className="py-4 w-32">
                      <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div className={`h-full ${client.color}`} style={{ width: `${client.percent}%` }}></div>
                      </div>
                    </td>
                    <td className="py-4 text-right">
                      <span className={`px-2 py-1 rounded border text-xs ${
                        client.color.includes('7983ff') ? 'border-[#7983ff] text-[#7983ff] bg-[#7983ff]/10' :
                        client.color.includes('76c893') ? 'border-[#76c893] text-[#76c893] bg-[#76c893]/10' :
                        client.color.includes('a78bfa') ? 'border-[#a78bfa] text-[#a78bfa] bg-[#a78bfa]/10' :
                        'border-[#ffd166] text-[#ffd166] bg-[#ffd166]/10'
                      }`}>
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
