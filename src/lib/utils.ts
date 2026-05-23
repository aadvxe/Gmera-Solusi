import React from "react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatRupiah(value: number | string): string {
  if (value === undefined || value === null || value === "") return "";
  // If it's a string, strip everything except digits
  const rawValue = typeof value === "string" ? value.replace(/[^0-9]/g, "") : value.toString();
  if (!rawValue || rawValue === "0") return "";
  const numberValue = parseInt(rawValue);
  if (isNaN(numberValue) || numberValue === 0) return "";
  
  return new Intl.NumberFormat("id-ID", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(numberValue);
}

export function parseRupiah(value: string): number {
  if (!value) return 0;
  // Strip all non-digit characters (handles thousand separators like dots in id-ID)
  const digits = value.replace(/[^0-9]/g, "");
  if (!digits) return 0;
  return parseInt(digits) || 0;
}

export function formatCurrency(amount: number) {
  return new Intl.NumberFormat('id-ID', { 
    style: 'currency', 
    currency: 'IDR', 
    minimumFractionDigits: 2,
    maximumFractionDigits: 2 
  }).format(amount);
}
