"use client";

// Import React hook yang dipakai kartu grafik keuangan yang mengelompokkan data harian, mingguan, atau bulanan, misalnya untuk state, efek setelah render, atau referensi elemen.
import React, { useState, useMemo } from "react";
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

    // monthKey mengembalikan nilai yang dibutuhkan oleh FinancialChart.
    return result;
  }, [rawData, period, dataKey]);

  // Calculate average based on grouped data
  const averageValue = groupedData.length > 0 
    // reduce ini menjumlahkan nominal transaksi untuk ringkasan angka di kartu grafik keuangan yang mengelompokkan data harian, mingguan, atau bulanan.
    ? groupedData.reduce((acc, curr) => acc + curr.value, 0) / groupedData.length 
    : 0;

  const absAverage = Math.abs(averageValue);
  const averageText = `Rp ${absAverage >= 1000000 ? (averageValue / 1000000).toFixed(1) + 'jt' : (averageValue / 1000).toFixed(0) + 'k'} / ${period === 'Harian' ? 'hr' : period === 'Mingguan' ? 'mgg' : 'bln'}`;

  // formatCurrency mengubah angka menjadi format mata uang Indonesia lengkap dengan Rp.
  const formatCurrency = (value: number) => {
    const absValue = Math.abs(value);
    const sign = value < 0 ? "-" : "";
    // Kondisi if (absValue >= 1000000) return `Rp ${sign}${(absValue / 1000000).toFixed(0)}jt`; membuat isi blok if di bawahnya hanya berjalan saat kondisi itu benar di FinancialChart.
    if (absValue >= 1000000) return `Rp ${sign}${(absValue / 1000000).toFixed(0)}jt`;
    // sign mengembalikan nilai yang dibutuhkan oleh FinancialChart.
    return `Rp ${sign}${(absValue / 1000).toFixed(0)}k`;
  };

  // formatCurrency menampilkan UI untuk kartu grafik keuangan yang mengelompokkan data harian, mingguan, atau bulanan.
  return (
    <div className="bg-surface rounded-xl p-6 border border-border shadow-sm flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-text-primary flex items-center gap-2">
          {Icon && <Icon className="w-5 h-5" style={{ color }} />}
          {title}
        </h3>
        <div className="flex bg-background rounded-lg p-1">
          {/* map ini membuat satu output untuk setiap item daftar yang sedang dirender oleh FinancialChart. */}
          {["Harian", "Mingguan", "Bulanan"].map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p as any)}
              className={`px-3 py-1 text-xs rounded-md transition-all ${
                period === p 
                  ? "bg-surface text-text-primary shadow-sm font-medium" 
                  : "text-text-secondary hover:text-text-primary"
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      <div className="h-[240px] w-full mb-4">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={groupedData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
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
