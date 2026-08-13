import Dexie, { type Table } from 'dexie';
import { uuid } from '../utils/uuid';

export interface ExpenseRecord {
  id?: number;
  cloudId?: string;
  amountCents: number;
  categoryId: string;
  categoryPath: string;
  date: string; // YYYY-MM-DD
  note: string;
  nickname?: string;
  createdAt: number;
  updatedAt: number;
  deleted?: number; // 0 = 正常, 1 = 已删除（软删除 tombstone）
}

import type { CloudRecord } from '../types/ledger';

export interface CustomCategory {
  id: string;
  groupId: string | null; // null = 一级分类
  name: string;
  color: string;
  colorLight: string;
  colorDark: string;
  createdAt: number;
  deleted?: number; // 0 = 正常, 1 = 已删除
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
    this.version(4).stores({
      expenses: '++id, date, categoryId, createdAt, updatedAt, deleted, cloudId',
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
  nickname?: string;
}

export async function addExpense(input: NewExpense): Promise<number> {
  const now = Date.now();
  return db.expenses.add({
    ...input,
    note: input.note ?? '',
    nickname: input.nickname ?? '我',
    cloudId: uuid(),
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

export async function getByCloudId(cloudId: string): Promise<ExpenseRecord | undefined> {
  return db.expenses.where('cloudId').equals(cloudId).first();
}

/** 从云端合并记录：新增/更新按 cloudId，云端 tombstone 同步为本地删除。 */
export async function upsertCloudRecords(records: CloudRecord[]): Promise<void> {
  await db.transaction('rw', db.expenses, async () => {
    for (const record of records) {
      const existing = await db.expenses.where('cloudId').equals(record.cloudId).first();
      if (record.deleted) {
        if (existing && !existing.deleted) {
          await db.expenses.update(existing.id!, { deleted: 1, updatedAt: record.updatedAt });
        }
        continue;
      }
      const base = {
        cloudId: record.cloudId,
        amountCents: record.amountCents,
        categoryId: record.categoryId,
        categoryPath: record.categoryPath,
        date: record.date,
        note: record.note,
        nickname: record.nickname,
        createdAt: record.createdAt,
        updatedAt: record.updatedAt,
        deleted: 0,
      };
      if (existing) {
        if (record.updatedAt >= (existing.updatedAt ?? 0)) {
          await db.expenses.update(existing.id!, base);
        }
      } else {
        await db.expenses.add(base);
      }
    }
  });
}

/** 待同步记录：updatedAt 晚于给定时间（含软删除 tombstone）。 */
export async function listPendingSync(since: number): Promise<ExpenseRecord[]> {
  return db.expenses.where('updatedAt').above(since).toArray();
}

export async function addCustomCategory(
  input: Omit<CustomCategory, 'createdAt'>,
): Promise<string> {
  await db.categories.add({ ...input, createdAt: Date.now(), deleted: 0 });
  return input.id;
}

export async function listCustomCategories(): Promise<CustomCategory[]> {
  return (await db.categories.toArray()).filter((c) => !c.deleted);
}

export async function renameCategory(id: string, name: string): Promise<void> {
  await db.categories.update(id, { name });
}

export async function deleteCategory(id: string): Promise<void> {
  await db.categories.update(id, { deleted: 1 });
}
