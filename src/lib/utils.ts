import React from "react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatRupiah(value: number | string): string {
  if (value === undefined || value === null || value === "") return "";
  // If it's a string, we strip everything except digits to get the raw number
  const rawValue = typeof value === "string" ? value.replace(/[^0-9]/g, "") : value.toString();
  const numberValue = parseInt(rawValue) || 0;
  
  return new Intl.NumberFormat("id-ID", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(numberValue);
}

export function parseRupiah(value: string): number {
  if (!value) return 0;
  // We only care about the digits before the decimal separator for whole numbers
  // or if we want to treat everything as digits and then divide by 100?
  // But usually users just want to type the whole amount.
  // Given the request ",00", I'll treat the typed digits as the whole number.
  const digits = value.split(',')[0].replace(/[^0-9]/g, "");
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
