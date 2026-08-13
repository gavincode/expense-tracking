import type { LedgerFile } from '../types/ledger';
import { uuid } from '../utils/uuid';
import { VersionConflictError, LedgerNotFoundError, type JoinResult } from './client';

/**
 * 开发模式本地模拟后端：把"云端"账本文件存到浏览器本地（localStorage），
 * 让创建/记账/同步/邀请在部署前即可体验。部署 EdgeOne 后由真实 API 接管。
 */

interface MockState {
  ledgers: Record<string, LedgerFile>;
  invites: Record<string, string>;
}

const memoryFallback: MockState = { ledgers: {}, invites: {} };

export function resetMockBackend(): void {
  memoryFallback.ledgers = {};
  memoryFallback.invites = {};
  try {
    localStorage.removeItem('rl_mock_backend');
  } catch {
    // ignore
  }
}

function readState(): MockState {
  try {
    const raw = localStorage.getItem('rl_mock_backend');
    if (raw) {
      return JSON.parse(raw) as MockState;
    }
  } catch {
    // ignore
  }
  return memoryFallback;
}

function writeState(state: MockState): void {
  memoryFallback.ledgers = state.ledgers;
  memoryFallback.invites = state.invites;
  try {
    localStorage.setItem('rl_mock_backend', JSON.stringify(state));
  } catch {
    // ignore
  }
}

function randomInviteCode(): string {
  return String(Math.floor(Math.random() * 1000000)).padStart(6, '0');
}

export async function mockCreateLedger(): Promise<{ ledgerId: string; inviteCode: string }> {
  const state = readState();
  const ledgerId = uuid();
  const inviteCode = randomInviteCode();
  const file: LedgerFile = {
    version: 1,
    ledgerId,
    inviteCode,
    members: [],
    records: [],
    categories: [],
  };
  state.ledgers[ledgerId] = file;
  state.invites[inviteCode] = ledgerId;
  writeState(state);
  return { ledgerId, inviteCode };
}

export async function mockGetLedger(ledgerId: string): Promise<LedgerFile> {
  const file = readState().ledgers[ledgerId];
  if (!file) {
    throw new LedgerNotFoundError();
  }
  return structuredClone(file);
}

export async function mockPutLedger(
  ledgerId: string,
  baseVersion: number,
  file: LedgerFile,
): Promise<number> {
  const state = readState();
  const current = state.ledgers[ledgerId];
  if (!current) {
    throw new LedgerNotFoundError();
  }
  if (current.version !== baseVersion) {
    throw new VersionConflictError(current.version);
  }
  const next: LedgerFile = { ...file, version: current.version + 1 };
  state.ledgers[ledgerId] = next;
  writeState(state);
  return next.version;
}

export async function mockJoinLedger(
  inviteCode: string,
  deviceId: string,
  nickname: string,
): Promise<JoinResult> {
  const state = readState();
  const ledgerId = state.invites[inviteCode];
  if (!ledgerId) {
    throw new Error('邀请码无效');
  }
  const file = state.ledgers[ledgerId];
  if (!file.members.some((m) => m.deviceId === deviceId)) {
    file.members.push({ deviceId, nickname: nickname.trim() || '我', joinedAt: Date.now() });
    file.version += 1;
  }
  writeState(state);
  return { ledgerId, inviteCode, members: file.members };
}
