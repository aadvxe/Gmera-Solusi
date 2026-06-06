// Import React hook yang dipakai helper class Tailwind dan format/parsing Rupiah, misalnya untuk state, efek setelah render, atau referensi elemen.
import React from "react";
// Import clsx untuk menggabungkan class Tailwind yang kadang bernilai false/null.
import { clsx, type ClassValue } from "clsx";
// Import twMerge untuk menghapus class Tailwind yang saling bentrok, seperti dua padding atau dua warna.
import { twMerge } from "tailwind-merge";

// cn menggabungkan class Tailwind dan menyelesaikan konflik seperti dua warna atau dua padding yang saling bertabrakan.
export function cn(...inputs: ClassValue[]) {
  // cn mengembalikan class Tailwind final setelah class kosong dibuang dan konflik class dirapikan.
  return twMerge(clsx(inputs));
}

// formatRupiah mengubah angka mentah menjadi teks Rupiah tanpa simbol Rp untuk input form.
export function formatRupiah(value: number | string, includeDecimals: boolean = false): string {
  // Kondisi ini memastikan nilai input ada sebelum dipakai untuk tampilan atau perhitungan.
  if (value === undefined || value === null || value === "") return "";
  // If it's a string, strip everything except digits
  const rawValue = typeof value === "string" ? value.replace(/[^0-9]/g, "") : value.toString();
  // Kondisi if (!rawValue || rawValue === "0") return ""; membuat isi blok if di bawahnya hanya berjalan saat kondisi itu benar di helper format dan class.
  if (!rawValue || rawValue === "0") return "";
  const numberValue = parseInt(rawValue);
  // Kondisi if (isNaN(numberValue) || numberValue === 0) return ""; membuat isi blok if di bawahnya hanya berjalan saat kondisi itu benar di helper format dan class.
  if (isNaN(numberValue) || numberValue === 0) return "";
  
  // fmtAccounting mengubah angka menjadi format Indonesia dengan dua desimal untuk laporan akuntansi.
  return new Intl.NumberFormat("id-ID", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(numberValue);
}

// parseRupiah mengambil angka asli dari teks Rupiah yang diketik user.
export function parseRupiah(value: string): number {
  // Kalau tanggal/nilai kosong, helper export mengosongkan sel supaya file tidak menampilkan tanggal palsu.
  if (!value) return 0;
  // Ignore decimals by taking the integer part before the comma
  const intPart = value.split(',')[0];
  const digits = intPart.replace(/[^0-9]/g, "");
  // Kondisi if (!digits) return 0; membuat isi blok if di bawahnya hanya berjalan saat kondisi itu benar di helper format dan class.
  if (!digits) return 0;
  // digits mengembalikan nilai yang dibutuhkan oleh helper format dan class.
  return parseInt(digits) || 0;
}

// formatCurrency mengubah angka menjadi format mata uang Indonesia lengkap dengan Rp.
export function formatCurrency(amount: number) {
  // fmtAccounting mengubah angka menjadi format Indonesia dengan dua desimal untuk laporan akuntansi.
  return new Intl.NumberFormat('id-ID', { 
    style: 'currency', 
    currency: 'IDR', 
    minimumFractionDigits: 0,
    maximumFractionDigits: 0 
  }).format(amount);
}
