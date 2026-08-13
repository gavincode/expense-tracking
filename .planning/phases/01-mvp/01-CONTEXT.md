# Phase 1: 快速记账 MVP - Context

**Gathered:** 2026-08-13
**Status:** Ready for planning

<domain>
## Phase Boundary

Phase 1 交付：用户打开应用即看到账本首页，几秒内记下一笔装修支出（金额 + 分类），记录立即出现在支出列表中；内置装修分类预设（两级结构）；界面简洁时尚、女性友好（极简白 + 清新绿）。数据先本地保存（多设备同步在 Phase 3）。

**范围内：** REC-01（快速记一笔）、REC-02（支出列表与详情）、REC-04（装修分类预设）、UX-01（视觉与体验）。

**范围外（后续阶段）：** 编辑/删除与自定义分类（Phase 2）、共享账本与同步（Phase 3）、统计图表（Phase 4）、预算与登录（v2）。
</domain>

<decisions>
## Implementation Decisions

### 首页与信息架构
- **D-01:** 打开应用第一屏为账本首页：本月支出合计 + 本月笔数 + 最近支出记录，底部大按钮进入记账
- **D-02:** 保存一笔支出后自动回到首页，可立即看到最新记录

### 记账流程
- **D-03:** 记账顺序：输入金额（数字键盘直出）→ 点击分类跳转分类页 → 选择二级分类 → 返回记账页 → 点击保存 → 回到首页
- **D-04:** 记账字段：金额、分类、日期（默认今天、可修改）、可选备注 — **Reversibility:** reversible
- **D-05:** 分类选择使用独立分类页（非底部弹层），返回记账页后由用户确认保存

### 分类体系
- **D-06:** 两级分类结构：一级 5 组（硬装 / 主材 / 设备系统 / 软装家电 / 杂项），二级 38 项（用户提供的完整清单，见 Specific Ideas）
- **D-07:** v1 不做"空间"（客厅/厨房）分类维度，需要时用备注记录
- 数据模型需为 Phase 2 的自定义分类（REC-05）预留扩展空间（一级/二级均可增删）

### 视觉
- **D-08:** 极简白底 + 清新绿（鼠尾草绿）点缀色，干净利落、女性友好 — **Reversibility:** costly — 换主题色会波及全部页面与组件，建议落地为设计令牌（token）以便日后调整
- 圆角、字号、间距、动效等细节由规划/UI 阶段按"简洁时尚"方向确定

### the agent's Discretion
- 分类页的列表形态（分组标题、滚动、最近使用置顶等）
- 首页"本月"统计口径（自然月）与数字卡片的具体样式
- Phase 1 底部导航结构（是否已含"记账/明细"入口，或仅首页 + 记账大按钮）
- 备注字段的长度限制与展示位置

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### 项目定义
- `.planning/PROJECT.md` — 项目蓝图：核心价值、约束、关键决策
- `.planning/REQUIREMENTS.md` — v1 需求（REC-01/02/04、UX-01 属于 Phase 1）
- `.planning/ROADMAP.md` §Phase 1 — 阶段目标、依赖与成功标准

### 研究与架构
- `.planning/research/FEATURES.md` — 功能全景、MVP 推荐
- `.planning/research/STACK.md` — 技术栈（Vue 3 + Vite + Vant 4 + PWA）
- `.planning/research/ARCHITECTURE.md` — 架构与数据模型（本地优先、金额整数"分"存储）
- `.planning/research/PITFALLS.md` — 关键坑（金额精度、缓存、输入摩擦）

</canonical_refs>

<code_context>
## Existing Code Insights

全新项目（Greenfield）——当前无任何业务代码，只有 `.planning/` 规划文档。

### Reusable Assets
- 无既有代码可复用；项目骨架将在 Phase 1 创建

### Established Patterns
- 技术栈方向已定：Vue 3 + TypeScript + Vite + Vant 4 + Pinia + Dexie（见 STACK.md）
- 金额以整数"分"存储（见 ARCHITECTURE.md）

### Integration Points
- 无既有集成点；新项目从零搭建，EdgeOne Pages 部署流水线待建立

</code_context>

<specifics>
## Specific Ideas

用户提供的完整预设分类清单（一级 → 二级）：

- **硬装**：合同款项、拆改、墙体砌筑、成品保护、水电、瓦工、防水、包管隔音、木工、油漆、美缝
- **主材**：瓷砖、地板、石材、门窗、封窗、型材门、橱柜、全屋定制、卫浴、集成吊顶
- **设备系统**：地暖、新风、净水、空调、燃气改造、智能家居
- **软装家电**：家具、家电、软装、窗帘、灯具
- **杂项**：五金、辅材杂料、运输上楼、服务费、开荒保洁、其他

</specifics>

<deferred>
## Deferred Ideas

- 空间维度分类（客厅/厨房等）— 用户未采用，如需记录可用备注
- 其余讨论均保持在阶段范围内，无越界想法

</deferred>

---
*Phase: 1-快速记账 MVP*
*Context gathered: 2026-08-13*
