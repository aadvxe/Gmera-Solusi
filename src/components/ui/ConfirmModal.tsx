"use client";

// Import React hook yang dipakai modal konfirmasi untuk aksi berisiko seperti logout atau hapus data, misalnya untuk state, efek setelah render, atau referensi elemen.
import React from "react";
// Import Modal sebagai wadah overlay yang dipakai ConfirmModal untuk dialog konfirmasi.
import { Modal } from "./Modal";
// Import ikon yang dipakai modal konfirmasi untuk aksi berisiko seperti logout atau hapus data untuk memperjelas tombol, menu, status, dan aksi di layar.
import { CloseCircleIcon, PricingAlertIcon, HelpIcon } from "@astraicons/react/bold";

// Interface ini menjelaskan field yang dipakai modal konfirmasi untuk aksi berisiko seperti logout atau hapus data supaya data form/database tidak salah bentuk.
interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  isDanger?: boolean;
  isHelp?: boolean;
  isLoading?: boolean;
}

// ConfirmModal menampilkan pertanyaan sebelum aksi penting benar-benar dijalankan.
export function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmText = "Konfirmasi",
  cancelText = "Batal",
  isDanger = false,
  isHelp = false,
  isLoading = false,
}: ConfirmModalProps) {
  // ConfirmModal menampilkan UI untuk modal konfirmasi untuk aksi berisiko seperti logout atau hapus data.
  return (
    <Modal isOpen={isOpen} onClose={isLoading ? () => {} : onClose}>
      <div className="bg-surface rounded-2xl w-full max-w-md p-6 shadow-xl border border-border">
        <div className="flex flex-col items-center text-center">
          <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 ${
            isDanger 
              ? 'bg-danger/10 text-danger' 
              : isHelp 
                ? 'bg-primary/10 text-primary' 
                : 'bg-warning/10 text-warning'
          }`}>
            {isDanger ? (
              <CloseCircleIcon className="w-8 h-8" />
            ) : isHelp ? (
              <HelpIcon className="w-8 h-8" />
            ) : (
              <PricingAlertIcon className="w-8 h-8" />
            )}
          </div>
          <h3 className="text-xl font-bold text-text-primary mb-2">{title}</h3>
          <p className="text-sm text-text-secondary mb-6">{description}</p>
          
          <div className="flex gap-3 w-full">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="flex-1 px-4 py-2.5 rounded-lg border border-border text-sm font-medium text-text-primary hover:bg-background transition-colors disabled:opacity-50"
            >
              {cancelText}
            </button>
            <button
              type="button"
              onClick={onConfirm}
              disabled={isLoading}
              className={`flex-1 px-4 py-2.5 rounded-lg text-sm font-bold transition-colors disabled:opacity-70 ${
                isDanger 
                  ? 'bg-danger text-danger-foreground hover:bg-danger/90' 
                  : 'bg-primary text-primary-foreground hover:bg-primary/90'
              }`}
            >
              {isLoading ? "Memproses..." : confirmText}
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
}
