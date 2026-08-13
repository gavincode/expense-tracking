import 'fake-indexeddb/auto';
import { describe, it, expect, beforeEach } from 'vitest';
import { db, addExpense, listRecent, getMonthSummary } from './ledger';
import { toCents, fromCents } from '../utils/money';

describe('ledger db', () => {
  beforeEach(async () => {
    await db.expenses.clear();
  });

  it('addExpense 后 listRecent 能读回同一记录', async () => {
    const id = await addExpense({
      amountCents: 10050,
      categoryId: 'hardin-shuidian',
      categoryPath: '硬装/水电',
      date: '2026-08-10',
      note: '水电材料定金',
    });
    const recent = await listRecent();
    expect(recent).toHaveLength(1);
    expect(recent[0].id).toBe(id);
    expect(recent[0].amountCents).toBe(10050);
    expect(recent[0].categoryPath).toBe('硬装/水电');
    expect(recent[0].note).toBe('水电材料定金');
  });

  it('金额分转换正确', () => {
    expect(toCents('100.5')).toBe(10050);
    expect(toCents('0.01')).toBe(1);
    expect(fromCents(10050)).toBe('100.50');
  });

  it('getMonthSummary 只统计当月', async () => {
    await addExpense({ amountCents: 10000, categoryId: 'a', categoryPath: '硬装/水电', date: '2026-08-01' });
    await addExpense({ amountCents: 5000, categoryId: 'a', categoryPath: '硬装/水电', date: '2026-07-30' });
    const summary = await getMonthSummary('2026-08');
    expect(summary.totalCents).toBe(10000);
    expect(summary.count).toBe(1);
  });
});
