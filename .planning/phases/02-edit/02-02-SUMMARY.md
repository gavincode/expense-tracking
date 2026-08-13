---
phase: 02-edit
plan: 02
subsystem: database
tags: [dexie, soft-delete, tombstone]

requires:
  - phase: 02-01
    provides: 详情页操作区
provides:
  - 支出软删除（tombstone）与全视图过滤
  - 详情页删除按钮 + 确认弹窗
affects: [Phase 3 同步]

actuals:
  tokens: 2000
  tasks: 3
  commits: 2

tech-stack:
  added: []
  patterns: [软删除 tombstone（deleted 标记 + updatedAt）, 查询统一过滤]

key-files:
  created: []
  modified: [src/db/ledger.ts, src/db/ledger.test.ts, src/pages/DetailView.vue]

key-decisions:
  - "删除采用软删除：为 Phase 3 多设备同步预留，避免'删了又回来'"

requirements-completed: [REC-03]

coverage:
  - id: D1
    description: "软删除语义：列表/最近/统计/详情均过滤已删除记录"
    requirement: REC-03
    verification:
      - kind: unit
        ref: "src/db/ledger.test.ts#deleteExpense 软删除：视图过滤、表中保留"
        status: pass
    human_judgment: false
  - id: D2
    description: "详情页删除按钮与确认弹窗"
    requirement: REC-03
    verification: []
    human_judgment: true
    rationale: "确认弹窗交互需人工验证"

duration: 5min
completed: 2026-08-13
status: complete
---

# Phase 2 Plan 02: 支出删除 Summary

**软删除落地：删除需确认，删除后列表/最近/统计/详情全部一致消失，tombstone 为同步预留**

## Performance

- **Duration:** 5 min
- **Completed:** 2026-08-13
- **Tasks:** 3
- **Commits:** 2（d349106, f183778）

## Accomplishments
- Dexie schema v3：expenses/categories 增加 deleted 标记
- deleteExpense 软删除；listAll/listRecent/getMonthSummary/getById 统一过滤
- DetailView 删除按钮 + showConfirmDialog 二次确认 + 删除后回列表
- 编辑已删除记录兜底（getById 返回 undefined → 回列表提示）

## Deviations from Plan

None

## Issues Encountered

无

## Next Phase Readiness

软删除模式可复用到分类管理（02-03）。

---
*Phase: 02-edit*
*Completed: 2026-08-13*
