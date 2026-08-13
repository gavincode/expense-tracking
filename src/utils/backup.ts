import { db, type ExpenseRecord, type CustomCategory } from '../db/ledger';
import type { LedgerMember } from '../types/ledger';

/**
 * v2-local-file 备份/恢复：把浏览器里的全部数据打包成一个 JSON 文件。
 * 导出后可发给家人，家人导入后即可查看/继续记账（导入会覆盖本机数据）。
 */

export const BACKUP_APP = 'renovation-ledger';
export const BACKUP_FORMAT_VERSION = 1;

export interface BackupFile {
  app: string;
  formatVersion: number;
  exportedAt: string;
  ledger: {
    id: string;
    inviteCode: string;
    members: LedgerMember[];
  };
  identity: {
    deviceId: string;
    nickname: string;
  };
  records: ExpenseRecord[];
  categories: CustomCategory[];
}

function safeGet(key: string): string {
  try {
    return localStorage.getItem(key) ?? '';
  } catch {
    return '';
  }
}

function safeSet(key: string, value: string): void {
  try {
    localStorage.setItem(key, value);
  } catch {
    // ignore
  }
}

function readMembers(): LedgerMember[] {
  try {
    return JSON.parse(safeGet('rl_members') || '[]') as LedgerMember[];
  } catch {
    return [];
  }
}

/** 汇总当前浏览器中的全部数据为备份对象。 */
export async function buildBackup(): Promise<BackupFile> {
  const [records, categories] = await Promise.all([db.expenses.toArray(), db.categories.toArray()]);
  return {
    app: BACKUP_APP,
    formatVersion: BACKUP_FORMAT_VERSION,
    exportedAt: new Date().toISOString(),
    ledger: {
      id: safeGet('rl_ledger_id'),
      inviteCode: safeGet('rl_invite_code'),
      members: readMembers(),
    },
    identity: {
      deviceId: safeGet('rl_device_id'),
      nickname: safeGet('rl_nickname') || '我',
    },
    records,
    categories,
  };
}

/** 导出为 JSON 字符串（用于下载备份文件）。 */
export async function exportBackup(): Promise<string> {
  return JSON.stringify(await buildBackup(), null, 2);
}

/** 校验备份文件结构，非法数据抛错（带中文提示）。 */
export function parseBackup(json: string): BackupFile {
  let data: unknown;
  try {
    data = JSON.parse(json);
  } catch {
    throw new Error('文件不是有效的 JSON');
  }
  if (!data || typeof data !== 'object') {
    throw new Error('备份文件格式不正确');
  }
  const file = data as BackupFile;
  if (file.app !== BACKUP_APP) {
    throw new Error('这不是装修账本的备份文件');
  }
  if (file.formatVersion !== BACKUP_FORMAT_VERSION) {
    throw new Error('备份文件版本不支持');
  }
  if (!Array.isArray(file.records) || !Array.isArray(file.categories)) {
    throw new Error('备份文件缺少记录数据');
  }
  return file;
}

/** 导入备份：覆盖本机现有数据（记录、分类、账本信息、昵称）。 */
export async function importBackup(json: string): Promise<void> {
  const file = parseBackup(json);
  await db.transaction('rw', db.expenses, db.categories, async () => {
    await db.expenses.clear();
    await db.categories.clear();
    if (file.records.length > 0) {
      await db.expenses.bulkAdd(file.records);
    }
    if (file.categories.length > 0) {
      await db.categories.bulkAdd(file.categories);
    }
  });
  safeSet('rl_ledger_id', file.ledger.id);
  safeSet('rl_invite_code', file.ledger.inviteCode);
  safeSet('rl_members', JSON.stringify(file.ledger.members));
  if (file.identity.deviceId) {
    safeSet('rl_device_id', file.identity.deviceId);
  }
  if (file.identity.nickname) {
    safeSet('rl_nickname', file.identity.nickname);
  }
}
