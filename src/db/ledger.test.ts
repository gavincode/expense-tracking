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
  updateExpense,
  getById,
  deleteExpense,
  renameCategory,
  deleteCategory,
  getByCloudId,
  upsertCloudRecords,
  listPendingSync,
} from './ledger';
import type { CloudRecord } from '../types/ledger';
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

  it('updateExpense 更新字段且保留 createdAt', async () => {
    const id = await addExpense({
      amountCents: 10000,
      categoryId: 'hardin-plumbing',
      categoryPath: '硬装/水电',
      date: '2026-08-01',
      note: '定金',
    });
    const before = await getById(id);
    const createdAt = before?.createdAt;
    await updateExpense(id, {
      amountCents: 15000,
      categoryId: 'hardin-tile',
      categoryPath: '硬装/瓦工',
      date: '2026-08-02',
      note: '尾款',
    });
    const after = await getById(id);
    expect(after?.amountCents).toBe(15000);
    expect(after?.categoryPath).toBe('硬装/瓦工');
    expect(after?.date).toBe('2026-08-02');
    expect(after?.note).toBe('尾款');
    expect(after?.createdAt).toBe(createdAt);
    expect(after?.updatedAt).toBeGreaterThanOrEqual(before?.updatedAt ?? 0);
  });

  it('deleteExpense 软删除：视图过滤、表中保留', async () => {
    const id = await addExpense({
      amountCents: 8800,
      categoryId: 'hardin-paint',
      categoryPath: '硬装/油漆',
      date: '2026-08-06',
      note: '乳胶漆',
    });
    await deleteExpense(id);
    expect(await listAll()).toHaveLength(0);
    expect(await listRecent()).toHaveLength(0);
    expect(await getById(id)).toBeUndefined();
    const summary = await getMonthSummary('2026-08');
    expect(summary.count).toBe(0);
    expect(summary.totalCents).toBe(0);
    const raw = await db.expenses.get(id);
    expect(raw?.deleted).toBe(1);
  });

  it('自定义分类可重命名与软删除', async () => {
    await addCustomCategory({
      id: 'custom-x',
      groupId: null,
      name: '园林',
      color: '#8fb0a9',
      colorLight: '#e9f2f0',
      colorDark: '#668d85',
    });
    await renameCategory('custom-x', '庭院');
    let items = await listCustomCategories();
    expect(items.find((c) => c.id === 'custom-x')?.name).toBe('庭院');
    await deleteCategory('custom-x');
    items = await listCustomCategories();
    expect(items.find((c) => c.id === 'custom-x')).toBeUndefined();
    const raw = await db.categories.get('custom-x');
    expect(raw?.deleted).toBe(1);
  });

  it('addExpense 写入 cloudId 与默认昵称', async () => {
    const id = await addExpense({
      amountCents: 100,
      categoryId: 'a',
      categoryPath: '硬装/水电',
      date: '2026-08-01',
    });
    const record = await getById(id);
    expect(record?.cloudId).toBeTruthy();
    expect(record?.nickname).toBe('我');
  });

  it('upsertCloudRecords 新增/更新/删除按 cloudId 合并', async () => {
    const cloud: CloudRecord = {
      cloudId: 'cloud-1',
      amountCents: 5000,
      categoryId: 'hardin-paint',
      categoryPath: '硬装/油漆',
      date: '2026-08-10',
      note: '乳胶漆',
      nickname: '妈妈',
      createdAt: 1,
      updatedAt: 100,
      deleted: 0,
    };
    await upsertCloudRecords([cloud]);
    let local = await getByCloudId('cloud-1');
    expect(local?.amountCents).toBe(5000);
    expect(local?.nickname).toBe('妈妈');

    await upsertCloudRecords([
      { ...cloud, amountCents: 6000, updatedAt: 200, note: '面漆' },
    ]);
    local = await getByCloudId('cloud-1');
    expect(local?.amountCents).toBe(6000);
    expect(local?.note).toBe('面漆');

    await upsertCloudRecords([{ ...cloud, deleted: 1, updatedAt: 300 }]);
    local = await getByCloudId('cloud-1');
    expect(local?.deleted).toBe(1);
    expect(await getById(local?.id ?? -1)).toBeUndefined();
  });

  it('listPendingSync 返回 updatedAt 之后（含 tombstone）', async () => {
    const id = await addExpense({
      amountCents: 100,
      categoryId: 'a',
      categoryPath: '硬装/水电',
      date: '2026-08-01',
    });
    const now = Date.now();
    await deleteExpense(id);
    const pending = await listPendingSync(now - 1000);
    expect(pending.length).toBeGreaterThanOrEqual(1);
    expect(pending[0].deleted).toBe(1);
  });
});
