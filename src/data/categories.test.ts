import { describe, it, expect } from 'vitest';
import { PRESET_CATEGORIES, resolveCategoryColor } from './categories';

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

  it('每组一级分类拥有不同的主题色', () => {
    const colors = PRESET_CATEGORIES.map((g) => g.color);
    expect(new Set(colors).size).toBe(colors.length);
    for (const group of PRESET_CATEGORIES) {
      expect(group.color).toMatch(/^#[0-9a-fA-F]{6}$/);
      expect(group.colorLight).toMatch(/^#[0-9a-fA-F]{6}$/);
      expect(group.colorDark).toMatch(/^#[0-9a-fA-F]{6}$/);
    }
  });

  it('resolveCategoryColor 返回与标签一致的组色', () => {
    const tile = resolveCategoryColor('hardin-tile');
    expect(tile).toEqual({ color: '#8fae8b', colorDark: '#6f9271' });
    expect(resolveCategoryColor('uncategorized')).toBeNull();
    const custom = [
      {
        id: 'custom-g1',
        groupId: null,
        color: '#8fb0a9',
        colorDark: '#668d85',
      },
      {
        id: 'custom-c1',
        groupId: 'custom-g1',
        color: '',
        colorDark: '',
      },
    ];
    expect(resolveCategoryColor('custom-g1', custom)).toEqual({
      color: '#8fb0a9',
      colorDark: '#668d85',
    });
    expect(resolveCategoryColor('custom-c1', custom)).toEqual({
      color: '#8fb0a9',
      colorDark: '#668d85',
    });
  });
});
