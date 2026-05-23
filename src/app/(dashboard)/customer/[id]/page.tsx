"use client";

import React, { useState, use } from "react";
import Link from "next/link";
import { ArrowLeftIcon, EditIcon, CallIcon, EmailIcon, DocumentNextIcon, MoneyIcon } from "@astraicons/react/bold";
import { formatCurrency } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/Table";
import { useAuthStore } from "@/store/authStore";

const MOCK_CLIENT_DETAIL = {
  id: "1", 
  name: "PT Maju Sejahtera", 
  npwp: "01.234.567.8-901.000", 
  address: "Jl. Sudirman No. 12, Jakarta Pusat, DKI Jakarta 10220", 
  phone: "0812-3456-7890", 
  email: "info@majusejahtera.com", 
  notes: "Customer VIP, berikan respon cepat untuk setiap permintaan quotation.",
  totalInvoices: 12, 
  totalValue: 150000000,
  paidCount: 8,
  unpaidCount: 4,
  unpaidAmount: 35000000
};

const MOCK_INVOICE_HISTORY = [
  { id: "INV-025", date: "20 Jan 2026", total: 10000000, status: "Belum Bayar" },
  { id: "INV-021", date: "15 Jan 2026", total: 15000000, status: "Lunas" },
  { id: "INV-018", date: "05 Jan 2026", total: 5500000, status: "Belum Bayar" },
  { id: "INV-010", date: "10 Des 2025", total: 25000000, status: "Lunas" },
];

export default function CustomerDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const role = useAuthStore(state => state.role);

  if (role === 'viewer') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] p-8 text-center bg-white rounded-2xl shadow-sm border border-gray-100">
        <h2 className="text-xl font-bold text-text-primary mb-2">Akses Ditolak</h2>
        <p className="text-sm text-text-secondary">Anda tidak memiliki hak akses untuk membuka halaman Customer.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/customer" className="p-2 text-text-secondary hover:bg-surface rounded-lg transition-colors border border-border">
            <ArrowLeftIcon className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-text-primary">Detail Customer</h1>
          </div>
        </div>
        <Button className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground">
          <EditIcon className="w-4 h-4" /> Edit Profil Customer
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Kolom Kiri: Profil */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-surface border border-border rounded-2xl shadow-sm overflow-hidden">
            <div className="p-6">
              <div className="w-16 h-16 bg-primary/10 text-primary rounded-xl flex items-center justify-center font-bold text-2xl mb-4">
                {MOCK_CLIENT_DETAIL.name.substring(0, 2).toUpperCase()}
              </div>
              <h2 className="text-xl font-bold text-text-primary mb-1">{MOCK_CLIENT_DETAIL.name}</h2>
              <p className="text-sm text-text-secondary mb-6">NPWP: {MOCK_CLIENT_DETAIL.npwp}</p>
              
              <div className="space-y-4">
                <div>
                  <h4 className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-2">Kontak</h4>
                  <div className="flex flex-col gap-2 text-sm text-text-secondary">
                    <span className="flex items-center gap-2"><CallIcon className="w-4 h-4" /> {MOCK_CLIENT_DETAIL.phone}</span>
                    <span className="flex items-center gap-2"><EmailIcon className="w-4 h-4" /> {MOCK_CLIENT_DETAIL.email}</span>
                  </div>
                </div>
                
                <div className="pt-4 border-t border-border">
                  <h4 className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-2">Alamat</h4>
                  <p className="text-sm text-text-secondary leading-relaxed">
                    {MOCK_CLIENT_DETAIL.address}
                  </p>
                </div>

                {MOCK_CLIENT_DETAIL.notes && (
                  <div className="pt-4 border-t border-border">
                    <h4 className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-2">Catatan</h4>
                    <p className="text-sm text-text-secondary italic">
                      "{MOCK_CLIENT_DETAIL.notes}"
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Kolom Kanan: Statistik & Riwayat */}
        <div className="lg:col-span-2 space-y-6">
          {/* Ringkasan */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-surface p-6 rounded-2xl border border-border shadow-sm flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-info/10 text-info flex items-center justify-center shrink-0">
                <DocumentNextIcon className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm text-text-secondary font-medium">Total Invoice</p>
                <div className="flex items-baseline gap-2">
                  <h3 className="text-2xl font-bold text-text-primary">{MOCK_CLIENT_DETAIL.totalInvoices}</h3>
                  <span className="text-sm text-success">{MOCK_CLIENT_DETAIL.paidCount} Lunas</span>
                </div>
              </div>
            </div>
            
            <div className="bg-surface p-6 rounded-2xl border border-border shadow-sm flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-danger/10 text-danger flex items-center justify-center shrink-0">
                <MoneyIcon className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm text-text-secondary font-medium">Piutang Berjalan</p>
                <div className="flex items-baseline gap-2">
                  <h3 className="text-2xl font-bold text-text-primary">{formatCurrency(MOCK_CLIENT_DETAIL.unpaidAmount)}</h3>
                </div>
                <p className="text-xs text-text-muted mt-1">Dari {MOCK_CLIENT_DETAIL.unpaidCount} invoice belum lunas</p>
              </div>
            </div>
          </div>

          {/* Tabel Riwayat */}
          <div className="bg-surface border border-border rounded-2xl shadow-sm overflow-hidden flex flex-col">
            <div className="p-6 border-b border-border flex items-center justify-between">
              <h3 className="font-bold text-text-primary text-lg">Riwayat Invoice Terakhir</h3>
              <Button variant="outline" size="sm">Lihat Semua</Button>
            </div>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>No. Invoice</TableHead>
                    <TableHead>Tanggal</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                    <TableHead className="text-center">Status</TableHead>
                    <TableHead className="text-right">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {MOCK_INVOICE_HISTORY.map((inv) => (
                    <TableRow key={inv.id}>
                      <TableCell className="font-semibold text-text-primary">{inv.id}</TableCell>
                      <TableCell className="text-text-secondary">{inv.date}</TableCell>
                      <TableCell className="text-right font-medium">{formatCurrency(inv.total)}</TableCell>
                      <TableCell className="text-center">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${
                          inv.status === 'Lunas' 
                            ? 'bg-success/10 text-success border-success/20' 
                            : 'bg-warning/10 text-warning border-warning/20'
                        }`}>
                          {inv.status}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <Link href={`/e-invoice/${inv.id.replace('INV-', '')}`}>
                          <Button variant="outline" size="sm" className="h-8 px-3 text-xs">Detail</Button>
                        </Link>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
