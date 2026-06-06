"use client";

// Import React hook yang dipakai modal portal yang mengunci scroll halaman dan memberi animasi buka/tutup, misalnya untuk state, efek setelah render, atau referensi elemen.
import React, { useEffect, useState } from "react";
// Import createPortal agar Modal bisa dirender di body, bukan terkunci di posisi parent component.
import { createPortal } from "react-dom";

// Interface ini menjelaskan field yang dipakai modal portal yang mengunci scroll halaman dan memberi animasi buka/tutup supaya data form/database tidak salah bentuk.
interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

// Modal menampilkan konten di atas halaman, menutup scroll body, lalu mengembalikan scroll saat modal ditutup.
export function Modal({ isOpen, onClose, children }: ModalProps) {
  // shouldRender menjaga modal tetap ada sebentar agar animasi tutup terlihat.
  const [shouldRender, setShouldRender] = useState(isOpen);
  // isClosing menandai modal sedang animasi keluar sebelum benar-benar dihapus dari DOM.
  const [isClosing, setIsClosing] = useState(false);

  // Separate effect for absolute cleanup on unmount
  useEffect(() => {
    // Modal menampilkan UI untuk modal portal yang mengunci scroll halaman dan memberi animasi buka/tutup.
    return () => {
      document.body.style.overflow = "";
      document.body.style.paddingRight = "";
    };
  }, []);

  // Effect ini menyambungkan modal portal yang mengunci scroll halaman dan memberi animasi buka/tutup dengan hal di luar render React, seperti database, ukuran layar, timer, atau event browser.
  useEffect(() => {
    let timer: NodeJS.Timeout;
    // Kondisi ini menentukan apakah panel/modal/dropdown perlu ditampilkan atau disembunyikan.
    if (isOpen) {
      setShouldRender(true);
      setIsClosing(false);
      
      // Calculate scrollbar width to prevent page layout jiggle
      const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
      document.body.style.overflow = "hidden";
      // Kondisi if (scrollbarWidth > 0) membuat isi blok if di bawahnya hanya berjalan saat kondisi itu benar di Modal.
      if (scrollbarWidth > 0) {
        document.body.style.paddingRight = `${scrollbarWidth}px`;
      }
    } else {
      setIsClosing(true);
      timer = setTimeout(() => {
        setShouldRender(false);
        document.body.style.overflow = "";
        document.body.style.paddingRight = "";
      }, 200); // match animation duration
    }

    // Modal menampilkan UI untuk modal portal yang mengunci scroll halaman dan memberi animasi buka/tutup.
    return () => {
      // Kondisi if (timer) clearTimeout(timer); membuat isi blok if di bawahnya hanya berjalan saat kondisi itu benar di Modal.
      if (timer) clearTimeout(timer);
    };
  }, [isOpen]);

  // Kalau modal sudah selesai ditutup, Modal mengembalikan null supaya tidak ada overlay tersisa di DOM.
  if (!shouldRender || typeof window === "undefined") return null;

  // scrollbarWidth mengembalikan nilai yang dibutuhkan oleh Modal.
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
          // Kondisi if (e.target === e.currentTarget) onClose(); membuat isi blok if di bawahnya hanya berjalan saat kondisi itu benar di Modal.
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
