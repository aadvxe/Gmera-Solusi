import { createClient } from '@/utils/supabase/client';
import { getTotalIncome } from './income';
import { getTotalExpense } from './expense';
import { getInvoices, checkAndUpdateOverdueInvoices } from './invoices';

// ─── DASHBOARD SUMMARY ────────────────────────────────────────────────────────

export async function getDashboardSummary(year?: number, month?: number) {
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1;

  const selectedYear = year || currentYear;
  const selectedMonth = month || currentMonth;

  let day = now.getDate();
  if (selectedYear !== currentYear || selectedMonth !== currentMonth) {
    day = new Date(selectedYear, selectedMonth, 0).getDate();
  }

  console.log('[Dashboard] getDashboardSummary called', { selectedYear, selectedMonth, day });

  const prevMonth = selectedMonth === 1 ? 12 : selectedMonth - 1;
  const prevYear = selectedMonth === 1 ? selectedYear - 1 : selectedYear;

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

  const prevMonthIncomeMTD = (prevIncomeRes.data || []).reduce((sum, row) => sum + (Number(row.amount) || 0), 0);
  const prevMonthExpenseMTD = (prevExpenseRes.data || []).reduce((sum, row) => sum + (Number(row.amount) || 0), 0);

  const totalPiutang = invoices
    .filter(i => i.status === 'unpaid' || i.status === 'overdue')
    .reduce((s, i) => s + (Number(i.grand_total) || 0), 0);

  const netProfit = allTimeIncome - allTimeExpense;
  const prevNetProfitMTD = prevMonthIncomeMTD - prevMonthExpenseMTD;

  const result = {
    totalIncomeMonth,
    totalExpenseMonth,
    netProfit,
    prevNetProfitMTD,
    totalPiutang,
    totalInvoices: invoices.length,
    paidInvoices: invoices.filter(i => i.status === 'paid').length,
    unpaidInvoices: invoices.filter(i => i.status === 'unpaid').length,
    overdueInvoices: invoices.filter(i => i.status === 'overdue').length,
  };

  console.log('[Dashboard] Final summary result:', result);
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

    const dayIncome = (incomeData.data || [])
      .filter(item => item.date === dateStr)
      .reduce((sum, item) => sum + Number(item.amount), 0);
    const dayExpense = (expenseData.data || [])
      .filter(item => item.date === dateStr)
      .reduce((sum, item) => sum + Number(item.amount), 0);

    const prevDayIncome = (prevIncomeData.data || [])
      .filter(item => item.date === prevDateStr)
      .reduce((sum, item) => sum + Number(item.amount), 0);
    const prevDayExpense = (prevExpenseData.data || [])
      .filter(item => item.date === prevDateStr)
      .reduce((sum, item) => sum + Number(item.amount), 0);

    chartData.push({
      name: String(i),
      pendapatan: dayIncome,
      pengeluaran: dayExpense,
      laba: dayIncome - dayExpense,
      last: prevDayIncome - prevDayExpense
    });
  }
  return chartData;
}

// ─── DASHBOARD YEARLY DATA ───────────────────────────────────────────────────

export async function getDashboardYearlyData(year: number) {
  const supabase = createClient();
  const start = `${year}-01-01`;
  const end = `${year + 1}-01-01`;

  const [incomeRes, expenseRes] = await Promise.all([
    supabase.from('income').select('date, amount').gte('date', start).lt('date', end),
    supabase.from('expense').select('date, amount').gte('date', start).lt('date', end),
  ]);

  const months = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Ags", "Sep", "Okt", "Nov", "Des"];
  const yearlyData = months.map((m, idx) => {
    const monthNum = idx + 1;
    const monthStr = `${year}-${String(monthNum).padStart(2, '0')}`;
    
    const monthIncome = (incomeRes.data || [])
      .filter(item => item.date.startsWith(monthStr))
      .reduce((sum, item) => sum + (Number(item.amount) || 0), 0);
      
    const monthExpense = (expenseRes.data || [])
      .filter(item => item.date.startsWith(monthStr))
      .reduce((sum, item) => sum + (Number(item.amount) || 0), 0);

    return {
      name: m,
      pendapatan: monthIncome,
      pengeluaran: monthExpense,
      laba: monthIncome - monthExpense
    };
  });

  return yearlyData;
}

// ─── REPORT CHART DATA ────────────────────────────────────────────────────────

export async function getFinancialReport(startDate: string, endDate: string) {
  const supabase = createClient();
  const [incomeRes, expenseRes] = await Promise.all([
    supabase.from('income').select('amount').gte('date', startDate).lte('date', endDate),
    supabase.from('expense').select('amount').gte('date', startDate).lte('date', endDate),
  ]);
  const totalIncome = (incomeRes.data || []).reduce((s, r) => s + (Number(r.amount) || 0), 0);
  const totalExpense = (expenseRes.data || []).reduce((s, r) => s + (Number(r.amount) || 0), 0);
  return { totalIncome, totalExpense, netProfit: totalIncome - totalExpense };
}

export async function getReportChartData(startDate: string, endDate: string) {
  const supabase = createClient();
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
    const dayIncome = incomes.filter(i => i.date === dateStr).reduce((s, i) => s + Number(i.amount), 0);
    const dayExpense = expenses.filter(i => i.date === dateStr).reduce((s, i) => s + Number(i.amount), 0);
    chartData.push({ dateStr, income: dayIncome, expense: dayExpense });
  }
  return chartData;
}

// ─── STATS ────────────────────────────────────────────────────────────────────

export async function getTopClientsStats(limit = 3) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('invoices')
    .select('client_id, client_name, grand_total, status')
    .neq('status', 'cancelled');

  if (error || !data) return [];

  const clientTotals: Record<string, { id: string; name: string; total: number }> = {};
  data.forEach(inv => {
    if (inv.client_id) {
      if (!clientTotals[inv.client_id]) {
        clientTotals[inv.client_id] = { id: inv.client_id, name: inv.client_name, total: 0 };
      }
      clientTotals[inv.client_id].total += Number(inv.grand_total) || 0;
    }
  });

  return Object.values(clientTotals)
    .sort((a, b) => b.total - a.total)
    .slice(0, limit)
    .map((c, i) => ({
      id: c.id,
      name: c.name,
      total: c.total,
      color: ['bg-[#7983ff]', 'bg-[#76c893]', 'bg-[#a78bfa]', 'bg-[#ffd166]'][i % 4],
    }));
}

export async function getTopProducts(limit = 3) {
  const supabase = createClient();
  const { data, error } = await supabase.from('invoice_items').select('description, quantity');
  if (error || !data) return [];

  const productTotals: Record<string, number> = {};
  data.forEach(item => {
    productTotals[item.description] = (productTotals[item.description] || 0) + Number(item.quantity);
  });

  return Object.entries(productTotals)
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([name, qty]) => ({ name, quantity: qty }));
}

export async function getRecentActivities(limit = 5) {
  await checkAndUpdateOverdueInvoices();
  const supabase = createClient();

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

    if (aud.entity_type === 'Export') {
      type = 'export';
      title = 'Ekspor Data';
      let val = aud.new_values;
      if (typeof val === 'string') try { val = JSON.parse(val); } catch(e) {}
      desc = val?.description || `Ekspor ${aud.action} berhasil diunduh`;
    } else if (aud.entity_type === 'E-Invoice' || aud.entity_type === 'Invoice') {
      type = 'invoice';
      title = aud.action === 'create' ? 'Invoice Dibuat' : 'Invoice Diperbarui';
      let val = aud.new_values;
      if (typeof val === 'string') try { val = JSON.parse(val); } catch(e) {}
      desc = val?.description || (aud.action === 'create' ? 'Invoice baru berhasil dibuat' : 'Invoice berhasil diperbarui');
    } else if (aud.entity_type === 'Category Order') {
      let val = aud.new_values;
      if (typeof val === 'string') {
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
      else if (aud.action === 'delete') {
        let oldVal = aud.old_values;
        if (typeof oldVal === 'string') try { oldVal = JSON.parse(oldVal); } catch(e) {}
        const name = oldVal?.name;
        desc = name ? `Kategori '${name}' berhasil dihapus` : 'Kategori berhasil dihapus';
      }
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
  
  const [incomeRes, expenseRes] = await Promise.all([
    supabase.from('income').select('id, date, source, description, amount, reference_number, categories(name)').gte('date', startDate).lte('date', endDate),
    supabase.from('expense').select('id, date, expense_type, description, amount, reference_number, categories(name)').gte('date', startDate).lte('date', endDate),
  ]);

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
    return new Date(a.date).getTime() - new Date(b.date).getTime();
  });

  return combined;
}

