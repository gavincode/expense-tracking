import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { existsSync, mkdirSync, statSync } from 'node:fs';
import { networkInterfaces } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  LedgerStore,
  LedgerNotFoundError,
  VersionConflictError,
  InvalidInviteCodeError,
} from './store.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const DIST = path.join(ROOT, 'dist');
const PORT = Number(process.env.PORT || 8080);
const HOST = process.env.HOST || '0.0.0.0';
const DB_PATH = process.env.DB_PATH || path.join(ROOT, 'data', 'ledger.db');
const MAX_BODY_BYTES = 20 * 1024 * 1024;

if (!existsSync(DIST)) {
  console.error(`[账本服务] 未找到构建产物 ${DIST}，请先执行 npm run build`);
  process.exit(1);
}
mkdirSync(path.dirname(DB_PATH), { recursive: true });

const store = new LedgerStore(DB_PATH);

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.ico': 'image/x-icon',
  '.webmanifest': 'application/manifest+json; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.woff2': 'font/woff2',
};

function json(data, status = 200) {
  return {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8' },
    body: JSON.stringify(data),
  };
}

async function readBody(request) {
  const chunks = [];
  let total = 0;
  for await (const chunk of request) {
    total += chunk.length;
    if (total > MAX_BODY_BYTES) {
      throw new Error('请求体过大');
    }
    chunks.push(chunk);
  }
  return JSON.parse(Buffer.concat(chunks).toString('utf8'));
}

/** /api/* 路由：与云端版接口保持完全一致 */
async function handleApi(request, url) {
  const { pathname, searchParams } = url;

  if (pathname === '/api/ledger') {
    if (request.method === 'POST') {
      const body = await readBody(request);
      if (body.action !== 'create') {
        return json({ error: 'unsupported action' }, 400);
      }
      return json(store.createLedger());
    }
    if (request.method === 'GET') {
      const ledgerId = searchParams.get('ledgerId');
      if (!ledgerId) {
        return json({ error: 'ledgerId required' }, 400);
      }
      const file = store.getLedger(ledgerId);
      if (!file) {
        return json({ error: 'ledger not found' }, 404);
      }
      return json(file);
    }
    if (request.method === 'PUT') {
      const body = await readBody(request);
      if (!body.ledgerId || typeof body.baseVersion !== 'number' || !body.file) {
        return json({ error: '参数不完整' }, 400);
      }
      const version = store.putLedger(body.ledgerId, body.baseVersion, body.file);
      return json({ version });
    }
  }

  if (pathname === '/api/invite' && request.method === 'POST') {
    const body = await readBody(request);
    const code = String(body.inviteCode ?? '').trim();
    if (!/^\d{6}$/.test(code)) {
      return json({ error: '邀请码格式不正确' }, 400);
    }
    if (!body.deviceId) {
      return json({ error: 'deviceId required' }, 400);
    }
    return json(store.joinLedger(code, body.deviceId, body.nickname));
  }

  return json({ error: 'not found' }, 404);
}

function resolveStatic(pathname) {
  const decoded = decodeURIComponent(pathname);
  if (decoded === '/') return path.join(DIST, 'index.html');
  const candidate = path.normalize(path.join(DIST, decoded));
  if (!candidate.startsWith(DIST)) return null;
  if (existsSync(candidate) && statSync(candidate).isFile()) return candidate;
  // history 路由兜底：非文件路径统一返回 index.html
  return path.join(DIST, 'index.html');
}

async function serveStatic(pathname) {
  const filePath = resolveStatic(pathname);
  if (!filePath) return { status: 404, headers: {}, body: 'Not Found' };
  const body = await readFile(filePath);
  const ext = path.extname(filePath).toLowerCase();
  return {
    status: 200,
    headers: { 'content-type': MIME[ext] || 'application/octet-stream' },
    body,
  };
}

function toResult(error) {
  if (error instanceof LedgerNotFoundError) {
    return json({ error: error.message }, 404);
  }
  if (error instanceof InvalidInviteCodeError) {
    return json({ error: error.message }, 404);
  }
  if (error instanceof VersionConflictError) {
    return json({ error: 'version conflict', version: error.publicVersion }, 409);
  }
  console.error('[账本服务] 请求处理失败:', error);
  return json({ error: String(error?.message ?? error) }, 500);
}

const server = createServer(async (request, response) => {
  let sent = false;
  const send = (result) => {
    if (sent) return;
    sent = true;
    response.writeHead(result.status, result.headers);
    response.end(result.body);
  };
  try {
    const url = new URL(request.url, `http://${request.headers.host || 'localhost'}`);
    const result = url.pathname.startsWith('/api/')
      ? await handleApi(request, url)
      : await serveStatic(url.pathname);
    send(result);
  } catch (error) {
    send(toResult(error));
  }
});

server.listen(PORT, HOST, () => {
  const ips = Object.values(networkInterfaces())
    .flat()
    .filter((iface) => iface && iface.family === 'IPv4' && !iface.internal)
    .map((iface) => iface.address);
  console.log('==============================================');
  console.log('  装修账本 · 本地服务已启动');
  console.log('  数据库文件: ' + DB_PATH);
  console.log('  本机访问:   http://localhost:' + PORT);
  for (const ip of ips) {
    console.log('  局域网访问: http://' + ip + ':' + PORT);
  }
  console.log('  家人连同一 Wi-Fi 后，用手机打开上面的局域网地址即可');
  console.log('==============================================');
});
