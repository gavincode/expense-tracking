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
  deleted?: number; // 0 = 正常, 1 = 已删除（软删除 tombstone）
}

export interface CustomCategory {
  id: string;
  groupId: string | null; // null = 一级分类
  name: string;
  color: string;
  colorLight: string;
  colorDark: string;
  createdAt: number;
}

class LedgerDB extends Dexie {
  expenses!: Table<ExpenseRecord, number>;
  categories!: Table<CustomCategory, string>;

  constructor() {
    super('renovation-ledger');
    this.version(1).stores({
      expenses: '++id, date, categoryId, createdAt, updatedAt',
    });
    this.version(2).stores({
      expenses: '++id, date, categoryId, createdAt, updatedAt',
      categories: 'id, groupId, createdAt',
    });
    this.version(3).stores({
      expenses: '++id, date, categoryId, createdAt, updatedAt, deleted',
      categories: 'id, groupId, createdAt, deleted',
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
    deleted: 0,
  });
}

export async function updateExpense(
  id: number,
  fields: Partial<Pick<ExpenseRecord, 'amountCents' | 'categoryId' | 'categoryPath' | 'date' | 'note'>>,
): Promise<void> {
  await db.expenses.update(id, { ...fields, updatedAt: Date.now() });
}

export async function listRecent(limit = 5): Promise<ExpenseRecord[]> {
  const rows = (await db.expenses.orderBy('date').reverse().toArray())
    .filter((r) => !r.deleted)
    .slice(0, limit);
  return rows.sort((a, b) => b.date.localeCompare(a.date) || b.createdAt - a.createdAt);
}

export async function listAll(): Promise<ExpenseRecord[]> {
  const rows = (await db.expenses.orderBy('date').reverse().toArray()).filter((r) => !r.deleted);
  return rows.sort((a, b) => b.date.localeCompare(a.date) || b.createdAt - a.createdAt);
}

export async function getById(id: number): Promise<ExpenseRecord | undefined> {
  const record = await db.expenses.get(id);
  return record && !record.deleted ? record : undefined;
}

export interface MonthSummary {
  totalCents: number;
  count: number;
}

export async function getMonthSummary(yearMonth: string): Promise<MonthSummary> {
  const rows = (await db.expenses.where('date').startsWith(yearMonth).toArray()).filter(
    (r) => !r.deleted,
  );
  return {
    totalCents: rows.reduce((sum, r) => sum + r.amountCents, 0),
    count: rows.length,
  };
}

export async function deleteExpense(id: number): Promise<void> {
  await db.expenses.update(id, { deleted: 1, updatedAt: Date.now() });
}

export async function addCustomCategory(
  input: Omit<CustomCategory, 'createdAt'>,
): Promise<string> {
  await db.categories.add({ ...input, createdAt: Date.now() });
  return input.id;
}

export async function listCustomCategories(): Promise<CustomCategory[]> {
  return db.categories.toArray();
}
