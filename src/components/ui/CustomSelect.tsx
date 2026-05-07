"use client";

import React, { useState, useRef, useEffect } from "react";
import { ChevronDownIcon } from "@astraicons/react/bold";

export interface Option {
  value: string;
  label: string;
}

interface CustomSelectProps {
  options: Option[];
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
  triggerClassName?: string;
  dropdownClassName?: string;
}

export function CustomSelect({ 
  options, 
  value, 
  onChange, 
  placeholder = "Pilih...", 
  triggerClassName = "w-full bg-[#F9FAFB] border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-700",
  dropdownClassName = "mt-2"
}: CustomSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find(opt => opt.value === value);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative w-full" ref={dropdownRef}>
      <div 
        className={`flex items-center justify-between cursor-pointer transition-all select-none ${triggerClassName} ${isOpen ? 'ring-2 ring-[#5C67F2]/20 border-[#5C67F2]' : ''}`}
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className={`truncate ${selectedOption ? "" : "text-gray-400"}`}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <ChevronDownIcon className={`w-4 h-4 text-gray-400 transition-transform shrink-0 ml-2 ${isOpen ? 'rotate-180' : ''}`} />
      </div>

      {isOpen && (
        <div className={`absolute z-[100] w-full bg-white border border-gray-100 rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] overflow-hidden ${dropdownClassName}`}>
          <ul className="max-h-60 overflow-auto py-1">
            {options.map((option) => (
              <li 
                key={option.value}
                className={`px-4 py-2.5 text-sm cursor-pointer transition-colors select-none ${value === option.value ? 'bg-[#5C67F2]/10 text-[#5C67F2] font-medium' : 'text-gray-700 hover:bg-gray-50'}`}
                onClick={() => {
                  onChange(option.value);
                  setIsOpen(false);
                }}
              >
                {option.label}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
