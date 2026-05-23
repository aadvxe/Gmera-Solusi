"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { SearchIcon } from "@astraicons/react/linear";
import { 
  ArrowDownIcon, 
  ArrowUpIcon,
  DocumentIcon, 
  Profile1Icon 
} from "@astraicons/react/bold";
import { getClients, getIncome, getExpense, getInvoices } from "@/lib/db";
import { formatCurrency } from "@/lib/utils";

function PencarianContent() {
  const searchParams = useSearchParams();
  const query = searchParams.get("q") || "";
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [results, setResults] = useState<{
    clients: any[],
    incomes: any[],
    expenses: any[],
    invoices: any[]
  }>({
    clients: [],
    incomes: [],
    expenses: [],
    invoices: []
  });

  useEffect(() => {
    const fetchResults = async () => {
      if (!query) {
        setLoading(false);
        return;
      }
      
      setLoading(true);
      try {
        const lowerQuery = query.toLowerCase();

        // Fetch all data (since there's no dedicated global search API, we filter locally or via simple fetch)
        const [allClients, allIncomes, allExpenses, allInvoices] = await Promise.all([
          getClients(),
          getIncome(),
          getExpense(),
          getInvoices()
        ]);

        const filteredClients = allClients.filter(c => 
          c.name.toLowerCase().includes(lowerQuery) || 
          c.email?.toLowerCase().includes(lowerQuery) || 
          c.phone?.toLowerCase().includes(lowerQuery)
        );

        const filteredIncomes = allIncomes.filter((i: any) => 
          i.description?.toLowerCase().includes(lowerQuery) || 
          i.source?.toLowerCase().includes(lowerQuery) ||
          i.categories?.name?.toLowerCase().includes(lowerQuery)
        );

        const filteredExpenses = allExpenses.filter((e: any) => 
          e.description?.toLowerCase().includes(lowerQuery) ||
          e.expense_type?.toLowerCase().includes(lowerQuery) || 
          e.categories?.name?.toLowerCase().includes(lowerQuery)
        );

        const filteredInvoices = allInvoices.filter((inv: any) => 
          inv.invoice_number?.toLowerCase().includes(lowerQuery) || 
          inv.client_name?.toLowerCase().includes(lowerQuery)
        );

        setResults({
          clients: filteredClients,
          incomes: filteredIncomes,
          expenses: filteredExpenses,
          invoices: filteredInvoices
        });
      } catch (error) {
        console.error("Search error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [query]);

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#5C67F2]"></div>
      </div>
    );
  }

  const totalResults = results.clients.length + results.incomes.length + results.expenses.length + results.invoices.length;

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      <div>
        <h1 className="text-2xl font-bold text-[#151D48] mb-1">Hasil Pencarian</h1>
        <p className="text-gray-500">
          Menampilkan {totalResults} hasil untuk "{query}"
        </p>
      </div>

      {!query && (
        <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 text-center">
          <SearchIcon className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-[#151D48] mb-2">Ketik Sesuatu untuk Mencari</h3>
          <p className="text-gray-500 text-sm">Cari nama customer, deskripsi transaksi, atau nomor invoice.</p>
        </div>
      )}

      {query && totalResults === 0 && (
        <div className="bg-white rounded-2xl p-12 shadow-sm border border-gray-100 text-center">
          <SearchIcon className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-[#151D48] mb-2">Pencarian Tidak Ditemukan</h3>
          <p className="text-gray-500 text-sm">Tidak ada hasil yang cocok dengan kata kunci tersebut.</p>
        </div>
      )}

      {results.clients.length > 0 && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-5 border-b border-gray-100 flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#5C67F2]/10 text-[#5C67F2] flex items-center justify-center">
              <Profile1Icon className="w-4 h-4" />
            </div>
            <h2 className="text-lg font-bold text-[#151D48]">Customer ({results.clients.length})</h2>
          </div>
          <div className="divide-y divide-gray-50">
            {results.clients.map(client => (
              <div 
                key={client.id} 
                onClick={() => router.push(`/customer/${client.id}`)}
                className="p-4 hover:bg-gray-50 cursor-pointer transition-colors flex justify-between items-center"
              >
                <div>
                  <h4 className="font-semibold text-[#151D48]">{client.name}</h4>
                  <p className="text-sm text-gray-500 flex gap-2">
                    {client.email && <span>{client.email}</span>}
                    {client.phone && <span>• {client.phone}</span>}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {results.incomes.length > 0 && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-5 border-b border-gray-100 flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#76c893]/10 text-[#76c893] flex items-center justify-center">
              <ArrowDownIcon className="w-4 h-4" />
            </div>
            <h2 className="text-lg font-bold text-[#151D48]">Pendapatan ({results.incomes.length})</h2>
          </div>
          <div className="divide-y divide-gray-50">
            {results.incomes.map((inc: any) => (
              <div 
                key={inc.id} 
                className="p-4 hover:bg-gray-50 transition-colors flex justify-between items-center"
              >
                <div>
                  <h4 className="font-semibold text-[#151D48]">{inc.description || inc.source || "Pendapatan"}</h4>
                  <p className="text-sm text-gray-500 flex gap-2">
                    <span>{inc.source}</span>
                    <span>• {new Date(inc.date).toLocaleDateString("id-ID")}</span>
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-[#76c893]">+{formatCurrency(inc.amount)}</p>
                  <span className="text-xs font-medium px-2 py-1 rounded bg-gray-100 text-gray-600">{inc.categories?.name || 'Lainnya'}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {results.expenses.length > 0 && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-5 border-b border-gray-100 flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#f08a5d]/10 text-[#f08a5d] flex items-center justify-center">
              <ArrowUpIcon className="w-4 h-4" />
            </div>
            <h2 className="text-lg font-bold text-[#151D48]">Pengeluaran ({results.expenses.length})</h2>
          </div>
          <div className="divide-y divide-gray-50">
            {results.expenses.map((exp: any) => (
              <div 
                key={exp.id} 
                className="p-4 hover:bg-gray-50 transition-colors flex justify-between items-center"
              >
                <div>
                  <h4 className="font-semibold text-[#151D48]">{exp.description || exp.expense_type || "Pengeluaran"}</h4>
                  <p className="text-sm text-gray-500 flex gap-2">
                    <span>{new Date(exp.date).toLocaleDateString("id-ID")}</span>
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-[#f08a5d]">-{formatCurrency(exp.amount)}</p>
                  <span className="text-xs font-medium px-2 py-1 rounded bg-gray-100 text-gray-600">{exp.categories?.name || 'Lainnya'}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {results.invoices.length > 0 && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-5 border-b border-gray-100 flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#5C67F2]/10 text-[#5C67F2] flex items-center justify-center">
              <DocumentIcon className="w-4 h-4" />
            </div>
            <h2 className="text-lg font-bold text-[#151D48]">Invoice ({results.invoices.length})</h2>
          </div>
          <div className="divide-y divide-gray-50">
            {results.invoices.map((inv: any) => (
              <div 
                key={inv.id} 
                onClick={() => router.push(`/e-invoice/${inv.id}/detail`)}
                className="p-4 hover:bg-gray-50 cursor-pointer transition-colors flex justify-between items-center"
              >
                <div>
                  <h4 className="font-semibold text-[#151D48]">{inv.invoice_number}</h4>
                  <p className="text-sm text-gray-500 flex gap-2">
                    <span>{inv.client_name}</span>
                    <span>• Tenggat: {new Date(inv.due_date).toLocaleDateString("id-ID")}</span>
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-[#151D48]">{formatCurrency(inv.grand_total)}</p>
                  <span className={`text-xs font-medium px-2 py-1 rounded uppercase ${
                    inv.status === 'paid' ? 'bg-[#76c893]/10 text-[#76c893]' :
                    inv.status === 'overdue' ? 'bg-[#f08a5d]/10 text-[#f08a5d]' :
                    'bg-[#FF9F43]/10 text-[#FF9F43]'
                  }`}>
                    {inv.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default function PencarianPage() {
  return (
    <Suspense fallback={
      <div className="flex h-full items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#5C67F2]"></div>
      </div>
    }>
      <PencarianContent />
    </Suspense>
  );
}
