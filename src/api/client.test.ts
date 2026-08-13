import { describe, it, expect, vi, afterEach } from 'vitest';
import { joinLedger } from './client';

describe('api client', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('joinLedger 向 /api/invite 发送加入请求并解析结果', async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({ ledgerId: 'L1', inviteCode: '123456', members: [] }),
        { status: 200, headers: { 'content-type': 'application/json' } },
      ),
    );
    vi.stubGlobal('fetch', fetchMock);

    const result = await joinLedger('123456', 'd1', '妈妈');
    expect(result.ledgerId).toBe('L1');
    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(url).toContain('/api/invite');
    expect(JSON.parse(String(init.body))).toEqual({
      inviteCode: '123456',
      deviceId: 'd1',
      nickname: '妈妈',
    });
  });
});
