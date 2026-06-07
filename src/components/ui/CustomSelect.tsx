"use client";

// Import React hook yang dipakai select custom untuk memilih opsi di form dan filter, misalnya untuk state, efek setelah render, atau referensi elemen.
import React, { useState, useRef, useEffect } from "react";
// Import ikon yang dipakai select custom untuk memilih opsi di form dan filter untuk memperjelas tombol, menu, status, dan aksi di layar.
import { ChevronDownIcon } from "@astraicons/react/bold";
// Import utility project supaya select custom untuk memilih opsi di form dan filter bisa memformat class Tailwind atau angka Rupiah dengan cara yang sama.
import { cn } from "@/lib/utils";

// Interface ini menjelaskan field yang dipakai select custom untuk memilih opsi di form dan filter supaya data form/database tidak salah bentuk.
interface Option {
  value: string;
  label: string;
}

// Interface ini menjelaskan field yang dipakai select custom untuk memilih opsi di form dan filter supaya data form/database tidak salah bentuk.
interface CustomSelectProps {
  options: Option[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  triggerClassName?: string;
}

// CustomSelect menampilkan daftar opsi custom dan mengirim nilai yang dipilih ke form/filter.
export function CustomSelect({
  options,
  value,
  onChange,
  placeholder = "Pilih...",
  className = "",
  triggerClassName = "",
}: CustomSelectProps) {
  // isOpen menentukan apakah panel/dropdown/modal sedang terbuka di layar.
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Effect ini menutup dropdown/modal kecil ketika user klik area di luar komponennya.
  useEffect(() => {
    // handleClickOutside berjalan saat user klik area luar komponen; jika kliknya di luar, dropdown atau kalender akan ditutup.
    function handleClickOutside(event: MouseEvent) {
      // Kondisi if (containerRef.current && !containerRef.current.contains(event.target as Node)) membuat isi blok if di bawahnya hanya berjalan saat kondisi itu benar di CustomSelect.
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    // CustomSelect menampilkan UI untuk select custom untuk memilih opsi di form dan filter.
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectedOption = options.find(opt => opt.value === value);

  // CustomSelect menampilkan UI untuk select custom untuk memilih opsi di form dan filter.
  return (
    <div className={cn("relative", className)} ref={containerRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "w-full flex items-center justify-between h-10 px-3 bg-surface border border-border text-sm text-text-primary rounded-xl focus:ring-2 focus:ring-primary/20 transition-all hover:border-primary/50",
          triggerClassName
        )}
      >
        <span className={cn(!selectedOption && "text-text-muted")}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <ChevronDownIcon className={cn("w-4 h-4 text-text-muted transition-transform", isOpen && "rotate-180")} />
      </button>

      {isOpen && (
        <div className="absolute z-[100] mt-1 w-full bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-gray-100 overflow-hidden">
          <ul className="max-h-60 overflow-auto p-1.5 space-y-0.5 scrollbar-none">
            {options.length === 0 ? (
              <li className="px-3 py-2 text-sm text-gray-500 text-center italic">Tidak ada opsi</li>
            ) : (
              // map ini membuat satu pilihan visual untuk setiap opsi yang tersedia di dropdown/select.
              options.map((option) => (
                <li
                  key={option.value}
                  onClick={() => {
                    onChange(option.value);
                    setIsOpen(false);
                  }}
                  className={cn(
                    "px-3 py-2 text-sm cursor-pointer transition-all select-none rounded-xl",
                    option.value === value 
                      ? "bg-[#5C67F2]/10 text-[#5C67F2] font-semibold" 
                      : "text-gray-700 hover:bg-gray-50"
                  )}
                >
                  {option.label}
                </li>
              ))
            )}
          </ul>
        </div>
      )}
    </div>
  );
}
