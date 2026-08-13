import type { LedgerFile } from '../types/ledger';

const API_BASE: string = (import.meta.env.VITE_API_BASE as string) ?? '/api';

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

async function parseResponse<T>(response: Response): Promise<T> {
  if (response.ok) {
    return (await response.json()) as T;
  }
  const payload = (await response.json().catch(() => ({}))) as {
    error?: string;
    version?: number;
  };
  if (response.status === 409) {
    throw new VersionConflictError(payload.version ?? 0);
  }
  if (response.status === 404) {
    throw new LedgerNotFoundError();
  }
  throw new Error(payload.error ?? `HTTP ${response.status}`);
}

export async function createLedger(): Promise<{ ledgerId: string; inviteCode: string }> {
  const response = await fetch(`${API_BASE}/ledger`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ action: 'create' }),
  });
  return parseResponse(response);
}

export async function getLedger(ledgerId: string): Promise<LedgerFile> {
  const response = await fetch(`${API_BASE}/ledger?ledgerId=${encodeURIComponent(ledgerId)}`);
  return parseResponse(response);
}

export async function putLedger(
  ledgerId: string,
  baseVersion: number,
  file: LedgerFile,
): Promise<number> {
  const response = await fetch(`${API_BASE}/ledger`, {
    method: 'PUT',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ ledgerId, baseVersion, file }),
  });
  const result = await parseResponse<{ version: number }>(response);
  return result.version;
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
  const response = await fetch(`${API_BASE}/invite`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ inviteCode, deviceId, nickname }),
  });
  return parseResponse(response);
}
