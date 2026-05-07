"use client";

import { Toaster as SonnerToaster } from "sonner";

export function Toaster() {
  return (
    <SonnerToaster 
      position="top-right" 
      toastOptions={{
        className: 'rounded-xl border border-border shadow-md font-sans',
        style: {
          background: 'var(--surface)',
          color: 'var(--text-primary)',
        }
      }} 
    />
  );
}
