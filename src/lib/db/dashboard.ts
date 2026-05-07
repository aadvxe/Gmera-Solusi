import { createClient } from '@/utils/supabase/client';
import { getTotalIncome } from './income';
import { getTotalExpense } from './expense';
import { getInvoices } from './invoices';

// ─── DASHBOARD SUMMARY ────────────────────────────────────────────────────────

export async function getDashboardSummary() {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1;
  const day = now.getDate();

  const prevMonth = month === 1 ? 12 : month - 1;
  const prevYear = month === 1 ? year - 1 : year;

  const [totalIncomeMonth, totalExpenseMonth, invoices] = await Promise.all([
    getTotalIncome(year, month),
    getTotalExpense(year, month),
    getInvoices(),
  ]);

  const supabase = createClient();
  const prevMonthStart = `${prevYear}-${String(prevMonth).padStart(2, '0')}-01`;
  const prevMonthEndMTD = `${prevYear}-${String(prevMonth).padStart(2, '0')}-${String(day).padStart(2, '0')} 23:59:59`;

  const [prevIncomeRes, prevExpenseRes] = await Promise.all([
    supabase.from('income').select('amount').gte('date', prevMonthStart).lte('date', prevMonthEndMTD),
    supabase.from('expense').select('amount').gte('date', prevMonthStart).lte('date', prevMonthEndMTD),
  ]);

  const prevMonthIncomeMTD = (prevIncomeRes.data || []).reduce((sum, row) => sum + (row.amount || 0), 0);
  const prevMonthExpenseMTD = (prevExpenseRes.data || []).reduce((sum, row) => sum + (row.amount || 0), 0);

  const totalPiutang = invoices
    .filter(i => i.status === 'unpaid' || i.status === 'overdue')
    .reduce((s, i) => s + (i.grand_total || 0), 0);

  const netProfit = totalIncomeMonth - totalExpenseMonth;
  const prevNetProfitMTD = prevMonthIncomeMTD - prevMonthExpenseMTD;

  return {
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
}

// ─── DASHBOARD CHART DATA ─────────────────────────────────────────────────────

export async function getDashboardChartData(year: number, month: number) {
  const supabase = createClient();
  const start = `${year}-${String(month).padStart(2, '0')}-01`;
  const end = month === 12
    ? `${year + 1}-01-01`
    : `${year}-${String(month + 1).padStart(2, '0')}-01`;

  const [incomeData, expenseData] = await Promise.all([
    supabase.from('income').select('date, amount').gte('date', start).lt('date', end),
    supabase.from('expense').select('date, amount').gte('date', start).lt('date', end),
  ]);

  const daysInMonth = new Date(year, month, 0).getDate();
  const chartData = [];

  for (let i = 1; i <= daysInMonth; i++) {
    const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
    const dayIncome = (incomeData.data || [])
      .filter(item => item.date === dateStr)
      .reduce((sum, item) => sum + Number(item.amount), 0);
    const dayExpense = (expenseData.data || [])
      .filter(item => item.date === dateStr)
      .reduce((sum, item) => sum + Number(item.amount), 0);

    chartData.push({ name: String(i), pendapatan: dayIncome, pengeluaran: dayExpense, laba: dayIncome - dayExpense });
  }
  return chartData;
}

// ─── REPORT CHART DATA ────────────────────────────────────────────────────────

export async function getFinancialReport(startDate: string, endDate: string) {
  const supabase = createClient();
  const [incomeRes, expenseRes] = await Promise.all([
    supabase.from('income').select('amount').gte('date', startDate).lte('date', endDate),
    supabase.from('expense').select('amount').gte('date', startDate).lte('date', endDate),
  ]);
  const totalIncome = (incomeRes.data || []).reduce((s, r) => s + (r.amount || 0), 0);
  const totalExpense = (expenseRes.data || []).reduce((s, r) => s + (r.amount || 0), 0);
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
      clientTotals[inv.client_id].total += Number(inv.grand_total);
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
  const supabase = createClient();

  const [incomes, expenses, invoices] = await Promise.all([
    supabase.from('income').select('id, date, source, amount').order('created_at', { ascending: false }).limit(limit),
    supabase.from('expense').select('id, date, expense_type, amount').order('created_at', { ascending: false }).limit(limit),
    supabase.from('invoices').select('id, invoice_date, invoice_number, client_name, status').order('created_at', { ascending: false }).limit(limit),
  ]);

  const activities: any[] = [];

  (incomes.data || []).forEach(inc => {
    activities.push({ id: `inc-${inc.id}`, type: 'income', title: 'Pendapatan Diterima', desc: inc.source, amount: inc.amount, date: new Date(inc.date) });
  });

  (expenses.data || []).forEach(exp => {
    activities.push({ id: `exp-${exp.id}`, type: 'expense', title: 'Pengeluaran Dicatat', desc: exp.expense_type, amount: exp.amount, date: new Date(exp.date) });
  });

  (invoices.data || []).forEach(inv => {
    activities.push({ id: `inv-${inv.id}`, type: 'invoice', title: 'Invoice Dibuat', desc: `${inv.invoice_number} - ${inv.client_name}`, amount: null, date: new Date(inv.invoice_date) });
  });

  return activities
    .sort((a, b) => b.date.getTime() - a.date.getTime())
    .slice(0, limit);
}
