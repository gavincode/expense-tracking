# Roadmap: 装修账本 (Renovation Ledger)

## Overview

从"能在手机上快速记一笔"开始，逐步完善记录管理、全家共享与多设备同步，最后用清晰的图表呈现装修花费全貌。每条阶段都交付一条完整的用户能力（纵向 MVP），先让家人用起来，再叠加协作与统计。

## Phases

**Phase Numbering:**

- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

Decimal phases appear between their surrounding integers in numeric order.

- [x] **Phase 1: 快速记账 MVP** - 打开就能 3 秒记一笔，看到支出列表 (completed 2026-08-13)
- [ ] **Phase 2: 记账完善** - 编辑/删除支出，自定义分类
- [ ] **Phase 3: 共享账本与多设备同步** - 邀请家人加入同一账本，数据多端一致
- [ ] **Phase 4: 统计图表** - 看清装修总花费与花在哪

## Phase Details

### Phase 1: 快速记账 MVP

**Goal**: 用户能在手机上快速记下第一笔装修支出并随时回看
**Mode**: mvp
**Depends on**: Nothing (first phase)
**Requirements**: REC-01, REC-02, REC-04, UX-01
**Success Criteria** (what must be TRUE):

  1. 用户打开应用，3 秒内完成一笔支出记录（金额 + 分类 + 保存）
  2. 新记录立即出现在支出列表中，显示金额、分类、日期
  3. 系统预置装修分类（硬装/软装/家电 / 客厅/厨房等），可直接选用
  4. 手机浏览器中界面简洁美观、全中文，操作清晰

**Plans**: 3/3 plans executed

- [x] 01-01-PLAN.md
- [x] 01-02-PLAN.md
- [x] 01-03-PLAN.md

**UI hint**: yes

### Phase 2: 记账完善

**Goal**: 用户可以随时修正记录并自由扩展分类
**Mode**: mvp
**Depends on**: Phase 1
**Requirements**: REC-03, REC-05
**Success Criteria** (what must be TRUE):

  1. 用户能编辑已有支出（金额/分类/日期/备注），修改后列表与详情同步更新
  2. 用户能删除一笔支出，删除后列表不再显示
  3. 用户能添加自定义分类，并在记账时选用

**Plans**: 3/3 plans executed

- [x] 02-01-PLAN.md
- [x] 02-02-PLAN.md
- [x] 02-03-PLAN.md

**UI hint**: yes

### Phase 3: 共享账本与多设备同步

**Goal**: 全家人在同一个账本里协作记账，各设备数据一致
**Mode**: mvp
**Depends on**: Phase 2
**Requirements**: SHAR-01, SHAR-02, SHAR-03
**Success Criteria** (what must be TRUE):

  1. 家人通过邀请链接或二维码加入账本，无需注册登录
  2. 任一设备新增/编辑/删除支出后，其他家人设备能看到一致结果
  3. 每笔支出显示记录人昵称
  4. 弱网或离线时可正常记账，联网后自动补同步

**Plans**: TBD
**UI hint**: yes

### Phase 4: 统计图表

**Goal**: 用户能直观看到装修花了多少钱、花在哪里
**Mode**: mvp
**Depends on**: Phase 3
**Requirements**: STAT-01
**Success Criteria** (what must be TRUE):

  1. 用户能查看账本总支出汇总
  2. 用户能按分类（阶段/空间）查看小计与占比图表
  3. 图表在手机上清晰可读

**Plans**: TBD
**UI hint**: yes

## Progress

**Execution Order:**
Phases execute in numeric order: 1 → 2 → 3 → 4

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. 快速记账 MVP | 3/3 | Complete    | 2026-08-13 |
| 2. 记账完善 | 3/3 | In Progress|  |
| 3. 共享账本与多设备同步 | 0/0 | Not started | - |
| 4. 统计图表 | 0/0 | Not started | - |
