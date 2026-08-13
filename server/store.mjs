import { DatabaseSync } from 'node:sqlite';
import { randomUUID } from 'node:crypto';

/** 本地 SQLite 文件数据库：所有账本集中存在一个 .db 文件中。 */

export class LedgerNotFoundError extends Error {
  constructor(message = 'ledger not found') {
    super(message);
    this.name = 'LedgerNotFoundError';
  }
}

export class VersionConflictError extends Error {
  constructor(publicVersion) {
    super('version conflict');
    this.name = 'VersionConflictError';
    this.publicVersion = publicVersion;
  }
}

export class InvalidInviteCodeError extends Error {
  constructor(message = '邀请码无效') {
    super(message);
    this.name = 'InvalidInviteCodeError';
  }
}

function randomInviteCode() {
  const bytes = new Uint8Array(4);
  crypto.getRandomValues(bytes);
  const n = bytes.reduce((acc, b) => acc * 256 + b, 0);
  return String(n % 1000000).padStart(6, '0');
}

export class LedgerStore {
  /** @param {string} dbPath 数据库文件路径（:memory: 表示内存库，用于测试） */
  constructor(dbPath) {
    this.db = new DatabaseSync(dbPath);
    this.db.exec(`
      PRAGMA journal_mode = WAL;
      CREATE TABLE IF NOT EXISTS ledgers (
        ledger_id   TEXT PRIMARY KEY,
        invite_code TEXT NOT NULL UNIQUE,
        version     INTEGER NOT NULL,
        data        TEXT NOT NULL,
        updated_at  INTEGER NOT NULL
      );
      CREATE TABLE IF NOT EXISTS invites (
        invite_code TEXT PRIMARY KEY,
        ledger_id   TEXT NOT NULL
      );
    `);
  }

  close() {
    this.db.close();
  }

  /** 创建账本：插入 ledgers + invites，返回 { ledgerId, inviteCode } */
  createLedger() {
    const ledgerId = randomUUID();
    let inviteCode = randomInviteCode();
    const file = {
      version: 1,
      ledgerId,
      inviteCode,
      members: [],
      records: [],
      categories: [],
    };

    this.db.exec('BEGIN IMMEDIATE');
    try {
      // 邀请码 6 位，容量有限，碰撞时重新生成
      for (let attempt = 0; attempt < 5; attempt += 1) {
        const exists = this.db
          .prepare('SELECT 1 FROM invites WHERE invite_code = ?')
          .get(inviteCode);
        if (!exists) break;
        inviteCode = randomInviteCode();
      }
      this.db
        .prepare(
          'INSERT INTO ledgers (ledger_id, invite_code, version, data, updated_at) VALUES (?, ?, ?, ?, ?)',
        )
        .run(ledgerId, inviteCode, file.version, JSON.stringify(file), Date.now());
      this.db
        .prepare('INSERT INTO invites (invite_code, ledger_id) VALUES (?, ?)')
        .run(inviteCode, ledgerId);
      this.db.exec('COMMIT');
    } catch (error) {
      this.db.exec('ROLLBACK');
      throw error;
    }
    return { ledgerId, inviteCode };
  }

  /** 读取账本，返回 LedgerFile 对象；不存在返回 null */
  getLedger(ledgerId) {
    const row = this.db
      .prepare('SELECT data FROM ledgers WHERE ledger_id = ?')
      .get(ledgerId);
    return row ? JSON.parse(row.data) : null;
  }

  /** 乐观锁更新：baseVersion 不匹配抛 VersionConflictError；返回新版本号 */
  putLedger(ledgerId, baseVersion, file) {
    const row = this.db
      .prepare('SELECT version, data, invite_code FROM ledgers WHERE ledger_id = ?')
      .get(ledgerId);
    if (!row) {
      throw new LedgerNotFoundError();
    }
    const current = JSON.parse(row.data);
    if (current.version !== baseVersion) {
      throw new VersionConflictError(current.version);
    }
    const next = {
      ...file,
      ledgerId,
      inviteCode: row.invite_code,
      version: current.version + 1,
    };
    this.db
      .prepare(
        'UPDATE ledgers SET version = ?, data = ?, updated_at = ? WHERE ledger_id = ?',
      )
      .run(next.version, JSON.stringify(next), Date.now(), ledgerId);
    return next.version;
  }

  /** 通过邀请码加入账本；新成员写入 members 并升版本。 */
  joinLedger(inviteCode, deviceId, nickname) {
    const invite = this.db
      .prepare('SELECT ledger_id FROM invites WHERE invite_code = ?')
      .get(inviteCode);
    if (!invite) {
      throw new InvalidInviteCodeError();
    }

    this.db.exec('BEGIN IMMEDIATE');
    try {
      const row = this.db
        .prepare('SELECT version, data FROM ledgers WHERE ledger_id = ?')
        .get(invite.ledger_id);
      if (!row) {
        this.db.exec('ROLLBACK');
        throw new LedgerNotFoundError('账本不存在');
      }
      const file = JSON.parse(row.data);
      if (!file.members.some((m) => m.deviceId === deviceId)) {
        file.members.push({
          deviceId,
          nickname: nickname?.trim() || '我',
          joinedAt: Date.now(),
        });
        file.version += 1;
        this.db
          .prepare(
            'UPDATE ledgers SET version = ?, data = ?, updated_at = ? WHERE ledger_id = ?',
          )
          .run(file.version, JSON.stringify(file), Date.now(), invite.ledger_id);
      }
      this.db.exec('COMMIT');
      return {
        ledgerId: invite.ledger_id,
        inviteCode: file.inviteCode,
        members: file.members,
      };
    } catch (error) {
      this.db.exec('ROLLBACK');
      throw error;
    }
  }
}
