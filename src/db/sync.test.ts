import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { CloudRecord, LedgerFile } from '../types/ledger';
import {
  mergeRecords,
  mergeMembers,
  mergeCategories,
  mergeLedgerFiles,
  pushLedger,
} from './sync';

vi.mock('../api/client', () => ({
  getLedger: vi.fn(),
  putLedger: vi.fn(),
  VersionConflictError: class VersionConflictError extends Error {
    constructor(public serverVersion: number) {
      super('version conflict');
    }
  },
}));

import { getLedger, putLedger, VersionConflictError } from '../api/client';

const mockGet = getLedger as unknown as ReturnType<typeof vi.fn>;
const mockPut = putLedger as unknown as ReturnType<typeof vi.fn>;

function record(cloudId: string, updatedAt: number, deleted = 0): CloudRecord {
  return {
    cloudId,
    amountCents: 100,
    categoryId: 'hardin-tile',
    categoryPath: '硬装/瓦工',
    date: '2026-08-01',
    note: '',
    nickname: '我',
    createdAt: 1,
    updatedAt,
    deleted,
  };
}

function ledger(overrides: Partial<LedgerFile> = {}): LedgerFile {
  return {
    version: 1,
    ledgerId: 'ledger-1',
    inviteCode: '123456',
    members: [],
    records: [],
    categories: [],
    ...overrides,
  };
}

describe('sync merge', () => {
  beforeEach(() => {
    mockGet.mockReset();
    mockPut.mockReset();
  });

  it('mergeRecords 按 updatedAt 新者胜，tombstone 保留', () => {
    const local = [record('a', 100), record('b', 200, 1)];
    const remote = [record('a', 300), record('c', 150)];
    const merged = mergeRecords(local, remote);
    const byId = new Map(merged.map((r) => [r.cloudId, r]));
    expect(byId.get('a')?.updatedAt).toBe(300);
    expect(byId.get('b')?.deleted).toBe(1);
    expect(byId.get('c')?.updatedAt).toBe(150);
  });

  it('mergeLedgerFiles 保留远端成员与记录', () => {
    const local = ledger({ records: [record('a', 100)] });
    const remote = ledger({
      version: 2,
      members: [{ deviceId: 'd1', nickname: '妈妈', joinedAt: 1 }],
      records: [record('a', 200)],
    });
    const merged = mergeLedgerFiles(local, remote);
    expect(merged.version).toBe(2);
    expect(merged.members).toHaveLength(1);
    expect(merged.records[0].updatedAt).toBe(200);
  });

  it('mergeMembers / mergeCategories 幂等合并', () => {
    const members = mergeMembers(
      [{ deviceId: 'd1', nickname: '妈妈', joinedAt: 5 }],
      [{ deviceId: 'd1', nickname: '爸', joinedAt: 1 }],
    );
    expect(members[0].nickname).toBe('妈妈');
    const cats = mergeCategories(
      [{ id: 'c1', groupId: null, name: '园林', color: '', colorLight: '', colorDark: '' }],
      [{ id: 'c1', groupId: null, name: '庭院', color: '', colorLight: '', colorDark: '' }],
    );
    expect(cats[0].name).toBe('庭院');
  });

  it('pushLedger 成功路径与版本冲突重试', async () => {
    const remote = ledger({ version: 3 });
    const local = ledger({ records: [record('a', 100)] });
    mockGet.mockResolvedValue(remote);
    mockPut.mockResolvedValueOnce(4).mockRejectedValueOnce(new VersionConflictError(5));
    // 第一次：成功
    await expect(pushLedger(local)).resolves.toBe(4);
    expect(mockPut).toHaveBeenCalledWith('ledger-1', 3, expect.anything());

    // 冲突：先抛 409，重拉取后成功
    mockGet.mockResolvedValue(remote);
    mockPut
      .mockReset()
      .mockRejectedValueOnce(new VersionConflictError(9))
      .mockResolvedValueOnce(10);
    const fresh = ledger({ version: 9 });
    mockGet.mockResolvedValue(fresh);
    await expect(pushLedger(local)).resolves.toBe(10);
    expect(mockPut).toHaveBeenLastCalledWith('ledger-1', 9, expect.anything());
  });

  it('pushLedger 云端不存在时报错', async () => {
    mockGet.mockRejectedValue(new Error('ledger not found'));
    await expect(pushLedger(ledger())).rejects.toThrow('云端账本不存在');
  });
});
