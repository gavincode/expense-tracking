export interface CategoryChild {
  id: string;
  name: string;
}

export interface CategoryGroup {
  id: string;
  name: string;
  children: CategoryChild[];
}

/** 用户确认的 5 组一级 + 38 项二级预设（D-06；仅阶段维度 D-07）。 */
export const PRESET_CATEGORIES: CategoryGroup[] = [
  {
    id: 'hardin',
    name: '硬装',
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
    children: [
      { id: 'mat-tile', name: '瓷砖' },
      { id: 'mat-floor', name: '地板' },
      { id: 'mat-stone', name: '石材' },
      { id: 'mat-doorwindow', name: '门窗' },
      { id: 'mat-seal', name: '封窗' },
      { id: 'mat-profile', name: '型材门' },
      { id: 'mat-cabinet', name: '橱柜' },
      { id: 'mat-custom', name: '全屋定制' },
      { id: 'mat-bathroom', name: '卫浴' },
      { id: 'mat-ceiling', name: '集成吊顶' },
    ],
  },
  {
    id: 'equipment',
    name: '设备系统',
    children: [
      { id: 'eq-heating', name: '地暖' },
      { id: 'eq-freshair', name: '新风' },
      { id: 'eq-water', name: '净水' },
      { id: 'eq-ac', name: '空调' },
      { id: 'eq-gas', name: '燃气改造' },
      { id: 'eq-smarthome', name: '智能家居' },
    ],
  },
  {
    id: 'soft',
    name: '软装家电',
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
