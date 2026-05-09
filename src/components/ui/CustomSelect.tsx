"use client";

import React, { useState, useRef, useEffect } from "react";
import { ChevronDownIcon } from "@astraicons/react/bold";
import { cn } from "@/lib/utils";

interface Option {
  value: string;
  label: string;
}

interface CustomSelectProps {
  options: Option[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  triggerClassName?: string;
}

export function CustomSelect({
  options,
  value,
  onChange,
  placeholder = "Pilih...",
  className = "",
  triggerClassName = "",
}: CustomSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
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

  const selectedOption = options.find(opt => opt.value === value);

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
        <div className="absolute z-[100] mt-2 w-full bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-gray-100 overflow-hidden">
          <ul className="max-h-60 overflow-auto py-1">
            {options.length === 0 ? (
              <li className="px-4 py-3 text-sm text-gray-500 text-center italic">Tidak ada opsi</li>
            ) : (
              options.map((option) => (
                <li
                  key={option.value}
                  onClick={() => {
                    onChange(option.value);
                    setIsOpen(false);
                  }}
                  className={cn(
                    "px-4 py-2.5 text-sm cursor-pointer transition-colors select-none",
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
