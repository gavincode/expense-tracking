export interface CategoryChild {
  id: string;
  name: string;
}

export interface CategoryGroup {
  id: string;
  name: string;
  color: string;
  colorLight: string;
  colorDark: string;
  children: CategoryChild[];
}

/** 默认兜底分类：未分类（可直接选择，无二级项）。 */
export const UNCATEGORIZED = {
  id: 'uncategorized',
  name: '未分类',
  color: '#9e9e9e',
  colorLight: '#efefef',
  colorDark: '#757575',
} as const;

/** 用户确认的 5 组一级 + 38 项二级预设（D-06；仅阶段维度 D-07）。 */
export const PRESET_CATEGORIES: CategoryGroup[] = [
  {
    id: 'hardin',
    name: '硬装',
    color: '#8fae8b',
    colorLight: '#eaf1ea',
    colorDark: '#6f9271',
    children: [
      { id: 'hardin-contract', name: '合同款项' },
      { id: 'hardin-demo', name: '拆改' },
      { id: 'hardin-wall', name: '墙体砌筑' },
      { id: 'hardin-protect', name: '成品保护' },
      { id: 'hardin-plumbing', name: '水电' },
      { id: 'hardin-tile', name: '瓦工' },
      { id: 'hardin-waterproof', name: '防水' },
      { id: 'hardin-pipe', name: '包管隔音' },
      { id: 'hardin-carpentry', name: '木工' },
      { id: 'hardin-paint', name: '油漆' },
      { id: 'hardin-grout', name: '美缝' },
    ],
  },
  {
    id: 'materials',
    name: '主材',
    color: '#c2a17a',
    colorLight: '#f7f0e6',
    colorDark: '#9c7a52',
    children: [
      { id: 'materials-tile', name: '瓷砖' },
      { id: 'materials-floor', name: '地板' },
      { id: 'materials-stone', name: '石材' },
      { id: 'materials-doorwindow', name: '门窗' },
      { id: 'materials-seal', name: '封窗' },
      { id: 'materials-profile', name: '型材门' },
      { id: 'materials-cabinet', name: '橱柜' },
      { id: 'materials-custom', name: '全屋定制' },
      { id: 'materials-bathroom', name: '卫浴' },
      { id: 'materials-ceiling', name: '集成吊顶' },
    ],
  },
  {
    id: 'equipment',
    name: '设备系统',
    color: '#7fa8c9',
    colorLight: '#eaf2f9',
    colorDark: '#57809f',
    children: [
      { id: 'equipment-heating', name: '地暖' },
      { id: 'equipment-freshair', name: '新风' },
      { id: 'equipment-water', name: '净水' },
      { id: 'equipment-ac', name: '空调' },
      { id: 'equipment-gas', name: '燃气改造' },
      { id: 'equipment-smarthome', name: '智能家居' },
    ],
  },
  {
    id: 'soft',
    name: '软装家电',
    color: '#d9a0a9',
    colorLight: '#fbeff0',
    colorDark: '#b37783',
    children: [
      { id: 'soft-furniture', name: '家具' },
      { id: 'soft-appliance', name: '家电' },
      { id: 'soft-soft', name: '软装' },
      { id: 'soft-curtain', name: '窗帘' },
      { id: 'soft-lamp', name: '灯具' },
    ],
  },
  {
    id: 'misc',
    name: '杂项',
    color: '#a8a29a',
    colorLight: '#f2f0ed',
    colorDark: '#7e7870',
    children: [
      { id: 'misc-hardware', name: '五金' },
      { id: 'misc-materials', name: '辅材杂料' },
      { id: 'misc-transport', name: '运输上楼' },
      { id: 'misc-service', name: '服务费' },
      { id: 'misc-cleaning', name: '开荒保洁' },
      { id: 'misc-other', name: '其他' },
    ],
  },
];
