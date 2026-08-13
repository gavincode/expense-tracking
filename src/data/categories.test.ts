import { describe, it, expect } from 'vitest';
import { PRESET_CATEGORIES } from './categories';

describe('preset categories', () => {
  it('包含 5 组一级分类', () => {
    expect(PRESET_CATEGORIES).toHaveLength(5);
    expect(PRESET_CATEGORIES.map((g) => g.name)).toEqual([
      '硬装',
      '主材',
      '设备系统',
      '软装家电',
      '杂项',
    ]);
  });

  it('包含 38 个二级分类且 id 唯一', () => {
    const allChildren = PRESET_CATEGORIES.flatMap((g) => g.children);
    expect(allChildren).toHaveLength(38);
    const ids = allChildren.map((c) => c.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('每组的二级分类 id 以组 id 为前缀', () => {
    for (const group of PRESET_CATEGORIES) {
      for (const child of group.children) {
        expect(child.id.startsWith(`${group.id}-`)).toBe(true);
      }
    }
  });
});
