"use client";

import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

export function Modal({ isOpen, onClose, children }: ModalProps) {
  const [shouldRender, setShouldRender] = useState(isOpen);
  const [isClosing, setIsClosing] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setShouldRender(true);
      setIsClosing(false);
      document.body.style.overflow = "hidden";
    } else {
      setIsClosing(true);
      const timer = setTimeout(() => {
        setShouldRender(false);
        document.body.style.overflow = "";
      }, 200); // match animation duration
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  if (!shouldRender || typeof window === "undefined") return null;

  return createPortal(
    <>
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes modal-backdrop-in {
          from { opacity: 0; backdrop-filter: blur(0px); }
          to { opacity: 1; backdrop-filter: blur(4px); }
        }
        @keyframes modal-backdrop-out {
          from { opacity: 1; backdrop-filter: blur(4px); }
          to { opacity: 0; backdrop-filter: blur(0px); }
        }
        @keyframes modal-content-in {
          from { opacity: 0; transform: scale(0.95) translateY(10px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }
        @keyframes modal-content-out {
          from { opacity: 1; transform: scale(1) translateY(0); }
          to { opacity: 0; transform: scale(0.95) translateY(10px); }
        }
        .modal-backdrop-in { animation: modal-backdrop-in 0.2s ease-out forwards; }
        .modal-backdrop-out { animation: modal-backdrop-out 0.2s ease-in forwards; }
        .modal-content-in { animation: modal-content-in 0.2s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        .modal-content-out { animation: modal-content-out 0.2s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
      `}} />
      <div
        className={`fixed inset-0 z-[9999] flex items-center justify-center overflow-y-auto p-3 sm:p-4 bg-black/50 backdrop-blur-sm ${
          isClosing ? "modal-backdrop-out" : "modal-backdrop-in"
        }`}
        onClick={(e) => {
          if (e.target === e.currentTarget) onClose();
        }}
      >
        <div
          className={`w-full max-w-full flex items-center justify-center ${
            isClosing ? "modal-content-out" : "modal-content-in"
          }`}
          onClick={(e) => e.stopPropagation()}
        >
          {children}
        </div>
      </div>
    </>,
    document.body
  );
}
