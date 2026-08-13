import 'fake-indexeddb/auto';
import { describe, it, expect, beforeEach } from 'vitest';
import {
  db,
  addExpense,
  listRecent,
  listAll,
  getMonthSummary,
  addCustomCategory,
  listCustomCategories,
} from './ledger';
import { toCents, fromCents } from '../utils/money';

describe('ledger db', () => {
  beforeEach(async () => {
    await db.expenses.clear();
    await db.categories.clear();
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

  it('含日期与备注的记录可完整读回', async () => {
    await addExpense({
      amountCents: 360000,
      categoryId: 'hardin-tile',
      categoryPath: '硬装/瓦工',
      date: '2026-08-05',
      note: '瓷砖铺贴尾款',
    });
    const recent = await listRecent();
    expect(recent[0].date).toBe('2026-08-05');
    expect(recent[0].note).toBe('瓷砖铺贴尾款');
  });

  it('listAll 按日期倒序返回', async () => {
    await addExpense({ amountCents: 100, categoryId: 'a', categoryPath: '硬装/水电', date: '2026-08-01' });
    await addExpense({ amountCents: 200, categoryId: 'a', categoryPath: '硬装/水电', date: '2026-08-03' });
    const all = await listAll();
    expect(all[0].date).toBe('2026-08-03');
    expect(all[1].date).toBe('2026-08-01');
  });

  it('自定义一级/二级分类可保存并读回', async () => {
    await addCustomCategory({
      id: 'custom-group-1',
      groupId: null,
      name: '园林',
      color: '#8fb0a9',
      colorLight: '#e9f2f0',
      colorDark: '#668d85',
    });
    await addCustomCategory({
      id: 'custom-child-1',
      groupId: 'custom-group-1',
      name: '草坪',
      color: '',
      colorLight: '',
      colorDark: '',
    });
    const all = await listCustomCategories();
    expect(all).toHaveLength(2);
    const group = all.find((c) => c.id === 'custom-group-1');
    expect(group?.groupId).toBeNull();
    const child = all.find((c) => c.id === 'custom-child-1');
    expect(child?.groupId).toBe('custom-group-1');
  });
});
