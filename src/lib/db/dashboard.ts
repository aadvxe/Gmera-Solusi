// Import createClient untuk membuka koneksi Supabase dari browser saat helper database yang menghitung angka dashboard, grafik, laporan, aktivitas, dan ranking perlu membaca/menyimpan data.
import { createClient } from '@/utils/supabase/client';
// Import helper income agar dashboard bisa membaca pendapatan dari Supabase.
import { getTotalIncome } from './income';
// Import helper expense agar dashboard bisa membaca pengeluaran dari Supabase.
import { getTotalExpense } from './expense';
// Import helper invoices agar dashboard bisa menghitung status invoice dan piutang.
import { getInvoices, checkAndUpdateOverdueInvoices } from './invoices';

// ─── DASHBOARD SUMMARY ────────────────────────────────────────────────────────

export async function getDashboardSummary(year?: number, month?: number) {
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1;

  const selectedYear = year || currentYear;
  const selectedMonth = month || currentMonth;

  let day = now.getDate();
  // Kondisi if (selectedYear !== currentYear || selectedMonth !== currentMonth) membuat isi blok if di bawahnya hanya berjalan saat kondisi itu benar di helper data dashboard.
  if (selectedYear !== currentYear || selectedMonth !== currentMonth) {
    day = new Date(selectedYear, selectedMonth, 0).getDate();
  }

  console.log('[Dashboard] getDashboardSummary called', { selectedYear, selectedMonth, day });

  const prevMonth = selectedMonth === 1 ? 12 : selectedMonth - 1;
  const prevYear = selectedMonth === 1 ? selectedYear - 1 : selectedYear;

  // await Promise.all menunggu beberapa query berjalan paralel sampai semuanya selesai.
  const [totalIncomeMonth, totalExpenseMonth, invoices, allTimeIncome, allTimeExpense] = await Promise.all([
    getTotalIncome(selectedYear, selectedMonth),
    getTotalExpense(selectedYear, selectedMonth),
    getInvoices(),
    getTotalIncome(),
    getTotalExpense(),
  ]);

  console.log('[Dashboard] Summary results:', { totalIncomeMonth, totalExpenseMonth, allTimeIncome, allTimeExpense, invoiceCount: invoices.length });

  const supabase = createClient();
  const prevMonthStart = `${prevYear}-${String(prevMonth).padStart(2, '0')}-01`;
  const prevMonthEndMTD = `${prevYear}-${String(prevMonth).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

  // await Promise.all menunggu beberapa query berjalan paralel sampai semuanya selesai.
  const [prevIncomeRes, prevExpenseRes] = await Promise.all([
    supabase.from('income').select('amount').gte('date', prevMonthStart).lte('date', prevMonthEndMTD),
    supabase.from('expense').select('amount').gte('date', prevMonthStart).lte('date', prevMonthEndMTD),
  ]);

  console.log('[Dashboard] Previous month raw data:', {
    prevIncomeData: prevIncomeRes.data,
    prevIncomeError: prevIncomeRes.error,
    prevExpenseData: prevExpenseRes.data,
    prevExpenseError: prevExpenseRes.error,
  });

  // prevMonthIncomeMTD menghitung pendapatan bulan lalu sampai tanggal yang sama untuk pembanding bulan ini.
  const prevMonthIncomeMTD = (prevIncomeRes.data || []).reduce((sum, row) => sum + (Number(row.amount) || 0), 0);
  // prevMonthExpenseMTD menghitung pengeluaran bulan lalu sampai tanggal yang sama untuk pembanding bulan ini.
  const prevMonthExpenseMTD = (prevExpenseRes.data || []).reduce((sum, row) => sum + (Number(row.amount) || 0), 0);

  const totalPiutang = invoices
    // filter ini menyisakan transaksi/invoice yang statusnya sesuai filter yang dipilih user.
    .filter(i => i.status === 'unpaid' || i.status === 'overdue')
    // reduce ini menggabungkan daftar data menjadi satu nilai ringkasan yang dibutuhkan helper database yang menghitung angka dashboard, grafik, laporan, aktivitas, dan ranking.
    .reduce((s, i) => s + (Number(i.grand_total) || 0), 0);

  const netProfit = allTimeIncome - allTimeExpense;
  const prevNetProfitMTD = prevMonthIncomeMTD - prevMonthExpenseMTD;

  const result = {
    totalIncomeMonth,
    totalExpenseMonth,
    netProfit,
    prevNetProfitMTD,
    prevMonthIncomeMTD,
    prevMonthExpenseMTD,
    totalPiutang,
    totalInvoices: invoices.length,
    // filter ini menyisakan transaksi/invoice yang statusnya sesuai filter yang dipilih user.
    paidInvoices: invoices.filter(i => i.status === 'paid').length,
    // filter ini menyisakan transaksi/invoice yang statusnya sesuai filter yang dipilih user.
    unpaidInvoices: invoices.filter(i => i.status === 'unpaid').length,
    // filter ini menyisakan transaksi/invoice yang statusnya sesuai filter yang dipilih user.
    overdueInvoices: invoices.filter(i => i.status === 'overdue').length,
  };

  console.log('[Dashboard] Final summary result:', result);
  // result mengembalikan nilai yang dibutuhkan oleh helper data dashboard.
  return result;
}

// ─── DASHBOARD CHART DATA ─────────────────────────────────────────────────────

export async function getDashboardChartData(year: number, month: number) {
  const supabase = createClient();
  const start = `${year}-${String(month).padStart(2, '0')}-01`;
  const end = month === 12
    ? `${year + 1}-01-01`
    : `${year}-${String(month + 1).padStart(2, '0')}-01`;

  const prevMonth = month === 1 ? 12 : month - 1;
  const prevYear = month === 1 ? year - 1 : year;
  const prevStart = `${prevYear}-${String(prevMonth).padStart(2, '0')}-01`;
  const prevEnd = start;

  // await Promise.all menunggu beberapa query berjalan paralel sampai semuanya selesai.
  const [incomeData, expenseData, prevIncomeData, prevExpenseData] = await Promise.all([
    supabase.from('income').select('date, amount').gte('date', start).lt('date', end),
    supabase.from('expense').select('date, amount').gte('date', start).lt('date', end),
    supabase.from('income').select('date, amount').gte('date', prevStart).lt('date', prevEnd),
    supabase.from('expense').select('date, amount').gte('date', prevStart).lt('date', prevEnd),
  ]);

  const daysInMonth = new Date(year, month, 0).getDate();
  const chartData = [];

  for (let i = 1; i <= daysInMonth; i++) {
    const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
    const prevDateStr = `${prevYear}-${String(prevMonth).padStart(2, '0')}-${String(i).padStart(2, '0')}`;

    // Bagian dayIncome menyimpan logika yang dipakai di bawahnya.
    const dayIncome = (incomeData.data || [])
      // filter ini menyisakan data helper data dashboard yang cocok dengan pencarian, status, role, atau tanggal aktif.
      .filter(item => item.date === dateStr)
      // reduce ini menjumlahkan nominal transaksi untuk ringkasan angka di helper database yang menghitung angka dashboard, grafik, laporan, aktivitas, dan ranking.
      .reduce((sum, item) => sum + Number(item.amount), 0);
    // Bagian dayExpense menyimpan logika yang dipakai di bawahnya.
    const dayExpense = (expenseData.data || [])
      // filter ini menyisakan data helper data dashboard yang cocok dengan pencarian, status, role, atau tanggal aktif.
      .filter(item => item.date === dateStr)
      // reduce ini menjumlahkan nominal transaksi untuk ringkasan angka di helper database yang menghitung angka dashboard, grafik, laporan, aktivitas, dan ranking.
      .reduce((sum, item) => sum + Number(item.amount), 0);

    // Bagian prevDayIncome menyimpan logika yang dipakai di bawahnya.
    const prevDayIncome = (prevIncomeData.data || [])
      // filter ini menyisakan data helper data dashboard yang cocok dengan pencarian, status, role, atau tanggal aktif.
      .filter(item => item.date === prevDateStr)
      // reduce ini menjumlahkan nominal transaksi untuk ringkasan angka di helper database yang menghitung angka dashboard, grafik, laporan, aktivitas, dan ranking.
      .reduce((sum, item) => sum + Number(item.amount), 0);
    // Bagian prevDayExpense menyimpan logika yang dipakai di bawahnya.
    const prevDayExpense = (prevExpenseData.data || [])
      // filter ini menyisakan data helper data dashboard yang cocok dengan pencarian, status, role, atau tanggal aktif.
      .filter(item => item.date === prevDateStr)
      // reduce ini menjumlahkan nominal transaksi untuk ringkasan angka di helper database yang menghitung angka dashboard, grafik, laporan, aktivitas, dan ranking.
      .reduce((sum, item) => sum + Number(item.amount), 0);

    chartData.push({
      name: String(i),
      pendapatan: dayIncome,
      pengeluaran: dayExpense,
      laba: dayIncome - dayExpense,
      last: prevDayIncome - prevDayExpense
    });
  }
  // prevDayExpense mengembalikan nilai yang dibutuhkan oleh helper data dashboard.
  return chartData;
}

// ─── DASHBOARD YEARLY DATA ───────────────────────────────────────────────────

export async function getDashboardYearlyData(year: number) {
  const supabase = createClient();
  const start = `${year}-01-01`;
  const end = `${year + 1}-01-01`;

  // await Promise.all menunggu beberapa query berjalan paralel sampai semuanya selesai.
  const [incomeRes, expenseRes] = await Promise.all([
    supabase.from('income').select('date, amount').gte('date', start).lt('date', end),
    supabase.from('expense').select('date, amount').gte('date', start).lt('date', end),
  ]);

  const months = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Ags", "Sep", "Okt", "Nov", "Des"];
  // map ini membuat tombol nama bulan supaya user bisa mengganti bulan di kalender.
  const yearlyData = months.map((m, idx) => {
    const monthNum = idx + 1;
    const monthStr = `${year}-${String(monthNum).padStart(2, '0')}`;
    
    // Bagian monthIncome menyimpan logika yang dipakai di bawahnya.
    const monthIncome = (incomeRes.data || [])
      // filter ini menyisakan data helper data dashboard yang cocok dengan pencarian, status, role, atau tanggal aktif.
      .filter(item => item.date.startsWith(monthStr))
      // reduce ini menjumlahkan nominal transaksi untuk ringkasan angka di helper database yang menghitung angka dashboard, grafik, laporan, aktivitas, dan ranking.
      .reduce((sum, item) => sum + (Number(item.amount) || 0), 0);
      
    // Bagian monthExpense menyimpan logika yang dipakai di bawahnya.
    const monthExpense = (expenseRes.data || [])
      // filter ini menyisakan data helper data dashboard yang cocok dengan pencarian, status, role, atau tanggal aktif.
      .filter(item => item.date.startsWith(monthStr))
      // reduce ini menjumlahkan nominal transaksi untuk ringkasan angka di helper database yang menghitung angka dashboard, grafik, laporan, aktivitas, dan ranking.
      .reduce((sum, item) => sum + (Number(item.amount) || 0), 0);

    // monthExpense mengembalikan nilai yang dibutuhkan oleh helper data dashboard.
    return {
      name: m,
      pendapatan: monthIncome,
      pengeluaran: monthExpense,
      laba: monthIncome - monthExpense
    };
  });

  // monthExpense mengembalikan nilai yang dibutuhkan oleh helper data dashboard.
  return yearlyData;
}

// ─── REPORT CHART DATA ────────────────────────────────────────────────────────

export async function getFinancialReport(startDate: string, endDate: string) {
  const supabase = createClient();
  // await Promise.all menunggu beberapa query berjalan paralel sampai semuanya selesai.
  const [incomeRes, expenseRes] = await Promise.all([
    supabase.from('income').select('amount').gte('date', startDate).lte('date', endDate),
    supabase.from('expense').select('amount').gte('date', startDate).lte('date', endDate),
  ]);
  // totalIncome menjumlahkan seluruh nominal income yang masuk ke laporan.
  const totalIncome = (incomeRes.data || []).reduce((s, r) => s + (Number(r.amount) || 0), 0);
  // totalExpense menjumlahkan seluruh nominal expense yang masuk ke laporan.
  const totalExpense = (expenseRes.data || []).reduce((s, r) => s + (Number(r.amount) || 0), 0);
  // totalExpense mengembalikan nilai yang dibutuhkan oleh helper data dashboard.
  return { totalIncome, totalExpense, netProfit: totalIncome - totalExpense };
}

// getReportChartData membuat data grafik laporan dari setiap tanggal dalam rentang yang dipilih.
export async function getReportChartData(startDate: string, endDate: string) {
  const supabase = createClient();
  // await Promise.all menunggu beberapa query berjalan paralel sampai semuanya selesai.
  const [incomeRes, expenseRes] = await Promise.all([
    supabase.from('income').select('date, amount').gte('date', startDate).lte('date', endDate),
    supabase.from('expense').select('date, amount').gte('date', startDate).lte('date', endDate),
  ]);
  const incomes = incomeRes.data || [];
  const expenses = expenseRes.data || [];

  const start = new Date(startDate);
  const end = new Date(endDate);
  start.setHours(0, 0, 0, 0);
  end.setHours(0, 0, 0, 0);

  const chartData = [];
  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    const dateStr = d.toISOString().split('T')[0];
    // filter ini menyisakan data helper data dashboard yang cocok dengan pencarian, status, role, atau tanggal aktif.
    const dayIncome = incomes.filter(i => i.date === dateStr).reduce((s, i) => s + Number(i.amount), 0);
    // filter ini menyisakan data helper data dashboard yang cocok dengan pencarian, status, role, atau tanggal aktif.
    const dayExpense = expenses.filter(i => i.date === dateStr).reduce((s, i) => s + Number(i.amount), 0);
    chartData.push({ dateStr, income: dayIncome, expense: dayExpense });
  }
  // dayExpense mengembalikan nilai yang dibutuhkan oleh helper data dashboard.
  return chartData;
}

// ─── STATS ────────────────────────────────────────────────────────────────────

export async function getTopClientsStats(limit = 3) {
  const supabase = createClient();
  // await menunggu respons Supabase selesai sebelum kode memakai data atau error yang dikembalikan.
  const { data, error } = await supabase
    .from('invoices')
    .select('client_id, client_name, grand_total, status')
    .neq('status', 'cancelled');

  // Kalau Supabase mengembalikan error atau data kosong, helper data dashboard menampilkan pesan gagal atau mengembalikan data kosong agar UI tidak rusak.
  if (error || !data) return [];

  const clientTotals: Record<string, { id: string; name: string; total: number }> = {};
  data.forEach(inv => {
    // Kondisi if (inv.client_id) membuat isi blok if di bawahnya hanya berjalan saat kondisi itu benar di helper data dashboard.
    if (inv.client_id) {
      // Kondisi if (!clientTotals[inv.client_id]) membuat isi blok if di bawahnya hanya berjalan saat kondisi itu benar di helper data dashboard.
      if (!clientTotals[inv.client_id]) {
        clientTotals[inv.client_id] = { id: inv.client_id, name: inv.client_name, total: 0 };
      }
      clientTotals[inv.client_id].total += Number(inv.grand_total) || 0;
    }
  });

  // reduce ini menjumlahkan nominal transaksi untuk ringkasan angka di helper database yang menghitung angka dashboard, grafik, laporan, aktivitas, dan ranking.
  const overallTotal = Object.values(clientTotals).reduce((sum, c) => sum + c.total, 0);

  // overallTotal mengembalikan nilai yang dibutuhkan oleh helper data dashboard.
  return Object.values(clientTotals)
    .sort((a, b) => b.total - a.total)
    .slice(0, limit)
    // map ini membuat satu output untuk setiap item daftar yang sedang dirender oleh helper data dashboard.
    .map((c, i) => ({
      id: c.id,
      name: c.name,
      total: c.total,
      percent: overallTotal ? Math.round((c.total / overallTotal) * 100) : 0,
      color: ['#7983ff', '#76c893', '#a78bfa', '#ffd166'][i % 4],
    }));
}

// getTopProducts menghitung produk/item invoice yang paling banyak dijual.
export async function getTopProducts(limit = 3) {
  const supabase = createClient();
  // await menunggu respons Supabase selesai sebelum kode memakai data atau error yang dikembalikan.
  const { data, error } = await supabase.from('invoice_items').select('description, quantity');
  // Kalau Supabase mengembalikan error atau data kosong, helper data dashboard menampilkan pesan gagal atau mengembalikan data kosong agar UI tidak rusak.
  if (error || !data) return [];

  const productTotals: Record<string, number> = {};
  data.forEach(item => {
    productTotals[item.description] = (productTotals[item.description] || 0) + Number(item.quantity);
  });

  // productTotals mengembalikan nilai yang dibutuhkan oleh helper data dashboard.
  return Object.entries(productTotals)
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    // map ini membuat satu output untuk setiap item daftar yang sedang dirender oleh helper data dashboard.
    .map(([name, qty]) => ({ name, quantity: qty }));
}

// getRecentActivities menggabungkan income, expense, invoice, audit log, dan reminder overdue menjadi feed aktivitas dashboard/navbar.
export async function getRecentActivities(limit = 5) {
  // await menunggu proses async selesai sebelum helper data dashboard melanjutkan langkah berikutnya.
  await checkAndUpdateOverdueInvoices();
  const supabase = createClient();

  // await Promise.all menunggu beberapa query berjalan paralel sampai semuanya selesai.
  const [incomes, expenses, invoices, audits, reminders] = await Promise.all([
    supabase.from('income').select('id, created_at, date, source, amount').order('created_at', { ascending: false }).limit(limit),
    supabase.from('expense').select('id, created_at, date, expense_type, amount').order('created_at', { ascending: false }).limit(limit),
    supabase.from('invoices').select('id, created_at, invoice_date, invoice_number, client_name, status').order('created_at', { ascending: false }).limit(limit),
    supabase.from('audit_logs').select('id, created_at, entity_type, action, new_values, old_values').order('created_at', { ascending: false }).limit(limit * 2),
    supabase.from('invoices').select('id, invoice_number, client_name, due_date').eq('status', 'overdue').order('due_date', { ascending: false }).limit(limit),
  ]);

  console.log('[DEBUG] getRecentActivities audits:', { error: audits.error, data: audits.data });

  const otherActivities: any[] = [];

  (incomes.data || []).forEach(inc => {
    otherActivities.push({ id: `inc-${inc.id}`, type: 'income', title: 'Pendapatan Diterima', desc: inc.source, amount: inc.amount, date: new Date(inc.created_at || inc.date) });
  });

  (expenses.data || []).forEach(exp => {
    otherActivities.push({ id: `exp-${exp.id}`, type: 'expense', title: 'Pengeluaran Dicatat', desc: exp.expense_type, amount: exp.amount, date: new Date(exp.created_at || exp.date) });
  });

  (invoices.data || []).forEach(inv => {
    otherActivities.push({ id: `inv-${inv.id}`, type: 'invoice', title: 'Invoice Dibuat', desc: `${inv.invoice_number} - ${inv.client_name}`, amount: null, date: new Date(inv.created_at || inv.invoice_date) });
  });

  (audits.data || []).forEach(aud => {
    let desc = `Sistem diperbarui: ${aud.action} ${aud.entity_type}`;
    let type = 'system';
    let title = 'Konfigurasi Sistem';

    // Kondisi if (aud.entity_type === 'Export') membuat isi blok if di bawahnya hanya berjalan saat kondisi itu benar di helper data dashboard.
    if (aud.entity_type === 'Export') {
      // Type ini memberi nama pada bentuk data yang dipakai helper database yang menghitung angka dashboard, grafik, laporan, aktivitas, dan ranking.
      type = 'export';
      title = 'Ekspor Data';
      let val = aud.new_values;
      // Kondisi if (typeof val === 'string') try { val = JSON.parse(val); } catch(e) {} membuat isi blok if di bawahnya hanya berjalan saat kondisi itu benar di helper data dashboard.
      if (typeof val === 'string') try { val = JSON.parse(val); } catch(e) {}
      desc = val?.description || `Ekspor ${aud.action} berhasil diunduh`;
    } else if (aud.entity_type === 'E-Invoice' || aud.entity_type === 'Invoice') {
      // Type ini memberi nama pada bentuk data yang dipakai helper database yang menghitung angka dashboard, grafik, laporan, aktivitas, dan ranking.
      type = 'invoice';
      title = aud.action === 'create' ? 'Invoice Dibuat' : 'Invoice Diperbarui';
      let val = aud.new_values;
      // Kondisi if (typeof val === 'string') try { val = JSON.parse(val); } catch(e) {} membuat isi blok if di bawahnya hanya berjalan saat kondisi itu benar di helper data dashboard.
      if (typeof val === 'string') try { val = JSON.parse(val); } catch(e) {}
      desc = val?.description || (aud.action === 'create' ? 'Invoice baru berhasil dibuat' : 'Invoice berhasil diperbarui');
    } else if (aud.entity_type === 'Category Order') {
      let val = aud.new_values;
      // Kondisi if (typeof val === 'string') membuat isi blok if di bawahnya hanya berjalan saat kondisi itu benar di helper data dashboard.
      if (typeof val === 'string') {
        // try ini mengambil salah satu sumber aktivitas dashboard; kalau sumber itu gagal, sumber lain tetap dipakai.
        try { val = JSON.parse(val); } catch(e) {}
      }
      
      // Extract properties for detection
      const sysType = val?.system_type;
      const hasTax = val && ('tax_rate' in val || 'npwp' in val);
      const hasBank = val && ('bank_name' in val || 'bank_account' in val || 'bank_account_name' in val);
      const hasUserRole = val && ('role' in val);
      const hasUserStatus = val && ('is_active' in val && sysType === 'user_status');

      // 1. Prioritize specific system types from new_values
      if (sysType === 'company_profile' || (val && 'company_name' in val)) {
        desc = 'Profil perusahaan berhasil diperbarui';
      } else if (sysType === 'tax_rate' || hasTax) {
        desc = 'Pengaturan pajak diperbarui';
      } else if (sysType === 'payment_method' || hasBank) {
        desc = 'Metode pembayaran diperbarui';
      } else if (sysType === 'user_role' || hasUserRole) {
        desc = 'Hak akses (role) pengguna diperbarui';
      } else if (sysType === 'user_status' || hasUserStatus) {
        desc = 'Status/akun pengguna berhasil dinonaktifkan';
      } 
      // 2. Fallback to Category Logic
      else if (aud.action === 'create') {
        const name = val?.name;
        desc = name ? `Kategori '${name}' berhasil ditambahkan` : 'Kategori baru berhasil ditambahkan';
      }
      // Kondisi else if (aud.action === 'delete') membuat isi blok if di bawahnya hanya berjalan saat kondisi itu benar di helper data dashboard.
      else if (aud.action === 'delete') {
        let oldVal = aud.old_values;
        // Kondisi if (typeof oldVal === 'string') try { oldVal = JSON.parse(oldVal); } catch(e) {} membuat isi blok if di bawahnya hanya berjalan saat kondisi itu benar di helper data dashboard.
        if (typeof oldVal === 'string') try { oldVal = JSON.parse(oldVal); } catch(e) {}
        const name = oldVal?.name;
        desc = name ? `Kategori '${name}' berhasil dihapus` : 'Kategori berhasil dihapus';
      }
      // Kalau tanggal/bulan/tahun cocok dengan filter aktif, data itu ikut dihitung atau ditampilkan.
      else if (aud.action === 'update') {
        desc = 'Urutan kategori diperbarui';
      }
    }

    otherActivities.push({ 
      id: `aud-${aud.id}`, 
      type, 
      title, 
      desc,
      amount: null, 
      date: new Date(aud.created_at) 
    });
  });

  const reminderActivities: any[] = [];
  (reminders.data || []).forEach(rem => {
    reminderActivities.push({ 
      id: `rem-${rem.id}`, 
      type: 'reminder', 
      title: 'Pengingat Jatuh Tempo', 
      desc: `Invoice ${rem.invoice_number} (${rem.client_name}) melewati batas waktu`, 
      amount: null, 
      date: new Date(rem.due_date) 
    });
  });

  const sortedOthers = otherActivities
    .sort((a, b) => b.date.getTime() - a.date.getTime())
    .slice(0, limit);

  // Return reminders at the very top (highest priority), followed by recent historical logs
  return [...reminderActivities, ...sortedOthers];
}

// ─── ACCOUNTING REPORTS DATA ──────────────────────────────────────────────────

export async function getAccountingReportsData(startDate: string, endDate: string) {
  const supabase = createClient();
  
  // await Promise.all menunggu beberapa query berjalan paralel sampai semuanya selesai.
  const [incomeRes, expenseRes] = await Promise.all([
    supabase.from('income').select('id, date, source, description, amount, reference_number, categories(name)').gte('date', startDate).lte('date', endDate),
    supabase.from('expense').select('id, date, expense_type, description, amount, reference_number, categories(name)').gte('date', startDate).lte('date', endDate),
  ]);

  // incomes mengambil baris pemasukan yang akan digabung ke laporan akuntansi.
  const incomes = (incomeRes.data || []).map(i => ({
    id: i.id,
    date: i.date,
    type: 'income',
    title: i.source || 'Pendapatan',
    description: i.description,
    reference: i.reference_number,
    category: (i.categories as any)?.name || 'Lainnya',
    amount: Number(i.amount)
  }));

  // expenses mengambil baris pengeluaran yang akan digabung ke laporan akuntansi.
  const expenses = (expenseRes.data || []).map(e => ({
    id: e.id,
    date: e.date,
    type: 'expense',
    title: e.expense_type || 'Pengeluaran',
    description: e.description,
    reference: e.reference_number,
    category: (e.categories as any)?.name || 'Lainnya',
    amount: Number(e.amount)
  }));

  const combined = [...incomes, ...expenses].sort((a, b) => {
    // combined mengembalikan nilai yang dibutuhkan oleh helper data dashboard.
    return new Date(a.date).getTime() - new Date(b.date).getTime();
  });

  // combined mengembalikan nilai yang dibutuhkan oleh helper data dashboard.
  return combined;
}

