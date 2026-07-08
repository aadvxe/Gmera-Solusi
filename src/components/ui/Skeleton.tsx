// Import React untuk tipe HTML div yang diteruskan ke komponen skeleton.
import React from "react";
// Import utility project agar Skeleton.tsx bisa menggabungkan class Tailwind atau format Rupiah dengan helper yang sama.
import { cn } from "@/lib/utils";

// Skeleton adalah tampilan abu-abu sementara saat data masih dimuat, supaya layar tidak terlihat kosong.
export function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  // Skeleton.tsx menampilkan elemen UI kecil yang dipakai ulang di dashboard.
  return (
    <div
      className={cn("animate-pulse rounded-md bg-border/50", className)}
      {...props}
    />
  );
}

// SkeletonCard adalah placeholder berbentuk kartu saat isi kartu masih loading.
export function SkeletonCard() {
  // Skeleton.tsx menampilkan elemen UI kecil yang dipakai ulang di dashboard.
  return (
    <div className="flex flex-col space-y-3 p-4 bg-surface rounded-xl border border-border">
      <Skeleton className="h-[125px] w-full rounded-xl" />
      <div className="space-y-2">
        <Skeleton className="h-4 w-[250px]" />
        <Skeleton className="h-4 w-[200px]" />
      </div>
    </div>
  );
}

// SkeletonTable adalah placeholder berbentuk tabel saat data tabel masih loading.
export function SkeletonTable() {
  // Skeleton.tsx menampilkan elemen UI kecil yang dipakai ulang di dashboard.
  return (
    <div className="space-y-4 p-4">
      <Skeleton className="h-10 w-full" />
      <Skeleton className="h-16 w-full" />
      <Skeleton className="h-16 w-full" />
      <Skeleton className="h-16 w-full" />
    </div>
  );
}

// SkeletonTableRow renders row cells with skeleton pulse animations for dynamic tables.
import { TableRow, TableCell } from "./Table";

export function SkeletonTableRow({ cols }: { cols: number }) {
  return (
    <TableRow>
      {Array.from({ length: cols }).map((_, i) => (
        <TableCell key={i}>
          <Skeleton className="h-5 w-full rounded-lg bg-gray-200/60" />
        </TableCell>
      ))}
    </TableRow>
  );
}

// SkeletonDashboard represents the layout placeholder of the main dashboard page.
export function SkeletonDashboard() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8 pt-6 sm:pt-0">
        <div className="space-y-2">
          <Skeleton className="h-8 w-48 bg-gray-200/60" />
          <Skeleton className="h-4 w-80 bg-gray-200/60" />
        </div>
        <Skeleton className="h-10 w-full md:w-52 rounded-xl bg-gray-200/60" />
      </div>

      {/* Top Row: Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="bg-white rounded-2xl p-6 lg:col-span-12 space-y-6 border border-gray-100 shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <Skeleton className="h-6 w-36 bg-gray-200/60" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="bg-gray-50 border border-gray-100 rounded-2xl p-6 space-y-4">
                <div className="flex justify-between items-center">
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-24 bg-gray-200/60" />
                    <Skeleton className="h-6 w-32 bg-gray-200/60" />
                  </div>
                  <Skeleton className="w-12 h-12 rounded-xl bg-gray-200/60" />
                </div>
                <Skeleton className="h-4 w-40 bg-gray-200/60" />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Row 2: Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-6">
        {/* Left Chart (Laba Rugi) */}
        <div className="bg-white rounded-2xl p-6 lg:col-span-8 space-y-4 border border-gray-100 shadow-sm">
          <div className="flex justify-between items-center">
            <Skeleton className="h-6 w-40 bg-gray-200/60" />
            <Skeleton className="h-8 w-24 bg-gray-200/60" />
          </div>
          <Skeleton className="h-72 w-full rounded-xl bg-gray-200/60" />
        </div>
        {/* Right Chart (Pie) */}
        <div className="bg-white rounded-2xl p-6 lg:col-span-4 space-y-4 border border-gray-100 shadow-sm">
          <Skeleton className="h-6 w-48 bg-gray-200/60" />
          <div className="flex justify-center items-center py-6">
            <Skeleton className="h-48 w-48 rounded-full bg-gray-200/60" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-4 w-full bg-gray-200/60" />
            <Skeleton className="h-4 w-5/6 bg-gray-200/60" />
          </div>
        </div>
      </div>

      {/* Row 3: Bottom Lists */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-6">
        {/* Left: Top Clients */}
        <div className="bg-white rounded-2xl p-6 lg:col-span-4 space-y-4 border border-gray-100 shadow-sm">
          <Skeleton className="h-6 w-32 bg-gray-200/60" />
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <Skeleton className="w-8 h-8 rounded-lg bg-gray-200/60" />
                  <Skeleton className="h-4 w-28 bg-gray-200/60" />
                </div>
                <Skeleton className="h-4 w-12 bg-gray-200/60" />
              </div>
            ))}
          </div>
        </div>
        {/* Right: Recent Activities */}
        <div className="bg-white rounded-2xl p-6 lg:col-span-8 space-y-4 border border-gray-100 shadow-sm">
          <div className="flex justify-between items-center">
            <Skeleton className="h-6 w-44 bg-gray-200/60" />
            <Skeleton className="h-8 w-24 bg-gray-200/60" />
          </div>
          <div className="space-y-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex justify-between items-center">
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-4 w-1/3 bg-gray-200/60" />
                  <Skeleton className="h-3 w-1/2 bg-gray-200/60" />
                </div>
                <Skeleton className="h-4 w-16 bg-gray-200/60" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// SkeletonDetail represents layout placeholder for invoice/customer detail screens.
export function SkeletonDetail() {
  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-pulse">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Skeleton className="w-10 h-10 rounded-xl bg-gray-200/60" />
          <div className="space-y-2">
            <Skeleton className="h-6 w-40 bg-gray-200/60" />
            <Skeleton className="h-4 w-24 bg-gray-200/60" />
          </div>
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-10 w-24 rounded-xl bg-gray-200/60" />
          <Skeleton className="h-10 w-28 rounded-xl bg-gray-200/60" />
        </div>
      </div>

      {/* Main card */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6 sm:p-8 space-y-8 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-3">
            <Skeleton className="h-6 w-32 bg-gray-200/60" />
            <Skeleton className="h-4 w-48 bg-gray-200/60" />
            <Skeleton className="h-4 w-40 bg-gray-200/60" />
          </div>
          <div className="md:text-right space-y-3 flex flex-col md:items-end">
            <Skeleton className="h-6 w-32 bg-gray-200/60" />
            <Skeleton className="h-4 w-24 bg-gray-200/60" />
            <Skeleton className="h-4 w-32 bg-gray-200/60" />
          </div>
        </div>

        <div className="border-t border-b border-gray-100 py-6 grid grid-cols-2 md:grid-cols-4 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="h-3 w-20 bg-gray-200/60" />
              <Skeleton className="h-5 w-28 bg-gray-200/60" />
            </div>
          ))}
        </div>

        {/* Invoice items table skeleton */}
        <div className="space-y-4">
          <Skeleton className="h-8 w-36 bg-gray-200/60" />
          <div className="border border-gray-100 rounded-xl overflow-hidden">
            <div className="bg-gray-50 p-4 border-b border-gray-100 flex justify-between">
              <Skeleton className="h-4 w-40 bg-gray-200/60" />
              <Skeleton className="h-4 w-20 bg-gray-200/60" />
            </div>
            <div className="p-4 space-y-4 bg-white">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex justify-between">
                  <Skeleton className="h-4 w-48 bg-gray-200/60" />
                  <Skeleton className="h-4 w-16 bg-gray-200/60" />
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-4 border-t border-gray-100">
          <div className="w-80 space-y-3">
            <div className="flex justify-between"><Skeleton className="h-4 w-24 bg-gray-200/60" /><Skeleton className="h-4 w-16 bg-gray-200/60" /></div>
            <div className="flex justify-between"><Skeleton className="h-4 w-24 bg-gray-200/60" /><Skeleton className="h-4 w-16 bg-gray-200/60" /></div>
            <div className="flex justify-between border-t border-gray-100 pt-2"><Skeleton className="h-5 w-24 bg-gray-200/60" /><Skeleton className="h-5 w-24 bg-gray-200/60" /></div>
          </div>
        </div>
      </div>
    </div>
  );
}

// SkeletonForm represents placeholder for adding/editing invoices or settings forms.
export function SkeletonForm() {
  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-pulse pb-20">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Skeleton className="w-10 h-10 rounded-xl bg-gray-200/60" />
        <div className="space-y-2">
          <Skeleton className="h-6 w-32 bg-gray-200/60" />
          <Skeleton className="h-4 w-24 bg-gray-200/60" />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Card 1 */}
          <div className="bg-white rounded-2xl p-6 border border-gray-100 space-y-4 shadow-sm">
            <Skeleton className="h-5 w-44 bg-gray-200/60" />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Skeleton className="h-3 w-20 bg-gray-200/60" />
                <Skeleton className="h-10 w-full rounded-xl bg-gray-200/60" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-3 w-20 bg-gray-200/60" />
                <Skeleton className="h-10 w-full rounded-xl bg-gray-200/60" />
              </div>
            </div>
          </div>
          {/* Card 2 */}
          <div className="bg-white rounded-2xl p-6 border border-gray-100 space-y-4 shadow-sm">
            <Skeleton className="h-5 w-32 bg-gray-200/60" />
            <div className="space-y-4">
              {Array.from({ length: 2 }).map((_, i) => (
                <div key={i} className="flex gap-4">
                  <Skeleton className="h-10 flex-1 rounded-xl bg-gray-200/60" />
                  <Skeleton className="h-10 w-24 rounded-xl bg-gray-200/60" />
                  <Skeleton className="h-10 w-24 rounded-xl bg-gray-200/60" />
                </div>
              ))}
            </div>
          </div>
        </div>
        
        {/* Right Card */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white rounded-2xl p-6 border border-gray-100 space-y-4 shadow-sm">
            <Skeleton className="h-5 w-28 bg-gray-200/60" />
            <div className="space-y-3">
              <Skeleton className="h-10 w-full rounded-xl bg-gray-200/60" />
              <Skeleton className="h-10 w-full rounded-xl bg-gray-200/60" />
            </div>
            <div className="border-t border-gray-100 pt-4 space-y-3">
              <div className="flex justify-between"><Skeleton className="h-4 w-20 bg-gray-200/60" /><Skeleton className="h-4 w-12 bg-gray-200/60" /></div>
              <div className="flex justify-between"><Skeleton className="h-4 w-20 bg-gray-200/60" /><Skeleton className="h-4 w-12 bg-gray-200/60" /></div>
              <div className="flex justify-between border-t border-gray-100 pt-3"><Skeleton className="h-5 w-24 bg-gray-200/60" /><Skeleton className="h-5 w-16 bg-gray-200/60" /></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// SkeletonLaporanContent represents the loading state for reports below the filter header.
export function SkeletonLaporanContent() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Metrics Row (3 Cards) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="bg-white border border-gray-100 rounded-2xl p-6 space-y-4 shadow-sm">
            <div className="flex justify-between items-center">
              <Skeleton className="h-4 w-32 bg-gray-200/60" />
              <Skeleton className="w-10 h-10 rounded-xl bg-gray-200/60" />
            </div>
            <Skeleton className="h-8 w-44 bg-gray-200/60" />
            <Skeleton className="h-3 w-28 bg-gray-200/60" />
          </div>
        ))}
      </div>

      {/* Charts Row (2 Charts) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {Array.from({ length: 2 }).map((_, i) => (
          <div key={i} className="bg-white border border-gray-100 rounded-2xl p-6 space-y-4 shadow-sm">
            <div className="flex justify-between items-center">
              <Skeleton className="h-6 w-40 bg-gray-200/60" />
              <Skeleton className="h-6 w-24 bg-gray-200/60" />
            </div>
            <Skeleton className="h-60 w-full rounded-xl bg-gray-200/60" />
          </div>
        ))}
      </div>

      {/* Export Action Card */}
      <div className="bg-white border border-gray-100 rounded-2xl p-8 shadow-sm flex flex-col items-center space-y-4">
        <Skeleton className="w-16 h-16 rounded-2xl bg-gray-200/60" />
        <Skeleton className="h-6 w-60 bg-gray-200/60" />
        <Skeleton className="h-4 w-96 bg-gray-200/60" />
        <div className="flex gap-4 w-full max-w-md pt-4">
          <Skeleton className="h-11 flex-1 rounded-xl bg-gray-200/60" />
          <Skeleton className="h-11 flex-1 rounded-xl bg-gray-200/60" />
        </div>
      </div>
    </div>
  );
}
