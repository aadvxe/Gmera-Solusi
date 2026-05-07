"use client";

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
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div
        style={{ height }}
        className={`w-full rounded-xl bg-gray-50 animate-pulse ${className}`}
      />
    );
  }

  return (
    <div style={{ height, width: '100%' }} className={className}>
      {children}
    </div>
  );
}
