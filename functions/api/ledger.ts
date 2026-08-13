import { getStore, type StoreOptions } from '@edgeone/pages-blob';
import type { LedgerFile } from '../../src/types/ledger';

function ledgerKey(ledgerId: string): string {
  return `ledgers/${ledgerId}.json`;
}

function store(context: { env: Record<string, unknown> }) {
  const name = (context.env.BLOB_STORE_NAME as string) ?? 'ledgers';
  // Pages Functions 内自动鉴权：仅需名称；SDK 类型对 token 模式标注了必填，故强转
  return getStore({ name, consistency: 'strong' } as unknown as StoreOptions);
}

function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8' },
  });
}

function randomInviteCode(): string {
  const bytes = new Uint8Array(4);
  crypto.getRandomValues(bytes);
  const n = bytes.reduce((acc, b) => acc * 256 + b, 0);
  return String(n % 1000000).padStart(6, '0');
}

export async function onRequestPost(context: {
  request: Request;
  env: Record<string, unknown>;
}): Promise<Response> {
  try {
    const body = (await context.request.json()) as { action?: string };
    if (body.action !== 'create') {
      return json({ error: 'unsupported action' }, 400);
    }
    const ledgerId = crypto.randomUUID();
    const inviteCode = randomInviteCode();
    const file: LedgerFile = {
      version: 1,
      ledgerId,
      inviteCode,
      members: [],
      records: [],
      categories: [],
    };
    await store(context).set(ledgerKey(ledgerId), JSON.stringify(file));
    await store(context).set(
      `invites/${inviteCode}.json`,
      JSON.stringify({ ledgerId, createdAt: Date.now() }),
    );
    return json({ ledgerId, inviteCode: file.inviteCode });
  } catch (error) {
    return json({ error: String(error) }, 500);
  }
}

export async function onRequestGet(context: {
  request: Request;
  env: Record<string, unknown>;
}): Promise<Response> {
  try {
    const url = new URL(context.request.url);
    const ledgerId = url.searchParams.get('ledgerId');
    if (!ledgerId) {
      return json({ error: 'ledgerId required' }, 400);
    }
    const value = await store(context).get(ledgerKey(ledgerId), { type: 'text' });
    if (value === null) {
      return json({ error: 'ledger not found' }, 404);
    }
    return json(JSON.parse(value));
  } catch (error) {
    return json({ error: String(error) }, 500);
  }
}

export async function onRequestPut(context: {
  request: Request;
  env: Record<string, unknown>;
}): Promise<Response> {
  try {
    const body = (await context.request.json()) as {
      ledgerId: string;
      baseVersion: number;
      file: LedgerFile;
    };
    const key = ledgerKey(body.ledgerId);
    const current = await store(context).get(key, { type: 'text' });
    if (current === null) {
      return json({ error: 'ledger not found' }, 404);
    }
    const currentFile = JSON.parse(current) as LedgerFile;
    if (currentFile.version !== body.baseVersion) {
      return json({ error: 'version conflict', version: currentFile.version }, 409);
    }
    const next: LedgerFile = { ...body.file, version: currentFile.version + 1 };
    await store(context).set(key, JSON.stringify(next));
    return json({ version: next.version });
  } catch (error) {
    return json({ error: String(error) }, 500);
  }
}
