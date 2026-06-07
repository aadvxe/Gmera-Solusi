"use client";

// Import React hook yang dipakai dropdown pencarian global yang mengelompokkan hasil dan memberi aksi cepat invoice, misalnya untuk state, efek setelah render, atau referensi elemen.
import React, { useState, useEffect, useRef, useCallback } from "react";
// Import alat navigasi Next.js supaya dropdown pencarian global yang mengelompokkan hasil dan memberi aksi cepat invoice bisa pindah halaman atau membaca route aktif.
import { useRouter } from "next/navigation";
// Import ikon yang dipakai dropdown pencarian global yang mengelompokkan hasil dan memberi aksi cepat invoice untuk memperjelas tombol, menu, status, dan aksi di layar.
import { SearchIcon } from "@astraicons/react/linear";
// Import berikutnya mengambil komponen/helper yang langsung dipakai oleh SearchDropdown.
import {
  HomeIcon,
  WalletIcon,
  DocumentIcon,
  Document1Icon,
  ChartIcon,
  GroupIcon,
  SettingsIcon,
  StatusUpIcon,
  ArrowDownIcon,
  CloseIcon,
  EyeIcon,
  EditIcon,
} from "@astraicons/react/bold";
// Import helper database yang dipakai dropdown pencarian global yang mengelompokkan hasil dan memberi aksi cepat invoice untuk mengambil atau menyimpan data Supabase.
import { globalSearch, type SearchResult } from "@/lib/db/search";
// Import authStore supaya dropdown pencarian global yang mengelompokkan hasil dan memberi aksi cepat invoice bisa membaca user login, role, nama tampilan, atau mengosongkan session saat logout.
import { useAuthStore } from "@/store/authStore";

// ─── Icon resolver ────────────────────────────────────────────────────────────
function ResultIcon({ type, className }: { type: SearchResult["type"]; className?: string }) {
  const cls = className ?? "w-4 h-4";
  switch (type) {
    case "client":   return <GroupIcon    className={cls} />;
    case "invoice":  return <Document1Icon className={cls} />;
    case "income":   return <StatusUpIcon  className={cls} />;
    case "expense":  return <ArrowDownIcon className={cls} />;
    case "page":     return <HomeIcon      className={cls} />;
    default:         return <DocumentIcon  className={cls} />;
  }
}

// PageIcon memilih icon yang cocok untuk shortcut halaman di hasil pencarian.
function PageIcon({ href, className }: { href: string; className?: string }) {
  const cls = className ?? "w-4 h-4";
  // Kondisi if (href.startsWith("/beranda")) return <HomeIcon className={cls} />; membuat isi blok if di bawahnya hanya berjalan saat kondisi itu benar di SearchDropdown.
  if (href.startsWith("/beranda"))     return <HomeIcon      className={cls} />;
  // Kondisi if (href.startsWith("/pendapatan")) return <WalletIcon className={cls} />; membuat isi blok if di bawahnya hanya berjalan saat kondisi itu benar di SearchDropdown.
  if (href.startsWith("/pendapatan"))  return <WalletIcon    className={cls} />;
  // Kondisi if (href.startsWith("/pengeluaran")) return <ArrowDownIcon className={cls} />; membuat isi blok if di bawahnya hanya berjalan saat kondisi itu benar di SearchDropdown.
  if (href.startsWith("/pengeluaran")) return <ArrowDownIcon  className={cls} />;
  // Kondisi if (href.startsWith("/e-invoice")) return <Document1Icon className={cls} />; membuat isi blok if di bawahnya hanya berjalan saat kondisi itu benar di SearchDropdown.
  if (href.startsWith("/e-invoice"))   return <Document1Icon  className={cls} />;
  // Kondisi if (href.startsWith("/laporan")) return <ChartIcon className={cls} />; membuat isi blok if di bawahnya hanya berjalan saat kondisi itu benar di SearchDropdown.
  if (href.startsWith("/laporan"))     return <ChartIcon      className={cls} />;
  // Kondisi if (href.startsWith("/customer")) return <GroupIcon className={cls} />; membuat isi blok if di bawahnya hanya berjalan saat kondisi itu benar di SearchDropdown.
  if (href.startsWith("/customer"))    return <GroupIcon      className={cls} />;
  // Kondisi if (href.startsWith("/pengaturan")) return <SettingsIcon className={cls} />; membuat isi blok if di bawahnya hanya berjalan saat kondisi itu benar di SearchDropdown.
  if (href.startsWith("/pengaturan"))  return <SettingsIcon   className={cls} />;
  // Komponen ini menampilkan potongan UI yang dipakai di dropdown pencarian global yang mengelompokkan hasil dan memberi aksi cepat invoice.
  return <HomeIcon className={cls} />;
}

const TYPE_COLORS: Record<SearchResult["type"], string> = {
  page:    "bg-[#5C67F2]/10 text-[#5C67F2]",
  invoice: "bg-[#5C67F2]/10 text-[#5C67F2]",
  client:  "bg-[#76c893]/10 text-[#76c893]",
  income:  "bg-[#76c893]/10 text-[#76c893]",
  expense: "bg-[#f08a5d]/10 text-[#f08a5d]",
};

const STATUS_COLORS: Record<string, string> = {
  "Lunas":        "bg-emerald-50 text-emerald-600",
  "Belum Bayar":  "bg-amber-50 text-amber-600",
  "Jatuh Tempo":  "bg-red-50 text-red-500",
  "Dibatalkan":   "bg-gray-100 text-gray-400",
};

// ─── Highlight matching text ──────────────────────────────────────────────────
function Highlight({ text, query }: { text: string; query: string }) {
  // Kalau teks pencarian cocok dengan nama/nomor/keterangan data, item itu masuk hasil pencarian.
  if (!query.trim()) return <>{text}</>;
  const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`, "gi");
  const parts = text.split(regex);
  // Komponen ini menampilkan UI untuk dropdown pencarian global yang mengelompokkan hasil dan memberi aksi cepat invoice.
  return (
    <>
      {/* map ini membuat satu output untuk setiap item daftar yang sedang dirender oleh SearchDropdown. */}
      {parts.map((part, i) =>
        regex.test(part) ? (
          <mark key={i} className="bg-[#5C67F2]/15 text-[#5C67F2] rounded px-0.5 font-semibold not-italic">
            {part}
          </mark>
        ) : (
          <span key={i}>{part}</span>
        )
      )}
    </>
  );
}

// ─── Types ────────────────────────────────────────────────────────────────────
type GroupedResults = {
  pages:    SearchResult[];
  invoices: SearchResult[];
  clients:  SearchResult[];
  income:   SearchResult[];
  expense:  SearchResult[];
};

// flattenResults mengubah hasil pencarian yang masih berkelompok menjadi satu daftar agar keyboard bisa berpindah antar hasil dengan mudah.
function flattenResults(groups: GroupedResults): SearchResult[] {
  // flattenResults mengembalikan nilai yang dibutuhkan oleh SearchDropdown.
  return [
    ...groups.pages,
    ...groups.invoices,
    ...groups.clients,
    ...groups.income,
    ...groups.expense,
  ];
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────
function Skeleton() {
  // Komponen ini menampilkan UI untuk dropdown pencarian global yang mengelompokkan hasil dan memberi aksi cepat invoice.
  return (
    <div className="p-3 space-y-3">
      {/* map ini membuat satu output untuk setiap item daftar yang sedang dirender oleh SearchDropdown. */}
      {[1, 2, 3].map((i) => (
        <div key={i} className="flex items-center gap-3 px-1">
          <div className="w-8 h-8 rounded-xl bg-gray-100 animate-pulse shrink-0" />
          <div className="flex-1 space-y-1.5">
            <div className="h-3 bg-gray-100 rounded animate-pulse w-2/3" />
            <div className="h-2.5 bg-gray-100 rounded animate-pulse w-1/2" />
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Result Item ──────────────────────────────────────────────────────────────
function ResultItem({
  result,
  query,
  isActive,
  isExpanded,
  onClick,
  onMouseEnter,
}: {
  result: SearchResult;
  query: string;
  isActive: boolean;
  isExpanded?: boolean;
  onClick: () => void;
  onMouseEnter: () => void;
}) {
  // Komponen ini menampilkan UI untuk dropdown pencarian global yang mengelompokkan hasil dan memberi aksi cepat invoice.
  return (
    <button
      type="button"
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all group ${
        isExpanded
          ? "bg-[#5C67F2]/8 rounded-b-none"
          : isActive
          ? "bg-[#5C67F2] shadow-sm shadow-[#5C67F2]/20"
          : "hover:bg-gray-50"
      }`}
    >
      <div
        className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
          isActive && !isExpanded ? "bg-white/20" : TYPE_COLORS[result.type]
        }`}
      >
        {result.type === "page" ? (
          <PageIcon
            href={result.href}
            className={`w-4 h-4 ${isActive && !isExpanded ? "text-white" : ""}`}
          />
        ) : (
          <ResultIcon
            type={result.type}
            className={`w-4 h-4 ${isActive && !isExpanded ? "text-white" : ""}`}
          />
        )}
      </div>

      <div className="flex-1 min-w-0">
        <p
          className={`text-sm font-medium truncate transition-colors ${
            isActive && !isExpanded ? "text-white" : "text-[#151D48]"
          }`}
        >
          <Highlight text={result.title} query={query} />
        </p>
        {result.subtitle && (
          <p
            className={`text-xs truncate transition-colors mt-0.5 ${
              isActive && !isExpanded ? "text-white/70" : "text-gray-400"
            }`}
          >
            {result.subtitle}
          </p>
        )}
      </div>

      <div className="flex items-center gap-2 shrink-0">
        {result.amount !== undefined && (
          <span
            className={`text-xs font-semibold transition-colors ${
              isActive && !isExpanded ? "text-white/90" : "text-[#151D48]"
            }`}
          >
            {new Intl.NumberFormat("id-ID", {
              style: "currency",
              currency: "IDR",
              maximumFractionDigits: 0,
            }).format(result.amount)}
          </span>
        )}
        {result.status && (
          <span
            className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-lg ${
              isActive && !isExpanded
                ? "bg-white/20 text-white"
                : STATUS_COLORS[result.status] ?? "bg-gray-100 text-gray-500"
            }`}
          >
            {result.status}
          </span>
        )}
      </div>
    </button>
  );
}

// ─── Invoice Action Buttons (expand panel) ────────────────────────────────────
function InvoiceActions({
  invoiceId,
  onNavigate,
}: {
  invoiceId: string;
  onNavigate: (href: string) => void;
}) {
  // Komponen ini menampilkan UI untuk dropdown pencarian global yang mengelompokkan hasil dan memberi aksi cepat invoice.
  return (
    <div className="flex gap-2 px-3 pb-2 pt-1 bg-[#5C67F2]/8 rounded-b-xl border-t border-[#5C67F2]/10">
      <button
        type="button"
        onClick={() => onNavigate(`/e-invoice/${invoiceId}/detail`)}
        className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg bg-white border border-[#5C67F2]/20 text-[#5C67F2] text-xs font-semibold hover:bg-[#5C67F2] hover:text-white hover:border-[#5C67F2] transition-all shadow-sm"
      >
        <EyeIcon className="w-3.5 h-3.5" />
        Preview
      </button>
      <button
        type="button"
        onClick={() => onNavigate(`/e-invoice/${invoiceId}/edit`)}
        className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg bg-[#5C67F2] text-white text-xs font-semibold hover:bg-[#4a55c2] transition-all shadow-sm"
      >
        <EditIcon className="w-3.5 h-3.5" />
        Edit
      </button>
    </div>
  );
}

// ─── Group Section ────────────────────────────────────────────────────────────
function GroupSection({
  label,
  results,
  query,
  activeIdx,
  baseIdx,
  onSelect,
  onHover,
  expandedId,
  onExpand,
  onNavigate,
}: {
  label: string;
  results: SearchResult[];
  query: string;
  activeIdx: number;
  baseIdx: number;
  onSelect: (r: SearchResult) => void;
  onHover: (idx: number) => void;
  expandedId?: string | null;
  onExpand?: (id: string | null) => void;
  onNavigate?: (href: string) => void;
}) {
  // Kondisi ini mengecek jumlah item agar daftar kosong, pagination, atau total bisa ditangani dengan benar.
  if (results.length === 0) return null;
  const isInvoiceGroup = results[0]?.type === "invoice";
  // Komponen ini menampilkan UI untuk dropdown pencarian global yang mengelompokkan hasil dan memberi aksi cepat invoice.
  return (
    <div>
      <p className="px-3 pt-3 pb-1 text-[10px] font-bold uppercase tracking-widest text-gray-400">
        {label}
      </p>
      {/* map ini membuat item hasil pencarian yang bisa diklik menuju halaman terkait. */}
      {results.map((r, i) => {
        const isExpanded = isInvoiceGroup && expandedId === r.id;
        // Komponen ini menampilkan UI untuk dropdown pencarian global yang mengelompokkan hasil dan memberi aksi cepat invoice.
        return (
          <div key={r.id} className="rounded-xl overflow-hidden mb-0.5">
            <ResultItem
              result={r}
              query={query}
              isActive={activeIdx === baseIdx + i}
              isExpanded={isExpanded}
              onClick={() => {
                // Kondisi if (isInvoiceGroup && onExpand) membuat isi blok if di bawahnya hanya berjalan saat kondisi itu benar di SearchDropdown.
                if (isInvoiceGroup && onExpand) {
                  // Toggle expand; collapse if same item clicked again
                  onExpand(isExpanded ? null : r.id);
                } else {
                  onSelect(r);
                }
              }}
              onMouseEnter={() => onHover(baseIdx + i)}
            />
            {isExpanded && onNavigate && (
              <InvoiceActions invoiceId={r.id} onNavigate={onNavigate} />
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─── Main SearchDropdown Component ────────────────────────────────────────────
interface SearchDropdownProps {
  /** Mobile mode: fullscreen overlay */
  mobile?: boolean;
  /** Called when mobile overlay should close */
  onCloseMobile?: () => void;
  autoFocus?: boolean;
}

// SearchDropdown menjalankan pencarian global dengan jeda ketik, navigasi keyboard, dan tombol cepat untuk invoice.
export function SearchDropdown({ mobile = false, onCloseMobile, autoFocus }: SearchDropdownProps) {
  // query menyimpan kata kunci pencarian yang sedang diketik user.
  const [query, setQuery] = useState("");
  const [groups, setGroups] = useState<GroupedResults | null>(null);
  // isLoading menandai proses sedang berjalan supaya tombol bisa dibuat disabled atau layar loading muncul.
  const [isLoading, setIsLoading] = useState(false);
  // isOpen menentukan apakah panel/dropdown/modal sedang terbuka di layar.
  const [isOpen, setIsOpen] = useState(false);
  // activeIdx menyimpan posisi hasil pencarian yang sedang dipilih lewat keyboard.
  const [activeIdx, setActiveIdx] = useState(-1);
  const [expandedInvoiceId, setExpandedInvoiceId] = useState<string | null>(null);

  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const router = useRouter();
  const role = useAuthStore((s) => s.role) ?? "viewer";

  // Auto-focus in mobile overlay
  useEffect(() => {
    // Kondisi if (autoFocus && inputRef.current) membuat isi blok if di bawahnya hanya berjalan saat kondisi itu benar di SearchDropdown.
    if (autoFocus && inputRef.current) {
      inputRef.current.focus();
    }
  }, [autoFocus]);

  // Click-outside to close (desktop)
  useEffect(() => {
    // Kondisi if (mobile) return; membuat isi blok if di bawahnya hanya berjalan saat kondisi itu benar di SearchDropdown.
    if (mobile) return;
    // handler adalah fungsi penangan aksi user; fungsi ini berjalan saat user mengklik, mengetik, memilih, atau submit sesuatu.
    const handler = (e: MouseEvent) => {
      // Kondisi if (containerRef.current && !containerRef.current.contains(e.target as Node)) membuat isi blok if di bawahnya hanya berjalan saat kondisi itu benar di SearchDropdown.
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
        setActiveIdx(-1);
      }
    };
    document.addEventListener("mousedown", handler);
    // SearchDropdown menampilkan UI untuk dropdown pencarian global yang mengelompokkan hasil dan memberi aksi cepat invoice.
    return () => document.removeEventListener("mousedown", handler);
  }, [mobile]);

  // Callback ini membuat fungsi pemilih hasil pencarian tetap stabil saat SearchDropdown dirender ulang.
  const doSearch = useCallback(
    async (q: string) => {
      setIsLoading(true);
      // try ini menjalankan pencarian global ke Supabase berdasarkan teks yang diketik user.
      try {
        // await menunggu proses async selesai sebelum SearchDropdown melanjutkan langkah berikutnya.
        const result = await globalSearch(q, role);
        setGroups(result);
      } catch {
        setGroups({ pages: [], invoices: [], clients: [], income: [], expense: [] });
      } finally {
        setIsLoading(false);
        setActiveIdx(-1);
      }
    },
    [role]
  );

  // handleChange adalah fungsi penangan aksi user; fungsi ini berjalan saat user mengklik, mengetik, memilih, atau submit sesuatu.
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setQuery(val);
    setIsOpen(true);
    setActiveIdx(-1);
    setExpandedInvoiceId(null);

    // Kondisi if (debounceRef.current) clearTimeout(debounceRef.current); membuat isi blok if di bawahnya hanya berjalan saat kondisi itu benar di SearchDropdown.
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => doSearch(val), 200);
  };

  // handleFocus adalah fungsi penangan aksi user; fungsi ini berjalan saat user mengklik, mengetik, memilih, atau submit sesuatu.
  const handleFocus = () => {
    setIsOpen(true);
    // Kalau teks pencarian cocok dengan nama/nomor/keterangan data, item itu masuk hasil pencarian.
    if (groups === null) doSearch(query);
  };

  // handleSelect adalah fungsi penangan aksi user; fungsi ini berjalan saat user mengklik, mengetik, memilih, atau submit sesuatu.
  const handleSelect = (r: SearchResult) => {
    router.push(r.href);
    setIsOpen(false);
    setQuery("");
    setGroups(null);
    setExpandedInvoiceId(null);
    onCloseMobile?.();
  };

  // handleNavigate adalah fungsi penangan aksi user; fungsi ini berjalan saat user mengklik, mengetik, memilih, atau submit sesuatu.
  const handleNavigate = (href: string) => {
    router.push(href);
    setIsOpen(false);
    setQuery("");
    setGroups(null);
    setExpandedInvoiceId(null);
    onCloseMobile?.();
  };

  // handleClear adalah fungsi penangan aksi user; fungsi ini berjalan saat user mengklik, mengetik, memilih, atau submit sesuatu.
  const handleClear = () => {
    setQuery("");
    setGroups(null);
    setIsOpen(false);
    inputRef.current?.focus();
  };

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Kondisi ini menentukan apakah panel/modal/dropdown perlu ditampilkan atau disembunyikan.
    if (!isOpen || !groups) return;
    const flat = flattenResults(groups);
    const total = flat.length;

    // Kondisi if (e.key === "ArrowDown") membuat isi blok if di bawahnya hanya berjalan saat kondisi itu benar di SearchDropdown.
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIdx((prev) => (prev + 1) % total);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIdx((prev) => (prev - 1 + total) % total);
    } else if (e.key === "Enter") {
      e.preventDefault();
      // Kondisi if (activeIdx >= 0 && flat[activeIdx]) membuat isi blok if di bawahnya hanya berjalan saat kondisi itu benar di SearchDropdown.
      if (activeIdx >= 0 && flat[activeIdx]) {
        handleSelect(flat[activeIdx]);
      }
    } else if (e.key === "Escape") {
      setIsOpen(false);
      setActiveIdx(-1);
      inputRef.current?.blur();
      onCloseMobile?.();
    }
  };

  const hasResults =
    groups &&
    (groups.pages.length > 0 ||
      groups.invoices.length > 0 ||
      groups.clients.length > 0 ||
      groups.income.length > 0 ||
      groups.expense.length > 0);

  const showDropdown = isOpen && !mobile;

  // Compute base indices for keyboard nav
  const pLen = groups?.pages.length ?? 0;
  const iLen = groups?.invoices.length ?? 0;
  const cLen = groups?.clients.length ?? 0;
  const incLen = groups?.income.length ?? 0;

  // ── Shared input UI ─────────────────────────────────────────────────────────
  const inputEl = (
    <div className="relative flex items-center">
      <SearchIcon className="w-[18px] h-[18px] absolute left-4 text-gray-400 pointer-events-none shrink-0" />
      <input
        ref={inputRef}
        type="text"
        value={query}
        onChange={handleChange}
        onFocus={handleFocus}
        onKeyDown={handleKeyDown}
        placeholder={mobile ? "Cari apapun..." : "Cari transaksi atau customer..."}
        autoComplete="off"
        spellCheck={false}
        className={`w-full bg-[#F9FAFB] rounded-xl h-12 pl-12 pr-10 text-sm text-gray-700 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#5C67F2]/20 transition-all ${
          mobile ? "h-14 text-base bg-white/60 backdrop-blur-sm" : ""
        }`}
      />
      {query && (
        <button
          type="button"
          onClick={handleClear}
          className="absolute right-3 p-1 rounded-full hover:bg-gray-200 text-gray-400 transition-colors"
        >
          <CloseIcon className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );

  // ── Dropdown results panel ──────────────────────────────────────────────────
  const resultsPanel = (
    <div className={`${mobile ? "" : "absolute top-full left-0 right-0 mt-2 z-[60]"}`}>
      <div
        className={`rounded-2xl border border-white/40 shadow-[0_16px_48px_rgba(0,0,0,0.14)] overflow-hidden ${
          mobile
            ? "bg-white/90 backdrop-blur-2xl"
            : "bg-white/95 backdrop-blur-2xl"
        }`}
      >
        {isLoading ? (
          <Skeleton />
        ) : hasResults ? (
          <div className="p-2 max-h-[60dvh] overflow-y-auto overscroll-contain scrollbar-none">
            <GroupSection
              label="Halaman"
              results={groups!.pages}
              query={query}
              activeIdx={activeIdx}
              baseIdx={0}
              onSelect={handleSelect}
              onHover={setActiveIdx}
            />
            <GroupSection
              label="Invoice"
              results={groups!.invoices}
              query={query}
              activeIdx={activeIdx}
              baseIdx={pLen}
              onSelect={handleSelect}
              onHover={setActiveIdx}
              expandedId={expandedInvoiceId}
              onExpand={setExpandedInvoiceId}
              onNavigate={handleNavigate}
            />
            <GroupSection
              label="Customer"
              results={groups!.clients}
              query={query}
              activeIdx={activeIdx}
              baseIdx={pLen + iLen}
              onSelect={handleSelect}
              onHover={setActiveIdx}
            />
            <GroupSection
              label="Pendapatan"
              results={groups!.income}
              query={query}
              activeIdx={activeIdx}
              baseIdx={pLen + iLen + cLen}
              onSelect={handleSelect}
              onHover={setActiveIdx}
            />
            <GroupSection
              label="Pengeluaran"
              results={groups!.expense}
              query={query}
              activeIdx={activeIdx}
              baseIdx={pLen + iLen + cLen + incLen}
              onSelect={handleSelect}
              onHover={setActiveIdx}
            />

          </div>
        ) : query.trim() ? (
          <div className="py-10 flex flex-col items-center gap-3 text-center px-6">
            <div className="w-12 h-12 rounded-2xl bg-gray-50 flex items-center justify-center">
              <SearchIcon className="w-5 h-5 text-gray-300" />
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-500">Tidak ada hasil</p>
              <p className="text-xs text-gray-400 mt-0.5">
                Coba kata kunci lain atau periksa ejaan
              </p>
            </div>
          </div>
        ) : (
          <div className="p-2">
            <p className="px-3 pt-2 pb-1 text-[10px] font-bold uppercase tracking-widest text-gray-400">
              Halaman
            </p>
            {/* map ini membuat satu output untuk setiap item daftar yang sedang dirender oleh SearchDropdown. */}
            {groups?.pages.map((p, i) => (
              <ResultItem
                key={p.id}
                result={p}
                query=""
                isActive={activeIdx === i}
                onClick={() => handleSelect(p)}
                onMouseEnter={() => setActiveIdx(i)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );

  // ── Mobile layout ───────────────────────────────────────────────────────────
  if (mobile) {
    // SearchDropdown menampilkan UI untuk dropdown pencarian global yang mengelompokkan hasil dan memberi aksi cepat invoice.
    return (
      <div className="flex flex-col gap-3 w-full">
        {inputEl}
        {isOpen && (groups !== null || isLoading) && resultsPanel}
      </div>
    );
  }

  // ── Desktop layout ──────────────────────────────────────────────────────────
  return (
    <div ref={containerRef} className="relative w-full">
      {inputEl}
      {showDropdown && (groups !== null || isLoading) && resultsPanel}
    </div>
  );
}
