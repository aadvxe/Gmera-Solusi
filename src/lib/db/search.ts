// Import createClient untuk membuka koneksi Supabase dari browser saat helper pencarian global berdasarkan keyword dan role user perlu membaca/menyimpan data.
import { createClient } from '@/utils/supabase/client';

export type SearchResult = {
  id: string;
  type: 'client' | 'invoice' | 'income' | 'expense' | 'page';
  title: string;
  subtitle: string;
  amount?: number;
  status?: string;
  href: string;
};

// Type ini memberi nama pada bentuk data yang dipakai helper pencarian global berdasarkan keyword dan role user.
type PageShortcut = {
  id: string;
  type: 'page';
  title: string;
  subtitle: string;
  href: string;
  keywords: string[];
};

const PAGE_SHORTCUTS: PageShortcut[] = [
  { id: 'page-beranda', type: 'page', title: 'Dashboard', subtitle: 'Ringkasan keuangan & aktivitas', href: '/beranda', keywords: ['dashboard', 'beranda', 'home', 'ringkasan'] },
  { id: 'page-pendapatan', type: 'page', title: 'Pendapatan', subtitle: 'Daftar & kelola pemasukan', href: '/pendapatan', keywords: ['pendapatan', 'pemasukan', 'income'] },
  { id: 'page-pengeluaran', type: 'page', title: 'Pengeluaran', subtitle: 'Daftar & kelola pengeluaran', href: '/pengeluaran', keywords: ['pengeluaran', 'biaya', 'expense'] },
  { id: 'page-einvoice', type: 'page', title: 'E-Invoice', subtitle: 'Kelola faktur & invoice', href: '/e-invoice', keywords: ['invoice', 'faktur', 'tagihan', 'e-invoice'] },
  { id: 'page-laporan', type: 'page', title: 'Laporan', subtitle: 'Laporan transaksi & analitik', href: '/laporan', keywords: ['laporan', 'report', 'analitik', 'grafik'] },
  { id: 'page-customer', type: 'page', title: 'Customer', subtitle: 'Daftar & kelola pelanggan', href: '/customer', keywords: ['customer', 'pelanggan', 'klien', 'client'] },
  { id: 'page-pengaturan', type: 'page', title: 'Pengaturan', subtitle: 'Konfigurasi akun & perusahaan', href: '/pengaturan', keywords: ['pengaturan', 'setting', 'konfigurasi', 'profil'] },
];

// formatCurrency mengubah angka menjadi format mata uang Indonesia lengkap dengan Rp.
const formatCurrency = (amount: number) =>
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(amount);

const STATUS_LABEL: Record<string, string> = {
  unpaid: 'Belum Bayar',
  paid: 'Lunas',
  overdue: 'Jatuh Tempo',
  cancelled: 'Dibatalkan',
};

// globalSearch mencari halaman, invoice, customer, pendapatan, dan pengeluaran sesuai keyword dan role user.
export async function globalSearch(
  query: string,
  role: string
): Promise<{ pages: SearchResult[]; invoices: SearchResult[]; clients: SearchResult[]; income: SearchResult[]; expense: SearchResult[] }> {
  const q = query.trim().toLowerCase();

  // Static page shortcuts — always available
  const pages: SearchResult[] = PAGE_SHORTCUTS
    // filter ini menyisakan data helper pencarian global yang cocok dengan pencarian, status, role, atau tanggal aktif.
    .filter(p => {
      // Kondisi if (!q) return true; membuat isi blok if di bawahnya hanya berjalan saat kondisi itu benar di helper pencarian global.
      if (!q) return true;
      // formatCurrency menampilkan UI untuk helper pencarian global berdasarkan keyword dan role user.
      return (
        p.title.toLowerCase().includes(q) ||
        p.subtitle.toLowerCase().includes(q) ||
        p.keywords.some(k => k.includes(q))
      );
    })
    // map ini membuat satu output untuk setiap item daftar yang sedang dirender oleh helper pencarian global.
    .map(({ keywords: _k, ...rest }) => rest);

  // Kondisi if (!q) membuat isi blok if di bawahnya hanya berjalan saat kondisi itu benar di helper pencarian global.
  if (!q) {
    // pages mengembalikan nilai yang dibutuhkan oleh helper pencarian global.
    return { pages, invoices: [], clients: [], income: [], expense: [] };
  }

  const supabase = createClient();
  const canAccessExpense = ['super_admin', 'finance_manager', 'accounting_staff', 'viewer'].includes(role);
  const canAccessIncome = true; // all roles
  const canAccessClients = ['super_admin', 'finance_manager', 'accounting_staff', 'sales_staff'].includes(role);

  // Run all queries in parallel
  const [invoicesRes, clientsRes, incomeRes, expenseRes] = await Promise.allSettled([
    // Invoices
    supabase
      .from('invoices')
      .select('id, invoice_number, client_name, status, grand_total')
      .or(`invoice_number.ilike.%${q}%,client_name.ilike.%${q}%`)
      .limit(5),

    // Clients
    canAccessClients
      ? supabase
          .from('clients')
          .select('id, name, phone, email, city')
          .eq('is_active', true)
          .or(`name.ilike.%${q}%,email.ilike.%${q}%,phone.ilike.%${q}%`)
          .limit(5)
      : Promise.resolve({ data: null, error: null }),

    // Income
    canAccessIncome
      ? supabase
          .from('income')
          .select('id, source, description, amount, date, reference_number')
          .or(`source.ilike.%${q}%,description.ilike.%${q}%,reference_number.ilike.%${q}%`)
          .limit(4)
      : Promise.resolve({ data: null, error: null }),

    // Expense
    canAccessExpense
      ? supabase
          .from('expense')
          .select('id, expense_type, description, amount, date, reference_number')
          .or(`expense_type.ilike.%${q}%,description.ilike.%${q}%,reference_number.ilike.%${q}%`)
          .limit(4)
      : Promise.resolve({ data: null, error: null }),
  ]);

  const invoices: SearchResult[] =
    invoicesRes.status === 'fulfilled' && invoicesRes.value.data
      // map ini membentuk data grafik/tabel dari hasil transaksi yang sudah dihitung.
      ? invoicesRes.value.data.map((inv: any) => ({
          id: inv.id,
          type: 'invoice' as const,
          title: inv.invoice_number,
          subtitle: inv.client_name,
          amount: inv.grand_total,
          status: STATUS_LABEL[inv.status] ?? inv.status,
          href: `/e-invoice/${inv.id}`,
        }))
      : [];

  const clients: SearchResult[] =
    clientsRes.status === 'fulfilled' && (clientsRes.value as any).data
      // map ini membentuk data grafik/tabel dari hasil transaksi yang sudah dihitung.
      ? (clientsRes.value as any).data.map((c: any) => ({
          id: c.id,
          type: 'client' as const,
          title: c.name,
          // filter(Boolean) membuang nilai kosong, misalnya nomor telepon/email yang tidak ada, sebelum teks digabung.
          subtitle: [c.city, c.phone, c.email].filter(Boolean).join(' · '),
          href: `/customer/${c.id}`,
        }))
      : [];

  const income: SearchResult[] =
    incomeRes.status === 'fulfilled' && (incomeRes.value as any).data
      // map ini membentuk data grafik/tabel dari hasil transaksi yang sudah dihitung.
      ? (incomeRes.value as any).data.map((i: any) => ({
          id: i.id,
          type: 'income' as const,
          title: i.source,
          subtitle: i.description || i.reference_number || new Date(i.date).toLocaleDateString('id-ID'),
          amount: i.amount,
          href: `/pendapatan`,
        }))
      : [];

  const expense: SearchResult[] =
    expenseRes.status === 'fulfilled' && (expenseRes.value as any).data
      // map ini membentuk data grafik/tabel dari hasil transaksi yang sudah dihitung.
      ? (expenseRes.value as any).data.map((e: any) => ({
          id: e.id,
          type: 'expense' as const,
          title: e.expense_type,
          subtitle: e.description || e.reference_number || new Date(e.date).toLocaleDateString('id-ID'),
          amount: e.amount,
          href: `/pengeluaran`,
        }))
      : [];

  // expense mengembalikan nilai yang dibutuhkan oleh helper pencarian global.
  return { pages, invoices, clients, income, expense };
}

export { formatCurrency as formatSearchCurrency };
