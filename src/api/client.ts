import type { LedgerFile } from '../types/ledger';
import {
  mockCreateLedger,
  mockGetLedger,
  mockPutLedger,
  mockJoinLedger,
} from './mockBackend';

/**
 * v2-local-file：完全本地版本，不依赖任何后端/数据库。
 * 所有"账本"数据保存在浏览器 localStorage 中（IndexedDB 存记录与分类），
 * 通过导出/导入文件在设备间备份和迁移。
 */

export class VersionConflictError extends Error {
  constructor(public serverVersion: number) {
    super('version conflict');
  }
}

export class LedgerNotFoundError extends Error {
  constructor() {
    super('ledger not found');
  }
}

export async function createLedger(): Promise<{ ledgerId: string; inviteCode: string }> {
  return mockCreateLedger();
}

export async function getLedger(ledgerId: string): Promise<LedgerFile> {
  return mockGetLedger(ledgerId);
}

export async function putLedger(
  ledgerId: string,
  baseVersion: number,
  file: LedgerFile,
): Promise<number> {
  return mockPutLedger(ledgerId, baseVersion, file);
}

export interface JoinResult {
  ledgerId: string;
  inviteCode: string;
  members: { deviceId: string; nickname: string; joinedAt: number }[];
}

export async function joinLedger(
  inviteCode: string,
  deviceId: string,
  nickname: string,
): Promise<JoinResult> {
  return mockJoinLedger(inviteCode, deviceId, nickname);
}
