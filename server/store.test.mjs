import { describe, it, expect, beforeEach } from 'vitest';
import {
  LedgerStore,
  LedgerNotFoundError,
  VersionConflictError,
  InvalidInviteCodeError,
} from './store.mjs';

let store;

beforeEach(() => {
  store = new LedgerStore(':memory:');
});

describe('LedgerStore (SQLite)', () => {
  it('创建账本并可通过 ledgerId 读回', () => {
    const { ledgerId, inviteCode } = store.createLedger();
    const file = store.getLedger(ledgerId);
    expect(file).not.toBeNull();
    expect(file.ledgerId).toBe(ledgerId);
    expect(file.inviteCode).toBe(inviteCode);
    expect(file.version).toBe(1);
    expect(file.members).toEqual([]);
    expect(file.records).toEqual([]);
  });

  it('邀请码为 6 位数字', () => {
    const { inviteCode } = store.createLedger();
    expect(inviteCode).toMatch(/^\d{6}$/);
  });

  it('乐观锁：版本不匹配抛 VersionConflictError 并给出当前版本', () => {
    const { ledgerId } = store.createLedger();
    expect(() => store.putLedger(ledgerId, 999, { version: 999 })).toThrow(VersionConflictError);
    let thrown;
    try {
      store.putLedger(ledgerId, 999, { version: 999 });
    } catch (error) {
      thrown = error;
    }
    expect(thrown.publicVersion).toBe(1);
  });

  it('版本匹配时更新成功并递增版本号', () => {
    const { ledgerId } = store.createLedger();
    const nextVersion = store.putLedger(ledgerId, 1, { records: [{ id: 1 }] });
    expect(nextVersion).toBe(2);
    const file = store.getLedger(ledgerId);
    expect(file.version).toBe(2);
    expect(file.records).toEqual([{ id: 1 }]);
    // 更新不覆盖账本自身标识
    expect(file.ledgerId).toBe(ledgerId);
    expect(file.inviteCode).toMatch(/^\d{6}$/);
  });

  it('不存在的账本抛 LedgerNotFoundError', () => {
    expect(() => store.putLedger('nope', 1, {})).toThrow(LedgerNotFoundError);
    expect(store.getLedger('nope')).toBeNull();
  });

  it('通过邀请码加入：新成员写入并升版本', () => {
    const { ledgerId, inviteCode } = store.createLedger();
    const result = store.joinLedger(inviteCode, 'device-a', '妈妈');
    expect(result.ledgerId).toBe(ledgerId);
    expect(result.members).toHaveLength(1);
    expect(result.members[0].nickname).toBe('妈妈');
    expect(store.getLedger(ledgerId).version).toBe(2);
  });

  it('同一设备重复加入不重复写入', () => {
    const { inviteCode } = store.createLedger();
    store.joinLedger(inviteCode, 'device-a', '妈妈');
    const again = store.joinLedger(inviteCode, 'device-a', '妈妈');
    expect(again.members).toHaveLength(1);
  });

  it('无效邀请码抛 InvalidInviteCodeError', () => {
    expect(() => store.joinLedger('000000', 'device-a', '我')).toThrow(InvalidInviteCodeError);
  });
});
