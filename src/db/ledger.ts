import Dexie, { type Table } from 'dexie';

export interface ExpenseRecord {
  id?: number;
  amountCents: number;
  categoryId: string;
  categoryPath: string;
  date: string; // YYYY-MM-DD
  note: string;
  createdAt: number;
  updatedAt: number;
}

class LedgerDB extends Dexie {
  expenses!: Table<ExpenseRecord, number>;

  constructor() {
    super('renovation-ledger');
    this.version(1).stores({
      expenses: '++id, date, categoryId, createdAt, updatedAt',
    });
  }
}

export const db = new LedgerDB();

export interface NewExpense {
  amountCents: number;
  categoryId: string;
  categoryPath: string;
  date: string;
  note?: string;
}

export async function addExpense(input: NewExpense): Promise<number> {
  const now = Date.now();
  return db.expenses.add({
    ...input,
    note: input.note ?? '',
    createdAt: now,
    updatedAt: now,
  });
}

export async function listRecent(limit = 5): Promise<ExpenseRecord[]> {
  const rows = await db.expenses.orderBy('date').reverse().limit(limit).toArray();
  return rows.sort((a, b) => b.date.localeCompare(a.date) || b.createdAt - a.createdAt);
}

export async function listAll(): Promise<ExpenseRecord[]> {
  const rows = await db.expenses.orderBy('date').reverse().toArray();
  return rows.sort((a, b) => b.date.localeCompare(a.date) || b.createdAt - a.createdAt);
}

export async function getById(id: number): Promise<ExpenseRecord | undefined> {
  return db.expenses.get(id);
}

export interface MonthSummary {
  totalCents: number;
  count: number;
}

export async function getMonthSummary(yearMonth: string): Promise<MonthSummary> {
  const rows = await db.expenses.where('date').startsWith(yearMonth).toArray();
  return {
    totalCents: rows.reduce((sum, r) => sum + r.amountCents, 0),
    count: rows.length,
  };
}
