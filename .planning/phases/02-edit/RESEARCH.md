# Phase 2: 记账完善 - Research

**Researched:** 2026-08-13
**Domain:** 本地优先应用中的支出编辑/删除与分类管理
**Confidence:** HIGH

<research_summary>
## Summary

Phase 2 建立在 Phase 1 的本地优先架构上：数据层为 Dexie（IndexedDB），金额整数"分"存储，支出记录带 createdAt/updatedAt。本阶段补齐 REC-03（编辑/删除支出）与自定义分类管理（添加能力已在 Phase 1 提前完成）。

关键设计决策：
1. **编辑复用记账表单**：RecordView 增加编辑模式（路由 `/edit/:id`），进入时用记录预填草稿，保存时调用 updateExpense 而非 addExpense；保存后回详情页并看到更新内容。
2. **软删除（tombstone）**：为 Phase 3 多设备同步预留，支出删除采用 `deleted` 标记 + updatedAt 更新，所有查询（列表/最近/统计/详情）过滤已删除记录；避免"删了又回来"的同步复活问题（见 PITFALLS.md Critical 2）。
3. **分类管理**：自定义分类（一级/二级）支持重命名与删除；删除采用软删除（选择列表不再显示），历史支出保留记录时的分类路径快照（categoryPath 文本），不影响对账。
4. **删除确认**：使用 Vant showConfirmDialog，避免误删。
</research_summary>

<key_findings>
## Key Findings

- Dexie schema 升级：version 3 为 expenses 增加 `deleted` 索引字段（0/1）；categories 增加 `deleted` 字段
- 查询统一过滤：listAll/listRecent/getMonthSummary/getById 均排除 deleted=1；删除 = 标记而不是物理删除
- RecordView 编辑模式：`route.params.id` 存在时加载记录 → 预填 draft（金额/分类/日期/备注）→ 保存调用 updateExpense
- 编辑后回详情页（router.replace(`/detail/${id}`)），展示更新后的数据
- 分类管理页：列出所有自定义分类（一级 + 二级，按所属组归类），支持重命名/删除
- 删除分类时被引用支出不受影响（categoryPath 已快照）
</key_findings>

<sources>
## Sources

- 项目架构文档：.planning/research/ARCHITECTURE.md（软删除 tombstone、金额分存储）
- 常见坑：.planning/research/PITFALLS.md（删除复活、并发一致性）
- Phase 1 代码现状：src/db/ledger.ts、src/pages/RecordView.vue
- Vant 4 官方文档（showConfirmDialog）
</sources>
