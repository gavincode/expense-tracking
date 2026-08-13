import { describe, it, expect } from 'vitest';
import { uuid } from './uuid';

describe('uuid', () => {
  it('返回 UUID v4 格式', () => {
    expect(uuid()).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/,
    );
  });

  it('多次生成不重复', () => {
    const ids = new Set(Array.from({ length: 20 }, () => uuid()));
    expect(ids.size).toBe(20);
  });
});
