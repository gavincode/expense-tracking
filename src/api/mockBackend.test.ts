import { describe, it, expect, beforeEach } from 'vitest';
import {
  resetMockBackend,
  mockCreateLedger,
  mockGetLedger,
  mockPutLedger,
  mockJoinLedger,
} from './mockBackend';
import { VersionConflictError, LedgerNotFoundError } from './client';

describe('mock backend', () => {
  beforeEach(() => {
    resetMockBackend();
  });

  it('创建 → 读取 → 更新（版本递增）', async () => {
    const created = await mockCreateLedger();
    let file = await mockGetLedger(created.ledgerId);
    expect(file.version).toBe(1);
    expect(file.inviteCode).toMatch(/^\d{6}$/);

    file.records.push({
      cloudId: 'c1',
      amountCents: 100,
      categoryId: 'a',
      categoryPath: '硬装/水电',
      date: '2026-08-01',
      note: '',
      nickname: '我',
      createdAt: 1,
      updatedAt: 2,
      deleted: 0,
    });
    const version = await mockPutLedger(created.ledgerId, file.version, file);
    expect(version).toBe(2);
    expect((await mockGetLedger(created.ledgerId)).records).toHaveLength(1);
  });

  it('版本冲突返回 409 语义', async () => {
    const created = await mockCreateLedger();
    const file = await mockGetLedger(created.ledgerId);
    await mockPutLedger(created.ledgerId, file.version, file);
    await expect(mockPutLedger(created.ledgerId, file.version, file)).rejects.toBeInstanceOf(
      VersionConflictError,
    );
  });

  it('邀请码加入与幂等', async () => {
    const created = await mockCreateLedger();
    const first = await mockJoinLedger(created.inviteCode, 'd1', '妈妈');
    expect(first.members).toHaveLength(1);
    const second = await mockJoinLedger(created.inviteCode, 'd1', '妈妈');
    expect(second.members).toHaveLength(1);
    await expect(mockJoinLedger('000000', 'd2', '我')).rejects.toThrow('邀请码无效');
  });

  it('读取不存在的账本抛 LedgerNotFoundError', async () => {
    await expect(mockGetLedger('nope')).rejects.toBeInstanceOf(LedgerNotFoundError);
  });
});
