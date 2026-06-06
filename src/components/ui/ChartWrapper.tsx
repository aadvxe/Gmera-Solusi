"use client";

// Import React hook yang dipakai pembungkus chart agar Recharts hanya render di browser setelah halaman siap, misalnya untuk state, efek setelah render, atau referensi elemen.
import React, { useEffect, useState } from "react";

/**
 * ChartWrapper — solves React 19 + Next.js 15/16 hydration issue with Recharts.
 * Recharts uses browser-only APIs (ResizeObserver, SVG measurements) that
 * cause a mismatch on SSR. This wrapper delays rendering until after mount.
 */
export function ChartWrapper({
  children,
  height = 200,
  className = "",
}: {
  children: React.ReactNode;
  height?: number;
  className?: string;
}) {
  // mounted menyimpan nilai mounted yang berubah saat user berinteraksi dengan pembungkus chart agar Recharts hanya render di browser setelah halaman siap.
  const [mounted, setMounted] = useState(false);

  // Effect ini menandai komponen sudah berjalan di browser, lalu grafik boleh dirender dengan aman.
  useEffect(() => {
    setMounted(true);
  }, []);

  // Kalau komponen belum berjalan di browser, ChartWrapper belum merender Recharts agar tidak bentrok dengan server render.
  if (!mounted) {
    // Komponen ini menampilkan UI untuk pembungkus chart agar Recharts hanya render di browser setelah halaman siap.
    return (
      <div
        style={{ height }}
        className={`w-full rounded-xl bg-gray-50 animate-pulse ${className}`}
      />
    );
  }

  // Komponen ini menampilkan UI untuk pembungkus chart agar Recharts hanya render di browser setelah halaman siap.
  return (
    <div style={{ height, width: '100%' }} className={className}>
      {children}
    </div>
  );
}
