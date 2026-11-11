export type Expense = { id: string; name: string; category: 'Wedding' | 'Honeymoon'; supplier: string; amount: number; due: string; notes: string };
export type Payment = { id: string; expenseId: string; amount: number; date: string; by: string };
export type Contribution = { id: string; name: string; amount: number; date: string; received: boolean };
export type Budget = { version: 1; names: string; weddingDate: string; targetDate: string; opening: number; reserve: number; expenses: Expense[]; payments: Payment[]; contributions: Contribution[] };
export const initialBudget = (): Budget => ({ version: 1, names: '', weddingDate: '', targetDate: '', opening: 0, reserve: 0, expenses: [], payments: [], contributions: [] });
export const money = (n: number) => new Intl.NumberFormat('en-ZA', { style: 'currency', currency: 'ZAR' }).format(n);
export const round = (n: number) => Math.round(n * 100) / 100;
export const sum = (values: number[]) => round(values.reduce((a, b) => a + b, 0));
export const today = () => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`; };
export const paidFor = (b: Budget, id: string) => sum(b.payments.filter(p => p.expenseId === id).map(p => p.amount));
export function totals(b: Budget) {
  const allocated = sum(b.expenses.map(e => e.amount));
  const paid = sum(b.payments.map(p => p.amount));
  const received = sum(b.contributions.filter(c => c.received).map(c => c.amount));
  const planned = sum(b.contributions.filter(c => !c.received && !!b.targetDate && c.date <= b.targetDate).map(c => c.amount));
  const available = round(b.opening + received - paid);
  const outstanding = round(allocated - paid);
  return { allocated, paid, received, planned, available, outstanding, final: round(available + planned - outstanding - b.reserve), free: round(available - outstanding - b.reserve) };
}
export function forecast(b: Budget) {
  let balance = totals(b).available;
  const events = [
    ...b.contributions.filter(c => !c.received && c.date <= b.targetDate).map(c => ({ date: c.date, label: c.name, change: c.amount })),
    ...b.expenses.filter(e => e.due && e.due <= b.targetDate && e.amount > paidFor(b,e.id)).map(e => ({ date: e.due, label: e.name, change: -round(e.amount-paidFor(b,e.id)) }))
  ].sort((a,b) => a.date.localeCompare(b.date) || a.change-b.change);
  return events.map(e => ({...e, balance: balance = round(balance+e.change)}));
}
export function validateBudget(value: unknown): value is Budget {
  if (!value || typeof value !== 'object') return false;
  const b = value as Budget;
  const str = (x: unknown) => typeof x === 'string' && x.length <= 5000;
  const amount = (x: unknown) => typeof x === 'number' && Number.isFinite(x) && x >= 0 && x <= 100000000 && Math.abs(round(x)-x) < 0.000001;
  const date = (x: unknown, empty = false) => typeof x === 'string' && ((empty && x === '') || (/^\d{4}-\d{2}-\d{2}$/.test(x) && !isNaN(Date.parse(x)) && new Date(x).toISOString().slice(0,10) === x));
  if (b.version !== 1 || !str(b.names) || !date(b.weddingDate,true) || !date(b.targetDate,true) || !amount(b.opening) || !amount(b.reserve)) return false;
  if (![b.expenses,b.payments,b.contributions].every(a => Array.isArray(a) && a.length <= 10000 && a.every(x => x && typeof x === 'object' && str(x.id) && x.id) && new Set(a.map(x => x.id)).size === a.length)) return false;
  if (!b.expenses.every(e => str(e.name) && e.name.trim() && str(e.supplier) && str(e.notes) && ['Wedding','Honeymoon'].includes(e.category) && amount(e.amount) && date(e.due,true))) return false;
  if (!b.payments.every(p => b.expenses.some(e => e.id === p.expenseId) && amount(p.amount) && p.amount > 0 && date(p.date) && str(p.by))) return false;
  if (!b.contributions.every(c => str(c.name) && c.name.trim() && amount(c.amount) && c.amount > 0 && date(c.date) && typeof c.received === 'boolean')) return false;
  return b.expenses.every(e => paidFor(b,e.id) <= e.amount);
}
