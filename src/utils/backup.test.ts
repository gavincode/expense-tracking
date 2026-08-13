import 'fake-indexeddb/auto';
import { describe, it, expect, beforeEach } from 'vitest';
import {
  db,
  addExpense,
  addCustomCategory,
} from '../db/ledger';
import { buildBackup, exportBackup, importBackup, parseBackup } from './backup';

// Node 测试环境没有 localStorage，这里用一个内存版模拟
const memoryStorage = new Map<string, string>();
Object.defineProperty(globalThis, 'localStorage', {
  value: {
    getItem: (key: string) => memoryStorage.get(key) ?? null,
    setItem: (key: string, value: string) => {
      memoryStorage.set(key, String(value));
    },
    removeItem: (key: string) => {
      memoryStorage.delete(key);
    },
    clear: () => {
      memoryStorage.clear();
    },
  },
  configurable: true,
});

describe('backup (导出/导入)', () => {
  beforeEach(async () => {
    await db.expenses.clear();
    await db.categories.clear();
    localStorage.clear();
  });

  it('导出包含记录、分类与账本信息', async () => {
    await addExpense({
      amountCents: 12345,
      categoryId: 'hardin-water',
      categoryPath: '硬装 / 水电',
      date: '2026-08-01',
      note: '定金',
      nickname: '妈妈',
    });
    await addCustomCategory({
      id: 'custom-1',
      groupId: null,
      name: '自建分类',
      color: '#8fae8b',
      colorLight: '#eaf1ea',
      colorDark: '#6f9271',
    });
    localStorage.setItem('rl_ledger_id', 'L1');
    localStorage.setItem('rl_invite_code', '123456');
    localStorage.setItem('rl_members', JSON.stringify([{ deviceId: 'd1', nickname: '妈妈', joinedAt: 1 }]));

    const file = await buildBackup();
    expect(file.app).toBe('renovation-ledger');
    expect(file.records).toHaveLength(1);
    expect(file.records[0].amountCents).toBe(12345);
    expect(file.categories).toHaveLength(1);
    expect(file.ledger.id).toBe('L1');
    expect(file.ledger.members[0].nickname).toBe('妈妈');
  });

  it('导出后清空再导入，数据完整恢复', async () => {
    await addExpense({
      amountCents: 8888,
      categoryId: 'a',
      categoryPath: '软装家电 / 家电',
      date: '2026-08-02',
      note: '尾款',
      nickname: '我',
    });
    const json = await exportBackup();

    await db.expenses.clear();
    await db.categories.clear();
    localStorage.clear();

    await importBackup(json);
    const restored = await db.expenses.toArray();
    expect(restored).toHaveLength(1);
    expect(restored[0].amountCents).toBe(8888);
    expect(restored[0].note).toBe('尾款');
    expect(localStorage.getItem('rl_ledger_id')).toBeDefined();
  });

  it('拒绝非法备份文件', () => {
    expect(() => parseBackup('not json')).toThrow('有效的 JSON');
    expect(() => parseBackup('{"app":"other"}')).toThrow('不是装修账本的备份文件');
    expect(() => parseBackup('{"app":"renovation-ledger","formatVersion":99,"records":[],"categories":[]}')).toThrow('版本不支持');
  });
});
