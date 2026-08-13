import { getStore, type StoreOptions } from '@edgeone/pages-blob';
import type { LedgerFile } from '../../src/types/ledger';

function store(context: { env: Record<string, unknown> }) {
  const name = (context.env.BLOB_STORE_NAME as string) ?? 'ledgers';
  return getStore({ name, consistency: 'strong' } as unknown as StoreOptions);
}

function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8' },
  });
}

export async function onRequestPost(context: {
  request: Request;
  env: Record<string, unknown>;
}): Promise<Response> {
  try {
    const body = (await context.request.json()) as {
      inviteCode?: string;
      deviceId?: string;
      nickname?: string;
    };
    const code = String(body.inviteCode ?? '').trim();
    if (!/^\d{6}$/.test(code)) {
      return json({ error: '邀请码格式不正确' }, 400);
    }
    if (!body.deviceId) {
      return json({ error: 'deviceId required' }, 400);
    }
    const indexRaw = await store(context).get(`invites/${code}.json`, { type: 'text' });
    if (indexRaw === null) {
      return json({ error: '邀请码无效' }, 404);
    }
    const index = JSON.parse(indexRaw) as { ledgerId: string };
    const key = `ledgers/${index.ledgerId}.json`;
    const ledgerRaw = await store(context).get(key, { type: 'text' });
    if (ledgerRaw === null) {
      return json({ error: '账本不存在' }, 404);
    }
    const file = JSON.parse(ledgerRaw) as LedgerFile;
    if (!file.members.some((m) => m.deviceId === body.deviceId)) {
      file.members.push({
        deviceId: body.deviceId,
        nickname: body.nickname?.trim() || '我',
        joinedAt: Date.now(),
      });
      file.version += 1;
      await store(context).set(key, JSON.stringify(file));
    }
    return json({ ledgerId: index.ledgerId, inviteCode: file.inviteCode, members: file.members });
  } catch (error) {
    return json({ error: String(error) }, 500);
  }
}
