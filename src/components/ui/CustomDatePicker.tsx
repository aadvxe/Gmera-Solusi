"use client";

// Import React hook yang dipakai datepicker custom yang memilih tanggal dalam format YYYY-MM-DD, misalnya untuk state, efek setelah render, atau referensi elemen.
import React, { useState, useRef, useEffect } from "react";
// Import ikon yang dipakai datepicker custom yang memilih tanggal dalam format YYYY-MM-DD untuk memperjelas tombol, menu, status, dan aksi di layar.
import { CalenderIcon } from "@astraicons/react/bold";
// Import ikon yang dipakai datepicker custom yang memilih tanggal dalam format YYYY-MM-DD untuk memperjelas tombol, menu, status, dan aksi di layar.
import { ChevronLeft, ChevronRight } from "lucide-react";

// Interface ini menjelaskan field yang dipakai datepicker custom yang memilih tanggal dalam format YYYY-MM-DD supaya data form/database tidak salah bentuk.
interface CustomDatePickerProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
  minDate?: string;
}

// CustomDatePicker menampilkan kalender custom lalu mengirim tanggal pilihan ke form dalam format YYYY-MM-DD.
export function CustomDatePicker({ value, onChange, className = "", minDate }: CustomDatePickerProps) {
  // isOpen menentukan apakah panel/dropdown/modal sedang terbuka di layar.
  const [isOpen, setIsOpen] = useState(false);
  // currentMonth menentukan bulan yang sedang ditampilkan di kalender date picker.
  const [currentMonth, setCurrentMonth] = useState(new Date(value || new Date()));
  const containerRef = useRef<HTMLDivElement>(null);

  // Effect ini menutup dropdown/modal kecil ketika user klik area di luar komponennya.
  useEffect(() => {
    // handleClickOutside berjalan saat user klik area luar komponen; jika kliknya di luar, dropdown atau kalender akan ditutup.
    function handleClickOutside(event: MouseEvent) {
      // Kondisi if (containerRef.current && !containerRef.current.contains(event.target as Node)) membuat isi blok if di bawahnya hanya berjalan saat kondisi itu benar di CustomDatePicker.
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    // CustomDatePicker menampilkan UI untuk datepicker custom yang memilih tanggal dalam format YYYY-MM-DD.
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Effect ini mengambil data yang diperlukan datepicker custom yang memilih tanggal dalam format YYYY-MM-DD saat halaman dibuka atau filter berubah.
  useEffect(() => {
    // Kondisi ini memastikan nilai input ada sebelum dipakai untuk tampilan atau perhitungan.
    if (value) {
      setCurrentMonth(new Date(value));
    }
  }, [value]);

  const daysInMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1).getDay();

  const days = [];
  for (let i = 0; i < firstDayOfMonth; i++) {
    days.push(null);
  }
  for (let i = 1; i <= daysInMonth; i++) {
    days.push(i);
  }

  // handleDateClick adalah fungsi penangan aksi user; fungsi ini berjalan saat user mengklik, mengetik, memilih, atau submit sesuatu.
  const handleDateClick = (day: number) => {
    const cellYear = currentMonth.getFullYear();
    const cellMonth = String(currentMonth.getMonth() + 1).padStart(2, '0');
    const cellDay = String(day).padStart(2, '0');
    const dateString = `${cellYear}-${cellMonth}-${cellDay}`;
    onChange(dateString);
    setIsOpen(false);
  };

  // nextMonth memindahkan kalender ke bulan berikutnya saat tombol panah kanan diklik.
  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };

  // prevMonth memindahkan kalender ke bulan sebelumnya saat tombol panah kiri diklik.
  const prevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };

  // Convert "YYYY-MM-DD" back to visual string (DD/MM/YYYY) cleanly without timezone shifting
  let displayDate = "Pilih Tanggal";
  // Kondisi ini memastikan nilai input ada sebelum dipakai untuk tampilan atau perhitungan.
  if (value) {
    const parts = value.split('-');
    // Kondisi ini mengecek jumlah item agar daftar kosong, pagination, atau total bisa ditangani dengan benar.
    if (parts.length === 3) {
      displayDate = `${parts[2]}/${parts[1]}/${parts[0]}`;
    } else {
      displayDate = value;
    }
  }

  // CustomDatePicker menampilkan UI untuk datepicker custom yang memilih tanggal dalam format YYYY-MM-DD.
  return (
    <div className={`relative ${className}`} ref={containerRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center h-10 px-3 pl-10 bg-surface border border-border text-sm text-text-primary rounded-xl focus:ring-2 focus:ring-primary/20 transition-colors"
      >
        <CalenderIcon className="absolute left-3 w-4 h-4 text-text-muted" />
        {displayDate}
      </button>

      {isOpen && (
        <div className="absolute z-50 mt-2 p-4 bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-gray-100 w-[280px]">
          <div className="flex justify-between items-center mb-4">
            <button type="button" onClick={prevMonth} className="p-1.5 hover:bg-gray-50 rounded-lg text-gray-500 transition-colors">
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-sm font-bold text-[#151D48]">
              {currentMonth.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })}
            </span>
            <button type="button" onClick={nextMonth} className="p-1.5 hover:bg-gray-50 rounded-lg text-gray-500 transition-colors">
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
          
          <div className="grid grid-cols-7 gap-1 mb-2">
            {/* map ini membuat satu output untuk setiap item daftar yang sedang dirender oleh CustomDatePicker. */}
            {['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'].map(day => (
              <div key={day} className="text-center text-xs font-semibold text-gray-400 py-1">
                {day}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1">
            {/* map ini membuat tombol tanggal untuk setiap hari yang tampil di kalender date picker. */}
            {days.map((day, index) => {
              // Kondisi if (!day) membuat isi blok if di bawahnya hanya berjalan saat kondisi itu benar di CustomDatePicker.
              if (!day) {
                // CustomDatePicker menampilkan potongan UI yang dipakai di datepicker custom yang memilih tanggal dalam format YYYY-MM-DD.
                return <div key={index} className="aspect-square" />;
              }

              const cellYear = currentMonth.getFullYear();
              const cellMonth = String(currentMonth.getMonth() + 1).padStart(2, '0');
              const cellDay = String(day).padStart(2, '0');
              const dateString = `${cellYear}-${cellMonth}-${cellDay}`;

              const isSelected = value && value === dateString;
              const isBeforeMin = !!(minDate && dateString < minDate);

              // CustomDatePicker menampilkan UI untuk datepicker custom yang memilih tanggal dalam format YYYY-MM-DD.
              return (
                <div key={index} className="aspect-square flex items-center justify-center">
                  <button
                    type="button"
                    disabled={isBeforeMin}
                    onClick={() => handleDateClick(day)}
                    className={`w-8 h-8 flex items-center justify-center rounded-xl text-sm transition-all ${
                      isSelected 
                        ? "bg-[#5C67F2] text-white font-bold shadow-sm" 
                        : isBeforeMin
                          ? "text-gray-300 cursor-not-allowed font-medium opacity-50"
                          : "text-[#151D48] hover:bg-[#5C67F2]/10 hover:text-[#5C67F2] font-medium"
                    }`}
                  >
                    {day}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
