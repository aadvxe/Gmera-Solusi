"use client";

import React, { useState, useRef, useEffect } from "react";
import { CalenderIcon } from "@astraicons/react/bold";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface CustomDatePickerProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

export function CustomDatePicker({ value, onChange, className = "" }: CustomDatePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date(value || new Date()));
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
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

  const handleDateClick = (day: number) => {
    const newDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
    // Format to YYYY-MM-DD
    const dateString = newDate.toLocaleDateString("en-CA");
    onChange(dateString);
    setIsOpen(false);
  };

  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };

  const prevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };

  // Convert "YYYY-MM-DD" back to visual string
  const displayDate = value ? new Date(value).toLocaleDateString('id-ID', { day: '2-digit', month: '2-digit', year: 'numeric' }) : "Pilih Tanggal";

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
            {['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'].map(day => (
              <div key={day} className="text-center text-xs font-semibold text-gray-400 py-1">
                {day}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1">
            {days.map((day, index) => {
              const isSelected = day && value && 
                new Date(value).getDate() === day && 
                new Date(value).getMonth() === currentMonth.getMonth() &&
                new Date(value).getFullYear() === currentMonth.getFullYear();

              return (
                <div key={index} className="aspect-square flex items-center justify-center">
                  {day && (
                    <button
                      type="button"
                      onClick={() => handleDateClick(day)}
                      className={`w-8 h-8 flex items-center justify-center rounded-xl text-sm transition-all ${
                        isSelected 
                          ? "bg-[#5C67F2] text-white font-bold shadow-sm" 
                          : "text-[#151D48] hover:bg-[#5C67F2]/10 hover:text-[#5C67F2] font-medium"
                      }`}
                    >
                      {day}
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
