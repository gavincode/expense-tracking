/** 云端账本文件结构（每账本一个 Blob 文件，key: ledgers/{ledgerId}.json） */

export interface LedgerMember {
  deviceId: string;
  nickname: string;
  joinedAt: number;
}

export interface CloudRecord {
  cloudId: string;
  amountCents: number;
  categoryId: string;
  categoryPath: string;
  date: string;
  note: string;
  nickname: string;
  createdAt: number;
  updatedAt: number;
  deleted?: number;
}

export interface CloudCategory {
  id: string;
  groupId: string | null;
  name: string;
  color: string;
  colorLight: string;
  colorDark: string;
  deleted?: number;
}

export interface LedgerFile {
  version: number;
  ledgerId: string;
  inviteCode: string;
  members: LedgerMember[];
  records: CloudRecord[];
  categories: CloudCategory[];
}
