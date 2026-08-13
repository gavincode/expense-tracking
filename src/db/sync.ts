import { db, upsertCloudRecords, listPendingSync, type ExpenseRecord } from './ledger';
import { getLedger, putLedger, VersionConflictError } from '../api/client';
import type {
  LedgerFile,
  CloudRecord,
  CloudCategory,
  LedgerMember,
} from '../types/ledger';

/** 记录合并：按 cloudId，updatedAt 新者胜；tombstone 保留。 */
export function mergeRecords(local: CloudRecord[], remote: CloudRecord[]): CloudRecord[] {
  const map = new Map<string, CloudRecord>();
  for (const record of [...local, ...remote]) {
    const existing = map.get(record.cloudId);
    if (!existing || record.updatedAt >= existing.updatedAt) {
      map.set(record.cloudId, record);
    }
  }
  return Array.from(map.values());
}

export function mergeMembers(local: LedgerMember[], remote: LedgerMember[]): LedgerMember[] {
  const map = new Map<string, LedgerMember>();
  for (const member of [...local, ...remote]) {
    const existing = map.get(member.deviceId);
    if (!existing || member.joinedAt >= existing.joinedAt) {
      map.set(member.deviceId, member);
    }
  }
  return Array.from(map.values());
}

export function mergeCategories(
  local: CloudCategory[],
  remote: CloudCategory[],
): CloudCategory[] {
  const map = new Map<string, CloudCategory>();
  for (const category of [...local, ...remote]) {
    const existing = map.get(category.id);
    if (!existing || category.name !== existing.name) {
      map.set(category.id, category);
    }
  }
  return Array.from(map.values());
}

export function mergeLedgerFiles(local: LedgerFile, remote: LedgerFile): LedgerFile {
  return {
    version: remote.version,
    ledgerId: remote.ledgerId || local.ledgerId,
    inviteCode: remote.inviteCode || local.inviteCode,
    members: mergeMembers(local.members, remote.members),
    records: mergeRecords(local.records, remote.records),
    categories: mergeCategories(local.categories, remote.categories),
  };
}

function toCloudRecord(record: ExpenseRecord): CloudRecord {
  return {
    cloudId: record.cloudId ?? `legacy-${record.id}`,
    amountCents: record.amountCents,
    categoryId: record.categoryId,
    categoryPath: record.categoryPath,
    date: record.date,
    note: record.note,
    nickname: record.nickname ?? '我',
    createdAt: record.createdAt,
    updatedAt: record.updatedAt,
    deleted: record.deleted ?? 0,
  };
}

export async function buildLocalFile(
  ledgerId: string,
  inviteCode: string,
  members: LedgerMember[],
): Promise<LedgerFile> {
  const records = await db.expenses.toArray();
  const categories = await db.categories.toArray();
  return {
    version: 1,
    ledgerId,
    inviteCode,
    members,
    records: records.map(toCloudRecord),
    categories: categories.map((c) => ({
      id: c.id,
      groupId: c.groupId,
      name: c.name,
      color: c.color,
      colorLight: c.colorLight,
      colorDark: c.colorDark,
      deleted: c.deleted ?? 0,
    })),
  };
}

/** 推送本地账本到云端（含冲突重试一次）。 */
export async function pushLedger(local: LedgerFile): Promise<number> {
  let remote: LedgerFile;
  try {
    remote = await getLedger(local.ledgerId);
  } catch {
    throw new Error('云端账本不存在');
  }
  const merged = mergeLedgerFiles(local, remote);
  try {
    return await putLedger(local.ledgerId, remote.version, merged);
  } catch (error) {
    if (!(error instanceof VersionConflictError)) {
      throw error;
    }
    // 冲突：重拉取并重试一次
    const fresh = await getLedger(local.ledgerId);
    const retried = mergeLedgerFiles(local, fresh);
    return putLedger(local.ledgerId, fresh.version, retried);
  }
}

/** 拉取云端账本并合并到本地（记录 + 分类）。 */
export async function pullLedger(ledgerId: string): Promise<LedgerFile> {
  const remote = await getLedger(ledgerId);
  await upsertCloudRecords(remote.records);
  await db.transaction('rw', db.categories, async () => {
    for (const category of remote.categories) {
      const existing = await db.categories.get(category.id);
      if (category.deleted) {
        if (existing && !existing.deleted) {
          await db.categories.update(category.id, { deleted: 1 });
        }
        continue;
      }
      if (existing) {
        await db.categories.update(category.id, {
          groupId: category.groupId,
          name: category.name,
          color: category.color,
          colorLight: category.colorLight,
          colorDark: category.colorDark,
        });
      } else {
        await db.categories.add({
          id: category.id,
          groupId: category.groupId,
          name: category.name,
          color: category.color,
          colorLight: category.colorLight,
          colorDark: category.colorDark,
          createdAt: Date.now(),
          deleted: 0,
        });
      }
    }
  });
  return remote;
}

export { listPendingSync };
