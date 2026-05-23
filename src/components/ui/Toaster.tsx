"use client";

import { Toaster as SonnerToaster } from "sonner";
import { StatusUpIcon, ArrowDownIcon, DocumentIcon, SettingsIcon, HelpIcon } from "@astraicons/react/bold";

export function Toaster() {
  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: `
        [data-sonner-toast] {
          transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.4s, height 0.4s, box-shadow 0.4s;
          font-family: var(--font-poppins), sans-serif !important;
          user-select: none;
          touch-action: none;
        }
        [data-sonner-toast][data-swiping="true"] {
          transition: none !important;
        }
        [data-sonner-toaster] {
          z-index: 9500 !important;
        }
        [data-sonner-toaster][data-x-position="right"] {
          right: 8px !important;
        }
        @media (max-width: 640px) {
          [data-sonner-toaster] {
            left: 8px !important;
            right: 8px !important;
            width: auto !important;
          }
          [data-sonner-toast] {
            width: 100% !important;
          }
        }
        [data-sonner-toast][data-mounted="false"] {
          transform: translate3d(0, var(--y), 0) scale(var(--scale)) !important;
        }
        [data-sonner-toast][data-mounted="true"]:not([data-removed="true"]) {
          animation: slide-in-x 0.4s cubic-bezier(0.16, 1, 0.3, 1);
        }
        [data-sonner-toast][data-removed="true"] {
          animation: slide-out-x 0.4s ease-in forwards !important;
        }
        @keyframes slide-in-x {
          from { translate: 150% 0; opacity: 0; }
          to { translate: 0 0; opacity: 1; }
        }
        @keyframes slide-out-x {
          from { 
            translate: 0 0; 
            opacity: 1; 
            transform: translate3d(0, var(--y), 0) scale(var(--scale)); 
          }
          to { 
            translate: 150% 0; 
            opacity: 0; 
            transform: translate3d(0, var(--y), 0) scale(var(--scale)); 
          }
        }
      `}} />
      <SonnerToaster 
        position="top-right" 
        offset={85}
        closeButton
        icons={{
          success: <div className="w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center bg-[#76c893]/10 text-[#76c893]"><ArrowDownIcon className="w-5 h-5" /></div>,
          error: <div className="w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center bg-[#FA5A7D]/10 text-[#FA5A7D]"><HelpIcon className="w-5 h-5" /></div>,
          info: <div className="w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center bg-[#5C67F2]/10 text-[#5C67F2]"><DocumentIcon className="w-5 h-5" /></div>,
          warning: <div className="w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center bg-[#FF9F43]/10 text-[#FF9F43]"><SettingsIcon className="w-5 h-5" /></div>,
        }}
        toastOptions={{
          unstyled: true,
          classNames: {
            toast: 'bg-white border border-gray-100 shadow-[0_12px_40px_rgba(0,0,0,0.08)] rounded-[20px] w-[350px] max-w-full flex items-center gap-4 p-4 relative pointer-events-auto',
            content: 'flex flex-col gap-0.5',
            title: 'text-[15px] font-bold text-[#151D48]',
            description: 'text-[13px] font-medium text-gray-500',
            actionButton: 'bg-[#5C67F2] text-white rounded-xl text-xs font-bold px-4 py-2 mt-2',
            cancelButton: 'bg-gray-100 text-gray-700 rounded-xl text-xs font-bold px-4 py-2 mt-2',
            closeButton: 'absolute -top-1.5 -left-1.5 bg-white border border-gray-100 shadow-sm rounded-full w-5 h-5 flex items-center justify-center text-gray-400 hover:text-red-500 transition-colors z-50',
          }
        }} 
      />
    </>
  );
}
