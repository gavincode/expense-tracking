/** 金额统一以整数"分"存储与计算，仅展示层格式化为元（架构决策）。 */

export function toCents(input: string | number): number {
  if (typeof input === 'number') {
    if (!Number.isFinite(input) || input < 0) {
      throw new Error('金额无效');
    }
    return Math.round(input * 100);
  }
  const trimmed = input.trim();
  if (trimmed === '') {
    throw new Error('金额不能为空');
  }
  const value = Number(trimmed);
  if (!Number.isFinite(value) || value < 0) {
    throw new Error('金额无效');
  }
  return Math.round(value * 100);
}

export function fromCents(cents: number): string {
  return (cents / 100).toFixed(2);
}
