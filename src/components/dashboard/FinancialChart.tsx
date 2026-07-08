"use client";

// Import React hook yang dipakai kartu grafik keuangan yang mengelompokkan data harian, mingguan, atau bulanan, misalnya untuk state, efek setelah render, atau referensi elemen.
import React, { useState, useMemo, useRef, useEffect } from "react";
// import Recharts dipakai untuk membuat grafik di dashboard/laporan.
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

// Interface ini menjelaskan field yang dipakai kartu grafik keuangan yang mengelompokkan data harian, mingguan, atau bulanan supaya data form/database tidak salah bentuk.
interface RawDataPoint {
  dateStr: string;
  income: number;
  expense: number;
}

// Interface ini menjelaskan field yang dipakai kartu grafik keuangan yang mengelompokkan data harian, mingguan, atau bulanan supaya data form/database tidak salah bentuk.
interface FinancialChartProps {
  title: string;
  icon?: React.ComponentType<{ className?: string; style?: React.CSSProperties }>;
  rawData: RawDataPoint[];
  dataKey: "income" | "expense";
  color: string;
  total: string;
}

// CustomTooltip adalah komponen React; komponen ini menghasilkan bagian tampilan yang bisa dipakai di halaman.
const CustomTooltip = ({ active, payload, label }: any) => {
  // Kondisi ini mengecek jumlah item agar daftar kosong, pagination, atau total bisa ditangani dengan benar.
  if (active && payload && payload.length) {
    // Komponen ini menampilkan UI untuk kartu grafik keuangan yang mengelompokkan data harian, mingguan, atau bulanan.
    return (
      <div className="bg-white p-3 px-4 border border-gray-100 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.12)]">
        <div className="space-y-1.5">
          {/* map ini membuat satu output untuk setiap item daftar yang sedang dirender oleh FinancialChart. */}
          {payload.map((entry: any, index: number) => (
            <div key={index} className="flex items-center justify-between gap-6 text-sm">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: entry.color }}></span>
                <span className="text-gray-500 capitalize">{entry.name === 'value' ? 'Jumlah' : entry.name}</span>
              </div>
              <span className="font-bold text-[#151D48]">
                Rp {Math.abs(entry.value) >= 1000000 
                  ? `${(entry.value / 1000000).toLocaleString('id-ID', { maximumFractionDigits: 1 })} Jt` 
                  : entry.value.toLocaleString('id-ID')}
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  }
  // CustomTooltip berhenti di sini karena syarat lanjut belum terpenuhi.
  return null;
};

// FinancialChart mengubah data transaksi menjadi grafik batang sesuai periode yang dipilih user.
export function FinancialChart({ title, icon: Icon, rawData = [], dataKey, color, total }: FinancialChartProps) {
  const [period, setPeriod] = useState<"Harian" | "Mingguan" | "Bulanan">("Harian");
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [activeTabRect, setActiveTabRect] = useState<{ width: number; left: number } | null>(null);
  const tabRefs = useRef<Record<string, HTMLButtonElement | null>>({});

  const handlePeriodChange = (newPeriod: typeof period) => {
    if (newPeriod === period) return;
    setIsTransitioning(true);
    setTimeout(() => {
      setPeriod(newPeriod);
      setIsTransitioning(false);
    }, 150);
  };

  useEffect(() => {
    const updateTabRect = () => {
      const activeBtn = tabRefs.current[period];
      if (activeBtn) {
        setActiveTabRect({
          width: activeBtn.offsetWidth,
          left: activeBtn.offsetLeft
        });
      }
    };

    updateTabRect();
    window.addEventListener("resize", updateTabRect);
    return () => window.removeEventListener("resize", updateTabRect);
  }, [period]);

  // Memo ini menghitung data turunan untuk kartu grafik keuangan yang mengelompokkan data harian, mingguan, atau bulanan hanya saat inputnya berubah, supaya render tidak melakukan hitungan yang sama terus.
  const groupedData = useMemo(() => {
    // Kondisi ini mengecek jumlah item agar daftar kosong, pagination, atau total bisa ditangani dengan benar.
    if (!rawData.length) return [];

    const result: { name: string; value: number }[] = [];

    // Kondisi if (period === "Harian") membuat isi blok if di bawahnya hanya berjalan saat kondisi itu benar di FinancialChart.
    if (period === "Harian") {
      rawData.forEach(d => {
        const dateObj = new Date(d.dateStr);
        result.push({
          name: dateObj.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' }),
          value: d[dataKey]
        });
      });
    } else if (period === "Mingguan") {
      let currentWeekStart = new Date(rawData[0].dateStr);
      let weekNum = 1;
      let sum = 0;
      let count = 0;

      for (let i = 0; i < rawData.length; i++) {
        sum += rawData[i][dataKey];
        count++;
        
        // Kondisi ini mengecek jumlah item agar daftar kosong, pagination, atau total bisa ditangani dengan benar.
        if (count === 7 || i === rawData.length - 1) {
          result.push({
            name: `M${weekNum} (${currentWeekStart.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })})`,
            value: sum
          });
          sum = 0;
          count = 0;
          weekNum++;
          // Kondisi ini mengecek jumlah item agar daftar kosong, pagination, atau total bisa ditangani dengan benar.
          if (i + 1 < rawData.length) {
            currentWeekStart = new Date(rawData[i + 1].dateStr);
          }
        }
      }
    } else if (period === "Bulanan") {
      const monthMap = new Map<string, number>();
      
      rawData.forEach(d => {
        const dateObj = new Date(d.dateStr);
        const monthKey = dateObj.toLocaleDateString('id-ID', { month: 'short', year: '2-digit' });
        monthMap.set(monthKey, (monthMap.get(monthKey) || 0) + d[dataKey]);
      });

      monthMap.forEach((val, key) => {
        result.push({ name: key, value: val });
      });
    }

    // Trim trailing empty data points so the bar grows per data
    let lastIndex = -1;
    for (let i = 0; i < result.length; i++) {
      if (result[i].value > 0) {
        lastIndex = i;
      }
    }

    if (lastIndex === -1 && result.length > 0) {
      return [result[0]];
    } else if (lastIndex >= 0) {
      return result.slice(0, lastIndex + 1);
    }

    return result;
  }, [rawData, period, dataKey]);

  // Calculate average based on grouped data
  const averageValue = groupedData.length > 0 
    // reduce ini menjumlahkan nominal transaksi untuk ringkasan angka di kartu grafik keuangan yang mengelompokkan data harian, mingguan, atau bulanan.
    ? groupedData.reduce((acc, curr) => acc + curr.value, 0) / groupedData.length 
    : 0;

  const absAverage = Math.abs(averageValue);
  const getAverageFormatted = (val: number) => {
    const abs = Math.abs(val);
    if (abs >= 1000000000) return (val / 1000000000).toFixed(1) + ' M';
    if (abs >= 1000000) return (val / 1000000).toFixed(1) + ' Jt';
    return (val / 1000).toFixed(0) + ' k';
  };
  const averageText = `Rp ${getAverageFormatted(averageValue)} / ${period === 'Harian' ? 'hr' : period === 'Mingguan' ? 'mgg' : 'bln'}`;

  const formatCurrency = (value: number) => {
    const absValue = Math.abs(value);
    const sign = value < 0 ? "-" : "";
    if (absValue >= 1000000000) return `Rp ${sign}${(absValue / 1000000000).toFixed(1)} M`;
    if (absValue >= 1000000) return `Rp ${sign}${(absValue / 1000000).toFixed(0)} Jt`;
    return `Rp ${sign}${(absValue / 1000).toFixed(0)} k`;
  };

  const periods = ["Harian", "Mingguan", "Bulanan"] as const;

  // formatCurrency menampilkan UI untuk kartu grafik keuangan yang mengelompokkan data harian, mingguan, atau bulanan.
  return (
    <div className="bg-surface rounded-xl p-6 border border-border shadow-sm flex flex-col">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-0 mb-6">
        <h3 className="text-lg font-semibold text-text-primary flex items-center gap-2">
          {Icon && <Icon className="w-5 h-5 shrink-0" style={{ color }} />}
          {title}
        </h3>
        <div className="relative flex bg-background rounded-lg p-1 self-start sm:self-auto max-w-full overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          {/* Sliding capsule background */}
          {activeTabRect && (
            <div 
              className="absolute top-1 bottom-1 bg-surface rounded-md shadow-sm transition-all duration-300 ease-out"
              style={{
                left: `${activeTabRect.left}px`,
                width: `${activeTabRect.width}px`
              }}
            />
          )}
          {periods.map((p) => (
            <button
              key={p}
              ref={el => { tabRefs.current[p] = el; }}
              onClick={() => handlePeriodChange(p)}
              className={`relative z-10 px-3 py-1 text-xs rounded-md transition-colors duration-200 font-medium ${
                period === p 
                  ? "text-text-primary" 
                  : "text-text-secondary hover:text-text-primary"
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      <div className={`h-[240px] w-full mb-4 transition-opacity duration-150 ease-in-out ${
        isTransitioning ? "opacity-30" : "opacity-100"
      }`}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={groupedData} margin={{ top: 25, right: 10, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E4E7EB" />
            <XAxis 
              dataKey="name" 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: '#636E72', fontSize: 10 }} 
              dy={10}
              interval="preserveStartEnd"
            />
            <YAxis 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: '#636E72', fontSize: 12 }}
              tickFormatter={formatCurrency}
              width={75}
            />
            <Tooltip 
              cursor={{ fill: '#F5F6FA' }}
              content={<CustomTooltip />}
            />
            <Bar dataKey="value" fill={color} radius={[4, 4, 0, 0]} maxBarSize={40} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="flex justify-between items-center pt-4 border-t border-border mt-auto">
        <div className="text-sm">
          <span className="text-text-secondary">Total:</span>{" "}
          <span className="font-semibold text-text-primary tabular-nums">{total}</span>
        </div>
        <div className="text-sm">
          <span className="text-text-secondary">Rata²:</span>{" "}
          <span className="font-semibold text-text-primary tabular-nums">{averageText}</span>
        </div>
      </div>
    </div>
  );
}
