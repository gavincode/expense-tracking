import { describe, it, expect } from 'vitest';
import { toCents, fromCents } from './money';

describe('money utils', () => {
  it('toCents 元转分', () => {
    expect(toCents('100.5')).toBe(10050);
    expect(toCents('0.01')).toBe(1);
    expect(toCents('0')).toBe(0);
    expect(toCents('1234.56')).toBe(123456);
  });

  it('fromCents 分转元并保留两位小数', () => {
    expect(fromCents(10050)).toBe('100.50');
    expect(fromCents(1)).toBe('0.01');
    expect(fromCents(0)).toBe('0.00');
  });

  it('非法输入被拒绝', () => {
    expect(() => toCents('')).toThrow();
    expect(() => toCents('   ')).toThrow();
    expect(() => toCents('abc')).toThrow();
    expect(() => toCents('-5')).toThrow();
  });
});
