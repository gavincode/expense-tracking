---
phase: 01-mvp
plan: 02
subsystem: ui
tags: [vue, vant, dexie, list, detail]

requires:
  - phase: 01-01
    provides: 数据层（listAll/getById/getMonthSummary）、页面骨架、视觉令牌
provides:
  - 首页本月总览（合计/笔数/最近记录）
  - 按日分组的完整支出列表（含当日小计）
  - 单笔支出详情页
  - 空状态引导与视觉打磨
affects: [01-03 测试与打磨, Phase 4 统计图表]

actuals:
  tokens: 3500
  tasks: 3
  commits: 3

tech-stack:
  added: []
  patterns: [计算属性内做按日分组（computed groups）, 详情页参数路由 /detail/:id]

key-files:
  created: [src/pages/ListView.vue, src/pages/DetailView.vue]
  modified: [src/pages/HomeView.vue, src/router/index.ts, src/db/ledger.test.ts]

key-decisions:
  - "本月统计口径为自然月（date 的 YYYY-MM）"
  - "列表按日分组并显示当日小计，便于装修对账"
  - "详情页未找到记录时显示空状态而非报错"

patterns-established:
  - "首页汇总卡片使用主色浅色背景（--color-primary-light）"
  - "列表行点击跳转详情使用路由参数 id"

requirements-completed: [REC-02, UX-01]

coverage:
  - id: D1
    description: "首页本月合计/笔数/最近记录总览"
    requirement: REC-02
    verification:
      - kind: unit
        ref: "src/db/ledger.test.ts#getMonthSummary 只统计当月"
        status: pass
    human_judgment: true
    rationale: "汇总卡片在手机上的呈现效果需人工确认"
  - id: D2
    description: "完整支出列表（日期倒序、按日分组、当日小计）与查看全部入口"
    requirement: REC-02
    verification:
      - kind: unit
        ref: "src/db/ledger.test.ts#listAll 按日期倒序返回"
        status: pass
    human_judgment: true
    rationale: "分组展示与行点击跳转需人工在浏览器验证"
  - id: D3
    description: "单笔支出详情页与空状态引导"
    requirement: UX-01
    verification: []
    human_judgment: true
    rationale: "详情信息呈现与空状态文案需人工确认"

duration: 5min
completed: 2026-08-13
status: complete
---

# Phase 1 Plan 02: 首页总览与支出列表/详情 Summary

**首页本月总览卡片、按日分组的完整支出列表与单笔详情页上线，空状态与视觉打磨达标**

## Performance

- **Duration:** 5 min
- **Started:** 2026-08-13T23:08:20+08:00
- **Completed:** 2026-08-13T23:09:20+08:00
- **Tasks:** 3
- **Files modified:** 5

## Accomplishments
- 首页新增本月合计与本月笔数总览卡片（自然月口径），保留最近记录与"查看全部"入口
- 完整支出列表 `/list`：按日期倒序、按日分组、每日小计
- 单笔详情页 `/detail/:id`：金额、分类路径、日期、备注（无备注显示占位）
- 列表与首页空状态引导（Vant Empty）
- 视觉统一：主色浅色卡片、圆角、触控目标 ≥44px

## Task Commits

1. **Task 1: 首页本月总览** - `c27cef6` (feat)
2. **Task 2: 完整支出列表** - `d0ee815` (feat)
3. **Task 3: 详情页与空状态** - `f613d31` (feat)

## Files Created/Modified
- `src/pages/HomeView.vue` - 本月总览卡片 + 查看全部入口
- `src/pages/ListView.vue` - 按日分组列表（新增）
- `src/pages/DetailView.vue` - 单笔详情（新增）
- `src/router/index.ts` - /list、/detail/:id 路由
- `src/db/ledger.test.ts` - listAll 排序测试

## Decisions Made
- 本月统计口径 = 自然月（date 前缀匹配）
- 列表按日分组 + 当日小计（装修对账场景）

## Deviations from Plan

None - plan executed as written（提交顺序上 /detail 路由随任务 2 提交、组件随任务 3 提交，功能一致）。

## Issues Encountered
- 无

## User Setup Required

None

## Next Phase Readiness
- 查看能力完整，计划 01-03 可聚焦测试、视觉打磨与文档

---
*Phase: 01-mvp*
*Completed: 2026-08-13*
