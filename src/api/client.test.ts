import { describe, it, expect, beforeEach } from 'vitest';
import { createLedger, getLedger, putLedger, joinLedger, VersionConflictError } from './client';
import { resetMockBackend } from './mockBackend';

describe('local-only client（v2-local-file）', () => {
  beforeEach(() => {
    resetMockBackend();
  });

  it('创建账本后本地读回', async () => {
    const { ledgerId, inviteCode } = await createLedger();
    const file = await getLedger(ledgerId);
    expect(file.ledgerId).toBe(ledgerId);
    expect(file.inviteCode).toBe(inviteCode);
    expect(inviteCode).toMatch(/^\d{6}$/);
  });

  it('版本不匹配抛 VersionConflictError', async () => {
    const { ledgerId } = await createLedger();
    await expect(putLedger(ledgerId, 99, {} as never)).rejects.toBeInstanceOf(VersionConflictError);
  });

  it('加入账本写入成员', async () => {
    const { inviteCode } = await createLedger();
    const result = await joinLedger(inviteCode, 'd1', '妈妈');
    expect(result.members[0].nickname).toBe('妈妈');
  });
});
