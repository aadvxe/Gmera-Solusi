"use client";

// Import React hook yang dipakai halaman preview invoice yang sudah tersimpan dan siap dicetak/export, misalnya untuk state, efek setelah render, atau referensi elemen.
import React, { useState, useEffect } from "react";
// Import Link supaya menu/tombol di halaman preview invoice yang sudah tersimpan dan siap dicetak/export bisa berpindah halaman tanpa reload penuh.
import Link from "next/link";
// Import alat navigasi Next.js supaya halaman preview invoice yang sudah tersimpan dan siap dicetak/export bisa pindah halaman atau membaca route aktif.
import { useParams } from "next/navigation";
// Import ikon yang dipakai halaman preview invoice yang sudah tersimpan dan siap dicetak/export untuk memperjelas tombol, menu, status, dan aksi di layar.
import { ArrowLeftIcon, DocumentDownloadIcon, EmailIcon, PrinterIcon, CheckCircleIcon, HelpIcon, ArrowDownIcon } from "@astraicons/react/bold";
// Import komponen UI reusable supaya halaman preview invoice yang sudah tersimpan dan siap dicetak/export memakai tampilan tombol, modal, input, atau tabel yang konsisten.
import { Button } from "@/components/ui/Button";
// Import helper database yang dipakai halaman preview invoice yang sudah tersimpan dan siap dicetak/export untuk mengambil atau menyimpan data Supabase.
import { getInvoiceById, getCompanyProfile, CompanyProfile, Invoice } from "@/lib/db";
// Import helper database yang dipakai halaman preview invoice yang sudah tersimpan dan siap dicetak/export untuk mengambil atau menyimpan data Supabase.
import { createAuditLog } from "@/lib/db/users";
// Import authStore supaya halaman preview invoice yang sudah tersimpan dan siap dicetak/export bisa membaca user login, role, nama tampilan, atau mengosongkan session saat logout.
import { useAuthStore } from "@/store/authStore";
// Import Sonner untuk menampilkan toast sukses/error di halaman preview invoice yang sudah tersimpan dan siap dicetak/export.
import { toast } from "sonner";
// Import utility project supaya halaman preview invoice yang sudah tersimpan dan siap dicetak/export bisa memformat class Tailwind atau angka Rupiah dengan cara yang sama.
import { formatCurrency } from "@/lib/utils";
// Import SkeletonDetail untuk loading state detail yang premium.
import { SkeletonDetail } from "@/components/ui/Skeleton";

/** Accounting number: 1.234.567,00 */
function fmtNum(v: number): string {
  // fmtAccounting mengubah angka menjadi format Indonesia dengan dua desimal untuk laporan akuntansi.
  return new Intl.NumberFormat('id-ID', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(v);
}

// splitAddress memecah alamat panjang menjadi beberapa bagian supaya muat rapi di tampilan invoice.
function splitAddress(addressStr: string) {
  // Kondisi if (!addressStr) return { line1: "", line2: "" }; membuat isi blok if di bawahnya hanya berjalan saat kondisi itu benar di halaman detail invoice.
  if (!addressStr) return { line1: "", line2: "" };
  const normalized = addressStr.replace(/\n/g, "\n");
  const lastNewlineIndex = normalized.lastIndexOf("\n");
  // Kondisi if (lastNewlineIndex !== -1) membuat isi blok if di bawahnya hanya berjalan saat kondisi itu benar di halaman detail invoice.
  if (lastNewlineIndex !== -1) {
    const line1 = normalized.substring(0, lastNewlineIndex).trim();
    const line2 = normalized.substring(lastNewlineIndex + 1).trim();
    // splitAddress mengirim dua baris alamat agar preview invoice bisa menata alamat customer dengan rapi.
    return { line1, line2 };
  }
  const lastCommaIndex = normalized.lastIndexOf(",");
  // Kondisi if (lastCommaIndex === -1) membuat isi blok if di bawahnya hanya berjalan saat kondisi itu benar di halaman detail invoice.
  if (lastCommaIndex === -1) {
    // splitAddress mengirim dua baris alamat agar preview invoice bisa menata alamat customer dengan rapi.
    return { line1: normalized, line2: "" };
  }
  const line1 = normalized.substring(0, lastCommaIndex + 1).trim();
  const line2 = normalized.substring(lastCommaIndex + 1).trim();
  // splitAddress mengirim dua baris alamat agar preview invoice bisa menata alamat customer dengan rapi.
  return { line1, line2 };
}

// Interface ini menjelaskan field yang dipakai halaman preview invoice yang sudah tersimpan dan siap dicetak/export supaya data form/database tidak salah bentuk.
interface PageData {
  pageNumber: number;
  items: any[];
  isLastPage: boolean;
}

// getPages mengambil atau menghitung data yang dibutuhkan halaman preview invoice yang sudah tersimpan dan siap dicetak/export.
function getPages(itemsList: any[]): PageData[] {
  // Kondisi ini mengecek jumlah item agar daftar kosong, pagination, atau total bisa ditangani dengan benar.
  if (!itemsList || itemsList.length === 0) {
    // getPages mengembalikan hasil untuk halaman detail invoice, sesuai data yang dihitung tepat sebelum baris return ini.
    return [{ pageNumber: 1, items: [], isLastPage: true }];
  }
  const pages: PageData[] = [];
  const remaining = [...itemsList];
  let pageNum = 1;
  while (remaining.length > 0) {
    const isFirst = pageNum === 1;
    const limitWithSummary = 3;
    // Kalau pemanggil memberi batas jumlah data, query Supabase dibatasi supaya tidak mengambil terlalu banyak baris.
    if (remaining.length <= limitWithSummary) {
      pages.push({
        pageNumber: pageNum,
        items: remaining,
        isLastPage: true
      });
      break;
    }
    const limitNoSummary = 5;
    let itemsToTake = limitNoSummary;
    // Kondisi ini mengecek jumlah item agar daftar kosong, pagination, atau total bisa ditangani dengan benar.
    if (remaining.length - itemsToTake < 1) {
      itemsToTake = remaining.length - 1;
    }
    pages.push({
      pageNumber: pageNum,
      items: remaining.splice(0, itemsToTake),
      isLastPage: false
    });
    pageNum++;
  }
  // limitNoSummary mengembalikan hasil untuk halaman detail invoice, sesuai data yang dihitung tepat sebelum baris return ini.
  return pages;
}

// DetailInvoicePage mengambil invoice berdasarkan id lalu menyusunnya sebagai preview dokumen invoice.
export default function DetailInvoicePage() {
  const params = useParams();
  const invoiceId = params.id as string;
  
  // loading menyimpan nilai loading yang berubah saat user berinteraksi dengan halaman preview invoice yang sudah tersimpan dan siap dicetak/export.
  const [loading, setLoading] = useState(true);
  const user = useAuthStore(state => state.user);
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [company, setCompany] = useState<CompanyProfile | null>(null);

  // Effect ini mengambil data yang diperlukan halaman preview invoice yang sudah tersimpan dan siap dicetak/export saat halaman dibuka atau filter berubah.
  useEffect(() => {
    // fetchData mengambil data yang dibutuhkan halaman preview invoice yang sudah tersimpan dan siap dicetak/export dari Supabase lalu mengisi state halaman.
    const fetchData = async () => {
      setLoading(true);
      // try ini membaca atau menyimpan data invoice dari Supabase sesuai aksi user di halaman invoice.
      try {
        // await Promise.all menunggu beberapa query berjalan paralel sampai semuanya selesai.
        const [invData, compData] = await Promise.all([
          getInvoiceById(invoiceId),
          getCompanyProfile()
        ]);
        
        // Kondisi if (!invData) membuat isi blok if di bawahnya hanya berjalan saat kondisi itu benar di halaman detail invoice.
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
    
    // Kondisi if (invoiceId) fetchData(); membuat isi blok if di bawahnya hanya berjalan saat kondisi itu benar di halaman detail invoice.
    if (invoiceId) fetchData();
  }, [invoiceId]);

  // Auto-download if ?download=true is in URL
  useEffect(() => {
    // Kondisi if (!loading && invoice && typeof window !== 'undefined') membuat isi blok if di bawahnya hanya berjalan saat kondisi itu benar di halaman detail invoice.
    if (!loading && invoice && typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      // Kondisi if (urlParams.get('download') === 'true') membuat isi blok if di bawahnya hanya berjalan saat kondisi itu benar di halaman detail invoice.
      if (urlParams.get('download') === 'true') {
        // Remove the query param to prevent re-triggering if user refreshes
        const newUrl = window.location.pathname;
        window.history.replaceState({}, '', newUrl);
        
        // Small delay to ensure DOM is ready
        setTimeout(() => {
          handlePrint();
        }, 500);
      }
    }
  }, [loading, invoice]);

  // handlePrint adalah fungsi penangan aksi user; fungsi ini berjalan saat user mengklik, mengetik, memilih, atau submit sesuatu.
  const handlePrint = () => {
    window.print();
  };

  // Kondisi if (loading) membuat isi blok if di bawahnya hanya berjalan saat kondisi itu benar di halaman detail invoice.
  if (loading) {
    // fetchData menampilkan potongan UI yang dipakai di halaman preview invoice yang sudah tersimpan dan siap dicetak/export.
    return <SkeletonDetail />;
  }

  // Kondisi if (!invoice) membuat isi blok if di bawahnya hanya berjalan saat kondisi itu benar di halaman detail invoice.
  if (!invoice) {
    // fetchData menampilkan UI untuk halaman preview invoice yang sudah tersimpan dan siap dicetak/export.
    return (
      <div className="p-10 text-center">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Invoice tidak ditemukan</h2>
        <Link href="/e-invoice">
          <Button variant="outline">Kembali ke Daftar Invoice</Button>
        </Link>
      </div>
    );
  }
  const { line1, line2 } = splitAddress(invoice.client_address || "");
  const addressLine2Parts = [];
  // Kondisi if (invoice.clients?.city) addressLine2Parts.push(invoice.clients.city); membuat isi blok if di bawahnya hanya berjalan saat kondisi itu benar di halaman detail invoice.
  if (invoice.clients?.city) addressLine2Parts.push(invoice.clients.city);
  // Kondisi if (invoice.clients?.province) addressLine2Parts.push(invoice.clients.province); membuat isi blok if di bawahnya hanya berjalan saat kondisi itu benar di halaman detail invoice.
  if (invoice.clients?.province) addressLine2Parts.push(invoice.clients.province);
  // Kondisi if (invoice.clients?.postal_code) addressLine2Parts.push(invoice.clients.postal_code); membuat isi blok if di bawahnya hanya berjalan saat kondisi itu benar di halaman detail invoice.
  if (invoice.clients?.postal_code) addressLine2Parts.push(invoice.clients.postal_code);
  const cityProvincePostal = addressLine2Parts.join(", ");

  const clientAddressLine1 = line1;
  const clientAddressLine2 = line2 
    ? `${line2} ${cityProvincePostal}`.trim() 
    : cityProvincePostal;

  // fetchData menampilkan UI untuk halaman preview invoice yang sudah tersimpan dan siap dicetak/export.
  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-20 print:pb-0 print:space-y-0 print:max-w-none print:block">
      {/* Header Actions — hidden when printing */}
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
          <Button onClick={handlePrint} className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-[#5C67F2] hover:bg-[#4a55c2] text-white">
            <PrinterIcon className="w-4 h-4" /> Cetak
          </Button>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════════
           Invoice Document — This is what BOTH print and PDF capture render.
           It must be borderless/clean so the PDF doesn't get extra whitespace.
          ═══════════════════════════════════════════════════════════════════ */}
      {/* map ini membuat satu output untuk setiap item daftar yang sedang dirender oleh halaman detail invoice. */}
      {getPages(invoice.invoice_items || []).map((page) => (
        <div
          key={page.pageNumber}
          id="invoice-document"
          className="invoice-page-container bg-white border border-gray-200 shadow-md p-[6mm_10mm] print:border-none print:shadow-none print:p-[6mm_10mm] mx-auto mb-6 last:mb-0 flex flex-col justify-between"
          style={{
            width: '210mm',
            height: '148mm',
            boxSizing: 'border-box',
            overflow: 'hidden',
            position: 'relative'
          }}
        >
          <div>
            {/* Page Header */}
            {page.pageNumber === 1 ? (
              <div className="flex justify-between items-start border-b border-gray-100 pb-2 mb-2 gap-6">
                <div className="flex flex-row items-center gap-4">
                  {company?.logo_url ? (
                    <img src={company.logo_url} alt="Logo" className="h-16 w-auto object-contain max-w-[140px]" />
                  ) : (
                    <div className="w-16 h-16 bg-gray-50 rounded-xl flex items-center justify-center border border-gray-100 shrink-0">
                      <span className="text-[10px] text-gray-300 font-bold text-center">NO<br/>LOGO</span>
                    </div>
                  )}
                  <div className="flex flex-col justify-center text-left">
                    <h2 className="text-sm font-bold text-[#151D48] leading-tight">{company?.company_name || 'PT GMera Solusi'}</h2>
                    <p className="text-[10px] text-gray-500 max-w-xs mt-0.5 leading-tight">{company?.address || 'Jl. Teknologi No. 123, Jakarta'}</p>
                    <div className="flex flex-wrap gap-x-3 gap-y-0.5 mt-0.5">
                      {company?.npwp && <p className="text-[9px] text-gray-500 font-medium">NPWP: {company.npwp}</p>}
                      <p className="text-[9px] text-gray-500">{company?.phone || '021-12345678'} • {company?.email || 'finance@gmera.com'}</p>
                    </div>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <h1 className="text-lg font-bold text-[#5C67F2] uppercase tracking-wider">INVOICE</h1>
                  <p className="text-xs font-semibold text-[#151D48] mt-0.5">{invoice.invoice_number}</p>
                  <div className="mt-1 text-[9px] text-gray-600 space-y-0.5 text-right">
                    <p><span className="text-gray-400">Terbit:</span> {new Date(invoice.invoice_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                    <p>
                      <span className="text-gray-400">Jatuh Tempo:</span>{' '}
                      <span className={invoice.status === 'overdue' ? 'text-[#FA5A7D] font-bold' : ''}>
                        {new Date(invoice.due_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                      </span>
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              /* Minimal Header for Subsequent Pages */
              <div className="flex justify-between items-center border-b border-gray-100 pb-1.5 mb-2">
                <div className="flex items-center gap-2">
                  {company?.logo_url ? (
                    <img src={company.logo_url} alt="Logo" className="h-6 w-auto object-contain" />
                  ) : (
                    <span className="text-xs font-bold text-[#151D48]">PT GMera Solusi</span>
                  )}
                </div>
                <div className="text-right">
                  <span className="text-[9px] font-semibold text-gray-500">INVOICE {invoice.invoice_number} — Halaman {page.pageNumber}</span>
                </div>
              </div>
            )}

            {/* Billed To (Only on Page 1) */}
            {page.pageNumber === 1 && (
              <div className="mb-2 text-left">
                <h3 className="text-[9px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">DITAGIHKAN KEPADA:</h3>
                <h4 className="text-xs font-bold text-[#151D48]">{invoice.client_name}</h4>
                {clientAddressLine1 && <p className="text-[10px] text-gray-600 max-w-md">{clientAddressLine1}</p>}
                {clientAddressLine2 && <p className="text-[10px] text-gray-600 max-w-md">{clientAddressLine2}</p>}
                {(invoice.client_phone || invoice.client_email) && (
                  // filter(Boolean) membuang nilai kosong, misalnya nomor telepon/email yang tidak ada, sebelum teks digabung.
                  <p className="text-[9px] text-gray-600">{[invoice.client_phone, invoice.client_email].filter(Boolean).join(' • ')}</p>
                )}
              </div>
            )}

            {/* Items Table */}
            <div className="mb-2 overflow-hidden rounded-md">
              <table className="w-full text-[10px] text-left border-collapse">
                <thead>
                  <tr className="bg-[#5C67F2] text-white">
                    <th className="px-3 py-1 font-semibold">Deskripsi Barang / Jasa</th>
                    <th className="px-3 py-1 font-semibold text-center w-16">Qty</th>
                    <th className="px-3 py-1 font-semibold text-right w-24">Harga Satuan (Rp)</th>
                    <th className="px-3 py-1 font-semibold text-right w-28">Total (Rp)</th>
                  </tr>
                </thead>
                <tbody className="text-gray-700">
                  {/* map ini membuat satu baris tabel invoice untuk setiap item barang/jasa pada halaman preview. */}
                  {page.items.map((item: any, idx: number) => (
                    <tr key={item.id} className={idx % 2 === 0 ? 'bg-white' : 'bg-[#F8F9FF]'} style={{ borderBottom: '1px solid #eee' }}>
                      <td className="px-3 py-1">{item.description}</td>
                      <td className="px-3 py-1 text-center">{item.quantity} {item.unit}</td>
                      <td className="px-3 py-1 text-right tabular-nums">{fmtNum(item.unit_price)}</td>
                      <td className="px-3 py-1 text-right tabular-nums font-semibold text-[#151D48]">{fmtNum(item.total_price)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Summary Block (Only on Last Page) */}
            {page.isLastPage && (
              <div id="invoice-summary" className="flex gap-4 mt-2 text-left">
                {/* Payment info */}
                <div className="flex-1 text-[9px]">
                  <div className="flex gap-3 mb-1.5">
                    <div className="flex-1">
                      <h3 className="text-[8px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">INFORMASI PEMBAYARAN:</h3>
                      <div className="bg-gray-50 rounded-md p-2 border border-gray-100 min-h-[50px]">
                        <p className="font-semibold text-[#151D48] mb-0.5">Transfer Bank:</p>
                        <p className="text-gray-600">Bank: <span className="font-medium text-[#151D48]">{company?.bank_name || '-'}</span></p>
                        <p className="text-gray-600">No. Rekening: <span className="font-medium text-[#151D48]">{company?.bank_account || '-'}</span></p>
                        <p className="text-gray-600">Atas Nama: <span className="font-medium text-[#151D48]">{company?.bank_account_name || '-'}</span></p>
                      </div>
                    </div>
                    
                    {invoice.shipping_method && (
                      <div className="flex-1">
                        <h3 className="text-[8px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">PENGIRIMAN:</h3>
                        <div className="bg-gray-50 rounded-md p-2 border border-gray-100 min-h-[50px]">
                          <p className="text-gray-600">Kurir: <span className="font-medium text-[#151D48]">{invoice.shipping_method}</span></p>
                          {invoice.tracking_number && (
                            <p className="text-gray-600 mt-0.5">
                              No. Resi: <span className="font-medium text-[#151D48]">{invoice.tracking_number}</span>
                            </p>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  {invoice.notes && (
                    <div className="mt-1">
                      <p className="text-[8px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">CATATAN:</p>
                      <p className="text-[9px] text-gray-600 whitespace-pre-wrap leading-tight">{invoice.notes}</p>
                    </div>
                  )}
                </div>

                {/* Grand totals */}
                <div className="w-48 shrink-0 text-[9px]">
                  <div className="space-y-1 text-gray-600">
                    <div className="flex justify-between">
                      <span>Subtotal</span>
                      <span className="font-medium text-[#151D48] tabular-nums">Rp {fmtNum(invoice.subtotal)}</span>
                    </div>
                    {invoice.discount_amount > 0 && (
                      <div className="flex justify-between">
                        <span>Diskon</span>
                        <span className="font-medium text-[#FA5A7D] tabular-nums">- Rp {fmtNum(invoice.discount_amount)}</span>
                      </div>
                    )}
                    {invoice.tax_amount > 0 && (
                      <div className="flex justify-between">
                        <span>Pajak ({invoice.tax_rate}%)</span>
                        <span className="font-medium text-[#151D48] tabular-nums">Rp {fmtNum(invoice.tax_amount)}</span>
                      </div>
                    )}
                    {invoice.shipping_cost > 0 && (
                      <div className="flex justify-between">
                        <span>Ongkos Kirim {invoice.shipping_method ? `(${invoice.shipping_method})` : ''}</span>
                        <span className="font-medium text-[#151D48] tabular-nums">Rp {fmtNum(invoice.shipping_cost)}</span>
                      </div>
                    )}
                    <div className="pt-1.5 mt-1.5 border-t-2 border-[#5C67F2] flex justify-between items-center">
                      <span className="font-bold text-[10px] text-[#151D48]">TOTAL AKHIR</span>
                      <span className="font-bold text-xs text-[#5C67F2] tabular-nums">Rp {fmtNum(invoice.grand_total)}</span>
                    </div>
                  </div>

                  {invoice.status === 'paid' && (
                    <div className="mt-2 flex items-center justify-center py-1 bg-[#76c893]/10 text-[#76c893] rounded border border-[#76c893]/20 font-bold uppercase tracking-wider text-[8px]">
                      <span className="leading-none">Lunas</span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="pt-1.5 border-t border-gray-100 text-center text-[8px] text-gray-400 shrink-0">
            <p>Terima kasih atas kepercayaan Anda kepada {company?.company_name || 'kami'}.</p>
          </div>
        </div>
      ))}

      {/* Print styles */}
      <style dangerouslySetInnerHTML={{__html: `
        @media print {
          html, body {
            background: white !important;
            margin: 0 !important;
            padding: 0 !important;
            width: 100% !important;
            height: auto !important;
            overflow: visible !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }

          /* Hide sidebar, navbar and all UI chrome */
          nav, aside, header, footer,
          [role="navigation"], [role="complementary"],
          .print\\:hidden,
          button[aria-label="Tutup menu"],
          .fixed.inset-0.bg-black\\/40 {
            display: none !important;
          }

          main {
            padding: 0 !important;
            margin: 0 !important;
            background: transparent !important;
          }

          /* Reset background and shadow of all ancestor and sibling elements of #invoice-document to avoid gray backgrounds */
          div:not(#invoice-document):not(#invoice-document *) {
            background: transparent !important;
            background-color: transparent !important;
            box-shadow: none !important;
            border: none !important;
          }

          #invoice-document {
            border: none !important;
            box-shadow: none !important;
            padding: 0 !important;
            width: 100% !important;
            min-height: 132mm !important;
            height: auto !important;
            overflow: visible !important;
            background: white !important;
            box-sizing: border-box !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }

          tr {
            page-break-inside: avoid !important;
          }

          #invoice-summary {
            page-break-inside: avoid !important;
          }

          /* Ensure high-fidelity exact colors for table headers and accents inside the invoice */
          #invoice-document * {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }

          @page {
            size: A5 landscape;
            margin: 8mm 12mm 8mm 12mm !important;
          }
        }
      `}} />
    </div>
  );
}
