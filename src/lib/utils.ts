import React from "react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatRupiah(value: number | string): string {
  if (value === undefined || value === null || value === "") return "";
  const numberValue = typeof value === "string" ? parseInt(value.replace(/[^0-9]/g, "")) : value;
  if (isNaN(numberValue)) return "0";
  return new Intl.NumberFormat("id-ID").format(numberValue);
}

export function parseRupiah(value: string): number {
  if (!value) return 0;
  return parseInt(value.replace(/[^0-9]/g, "")) || 0;
}
