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
