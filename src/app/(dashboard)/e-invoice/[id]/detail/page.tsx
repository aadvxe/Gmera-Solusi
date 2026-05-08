"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeftIcon, DocumentDownloadIcon, EmailIcon, PrinterIcon, CheckCircleIcon } from "@astraicons/react/bold";
import { Button } from "@/components/ui/Button";
import { getInvoiceById, getCompanyProfile, CompanyProfile, Invoice } from "@/lib/db";
import { toast } from "sonner";

export default function DetailInvoicePage() {
  const params = useParams();
  const invoiceId = params.id as string;
  
  const [loading, setLoading] = useState(true);
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [company, setCompany] = useState<CompanyProfile | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [invData, compData] = await Promise.all([
          getInvoiceById(invoiceId),
          getCompanyProfile()
        ]);
        
        if (!invData) {
          toast.error("Invoice tidak ditemukan");
        } else {
          setInvoice(invData);
        }
        setCompany(compData);
      } catch (error) {
        console.error("Error fetching detail:", error);
        toast.error("Terjadi kesalahan saat mengambil data");
      } finally {
        setLoading(false);
      }
    };
    
    if (invoiceId) fetchData();
  }, [invoiceId]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount);
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return <div className="p-10 text-center text-gray-500">Memuat data invoice...</div>;
  }

  if (!invoice) {
    return (
      <div className="p-10 text-center">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Invoice tidak ditemukan</h2>
        <Link href="/e-invoice">
          <Button variant="outline">Kembali ke Daftar Invoice</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-20">
      {/* Header Actions - Hidden when printing */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 print:hidden">
        <div className="flex items-center gap-4">
          <Link href="/e-invoice">
            <button className="p-2 bg-surface border border-border rounded-xl hover:bg-background transition-colors text-text-secondary">
              <ArrowLeftIcon className="w-5 h-5" />
            </button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-text-primary">Detail Invoice</h1>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-sm text-text-secondary">{invoice.invoice_number}</span>
              <span className={`px-2 py-0.5 rounded text-xs font-semibold ${
                invoice.status === 'paid' ? 'bg-[#3CD856]/10 text-[#3CD856]' : 
                invoice.status === 'overdue' ? 'bg-[#FA5A7D]/10 text-[#FA5A7D]' : 
                invoice.status === 'cancelled' ? 'bg-gray-100 text-gray-500' :
                'bg-[#FF947A]/10 text-[#FF947A]'
              }`}>
                {invoice.status === 'paid' ? 'LUNAS' : 
                 invoice.status === 'overdue' ? 'JATUH TEMPO' : 
                 invoice.status === 'cancelled' ? 'DIBATALKAN' : 'BELUM BAYAR'}
              </span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Button variant="outline" className="flex-1 sm:flex-none flex items-center justify-center gap-2">
            <EmailIcon className="w-4 h-4" /> Kirim
          </Button>
          <Button variant="outline" className="flex-1 sm:flex-none flex items-center justify-center gap-2">
            <DocumentDownloadIcon className="w-4 h-4" /> PDF
          </Button>
          <Button onClick={handlePrint} className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-[#5C67F2] hover:bg-[#4a55c2] text-white">
            <PrinterIcon className="w-4 h-4" /> Cetak
          </Button>
        </div>
      </div>

      {/* Invoice Document */}
      <div className="bg-white border border-gray-200 shadow-sm p-8 md:p-12 print:border-none print:shadow-none print:p-0">
        
        {/* Invoice Header */}
        <div className="flex flex-col md:flex-row justify-between items-start border-b border-gray-100 pb-8 mb-8 gap-6 md:gap-0">
          <div>
            <h2 className="text-2xl font-bold text-[#151D48] mb-1">{company?.company_name || 'PT GMera Solusi'}</h2>
            <p className="text-sm text-gray-500 max-w-xs">{company?.address || 'Jl. Teknologi No. 123, Jakarta'}</p>
            {company?.npwp && <p className="text-sm text-gray-500 mt-1">NPWP: {company.npwp}</p>}
            <p className="text-sm text-gray-500 mt-1">{company?.phone || '021-12345678'} • {company?.email || 'finance@gmera.com'}</p>
          </div>
          <div className="text-left md:text-right">
            <h1 className="text-4xl font-bold text-[#5C67F2] uppercase tracking-wider mb-2">INVOICE</h1>
            <p className="text-[#151D48] font-semibold">{invoice.invoice_number}</p>
            <div className="mt-4 grid grid-cols-2 gap-x-4 gap-y-1 text-sm text-gray-600 text-left md:text-right">
              <span className="font-medium text-gray-400">Tanggal Terbit:</span>
              <span>{new Date(invoice.invoice_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
              <span className="font-medium text-gray-400">Jatuh Tempo:</span>
              <span className={invoice.status === 'overdue' ? 'text-[#FA5A7D] font-bold' : ''}>
                {new Date(invoice.due_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
              </span>
            </div>
          </div>
        </div>

        {/* Billed To */}
        <div className="mb-8">
          <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-2">DITAGIHKAN KEPADA:</h3>
          <h4 className="text-lg font-bold text-[#151D48]">{invoice.client_name}</h4>
          {invoice.client_address && <p className="text-sm text-gray-600 mt-1 max-w-xs">{invoice.client_address}</p>}
          {(invoice.client_phone || invoice.client_email) && (
            <p className="text-sm text-gray-600 mt-1">
              {[invoice.client_phone, invoice.client_email].filter(Boolean).join(' • ')}
            </p>
          )}
        </div>

        {/* Invoice Items Table */}
        <div className="mb-8 overflow-hidden rounded-xl border border-gray-100">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 border-b border-gray-100 text-[#151D48]">
              <tr>
                <th className="px-4 py-3 font-semibold">Deskripsi Barang/Jasa</th>
                <th className="px-4 py-3 font-semibold text-center w-24">Qty</th>
                <th className="px-4 py-3 font-semibold text-right w-40">Harga (Rp)</th>
                <th className="px-4 py-3 font-semibold text-right w-40">Total (Rp)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-gray-600">
              {invoice.invoice_items?.map((item: any) => (
                <tr key={item.id}>
                  <td className="px-4 py-3">{item.description}</td>
                  <td className="px-4 py-3 text-center">{item.quantity} {item.unit}</td>
                  <td className="px-4 py-3 text-right tabular-nums">{formatCurrency(item.unit_price).replace('Rp', '').trim()}</td>
                  <td className="px-4 py-3 text-right tabular-nums font-medium text-[#151D48]">{formatCurrency(item.total_price).replace('Rp', '').trim()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Totals & Payment Info */}
        <div className="flex flex-col md:flex-row justify-between gap-8 mb-8">
          
          <div className="flex-1">
            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-2">INFORMASI PEMBAYARAN:</h3>
            <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
              <p className="font-semibold text-[#151D48] mb-1">Transfer Bank:</p>
              <p className="text-sm text-gray-600">Bank: <span className="font-medium text-[#151D48]">{company?.bank_name || '-'}</span></p>
              <p className="text-sm text-gray-600">No. Rekening: <span className="font-medium text-[#151D48]">{company?.bank_account || '-'}</span></p>
              <p className="text-sm text-gray-600">Atas Nama: <span className="font-medium text-[#151D48]">{company?.bank_account_name || '-'}</span></p>
            </div>
            {invoice.notes && (
              <div className="mt-4">
                <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-1">CATATAN:</h3>
                <p className="text-sm text-gray-600 whitespace-pre-wrap">{invoice.notes}</p>
              </div>
            )}
          </div>
          
          <div className="w-full md:w-72">
            <div className="space-y-3 text-sm text-gray-600">
              <div className="flex justify-between items-center">
                <span>Subtotal</span>
                <span className="font-medium text-[#151D48]">{formatCurrency(invoice.subtotal)}</span>
              </div>
              
              {invoice.discount_amount > 0 && (
                <div className="flex justify-between items-center">
                  <span>Diskon</span>
                  <span className="font-medium text-[#FA5A7D]">-{formatCurrency(invoice.discount_amount)}</span>
                </div>
              )}
              
              {invoice.tax_amount > 0 && (
                <div className="flex justify-between items-center">
                  <span>Pajak ({invoice.tax_rate}%)</span>
                  <span className="font-medium text-[#151D48]">{formatCurrency(invoice.tax_amount)}</span>
                </div>
              )}
              
              {invoice.shipping_cost > 0 && (
                <div className="flex justify-between items-center">
                  <span>Ongkos Kirim</span>
                  <span className="font-medium text-[#151D48]">{formatCurrency(invoice.shipping_cost)}</span>
                </div>
              )}
              
              <div className="pt-3 mt-3 border-t border-gray-200 flex justify-between items-center">
                <span className="font-bold text-base text-[#151D48]">TOTAL AKHIR</span>
                <span className="font-bold text-xl text-[#5C67F2]">{formatCurrency(invoice.grand_total)}</span>
              </div>
            </div>

            {invoice.status === 'paid' && (
              <div className="mt-6 flex items-center justify-center gap-2 py-3 bg-[#3CD856]/10 text-[#3CD856] rounded-xl border border-[#3CD856]/20 font-bold uppercase tracking-wider">
                <CheckCircleIcon className="w-5 h-5" />
                Lunas
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="pt-8 border-t border-gray-100 text-center text-sm text-gray-400">
          <p>Terima kasih atas kepercayaan Anda kepada {company?.company_name || 'kami'}.</p>
        </div>

      </div>

      {/* Print styles */}
      <style dangerouslySetInnerHTML={{__html: `
        @media print {
          body { background-color: white; }
          nav, aside, header { display: none !important; }
          main { padding: 0 !important; margin: 0 !important; }
          @page { margin: 1.5cm; }
        }
      `}} />
    </div>
  );
}
