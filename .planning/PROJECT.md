# 装修账本（Renovation Ledger）

## What This Is

给家人用的装修开销记账应用，以手机浏览器（H5/PWA）为主要入口，记录新房装修全过程的每一笔开销。开销按装修阶段/空间分类（硬装、软装、家电 / 客厅、厨房等），每个分类可以单独设置预算，随时看到剩余金额和超支提醒。家人通过邀请链接/二维码加入同一个账本，实时同步，一起把装修的每一分钱记清楚。

## Core Value

在手机上随时随地快速记下每一笔装修开销，全家人在同一个账本里看到完整支出。

## Requirements

### Validated

- ✓ 用户在手机上快速记下一笔开销（打开即记、默认数字键盘、常用项一键选）— Phase 1
- ✓ 开销按装修阶段/空间分类，两级结构（5 组 38 项预设）+ 自定义分类 — Phase 1
- ✓ 查看支出列表与单笔详情（按日分组、当日小计）— Phase 1
- ✓ 界面简洁时尚（极简白 + 分类多彩标签体系）、移动端优先、全中文 — Phase 1

### Active

- [ ] 家人通过邀请链接/二维码加入同一个账本，无需登录，多设备同步
- [ ] 每笔开销显示记录人（设备昵称标识）
- [ ] 用户可以查看装修全过程的开销汇总与统计图表

### Out of Scope

- 预算功能（分类预算、超支提醒、总预算一览）— 推迟到 v2
- 登录/账号体系 — v1 用邀请链接 + 设备昵称，v2 再评估
- 原生 App — 先用 H5/PWA，后续按需再评估
- 微信小程序 — 用户选择先做 H5，部署到 EdgeOne
- 复杂财务功能（分期、贷款计算、报销、发票管理）— 超出家庭记账场景
- 复杂权限体系（多角色、细粒度权限）— 一个共享账本足够

## Context

- 使用场景：新房装修期间，家人（以女性为主）在手机上快速记录开销，装修结束后依然可以作为家庭开销账本继续使用
- 用户特征：非技术背景的家庭成员，界面必须简单直观；外观要简洁时尚，符合女性审美
- 数据特征：装修周期长（数月），涉及大量小额与中额支出，按阶段/空间组织最有价值
- 技术环境：代码托管在 GitHub，部署到腾讯 EdgeOne；国内网络环境，移动端优先
- 共享需求：多个家人设备需要同步同一个账本，需要后端存储与实时同步能力

## Constraints

- **平台**: H5/PWA（手机浏览器打开，可添加到主屏幕）— 用户选定，作为主要使用形态
- **部署**: 腾讯 EdgeOne — 用户指定，需评估静态托管 + 边缘函数/后端方案
- **代码管理**: GitHub — 用户指定
- **设计**: 简洁时尚、女性用户友好 — 用户明确要求，属于产品体验硬要求
- **界面语言**: 中文 — 家庭用户场景
- **同步**: 家人共享账本需要可靠的数据同步 — 架构设计必须覆盖

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| 按装修阶段/空间分类记账 | 贴合装修场景，方便回顾 | ✓ Good（Phase 1 落地） |
| 预算功能推迟到 v2 | 先做顺快速记账与共享，预算后续叠加 | — Pending |
| v1 不做登录，邀请链接 + 设备昵称标识记录人 | 降低家人使用门槛 | — Pending |
| H5/PWA 而非微信小程序 | 可部署到 EdgeOne，无需微信平台流程 | ✓ Good（Phase 1 落地） |
| 家人共享同一账本（邀请链接/二维码） | 简单直接的协作方式 | — Pending |
| 快速记账优先（打开即记、默认数字键盘） | 移动端高频使用场景 | ✓ Good（Phase 1 落地） |
| GitHub 管理代码 + EdgeOne 部署 | 用户指定的技术方向 | ✓ Good（配置就绪，部署待用户操作） |
| 自定义分类提前到 Phase 1 落地 | 真机验证中用户提出，直接满足需求 | ✓ Good |

## Evolution

This document evolves at phase transitions and milestone boundaries.

**After each phase transition** (via `$gsd-transition`):
1. Requirements invalidated? → Move to Out of Scope with reason
2. Requirements validated? → Move to Validated with phase reference
3. New requirements emerged? → Add to Active
4. Decisions to log? → Add to Key Decisions
5. "What This Is" still accurate? → Update if drifted

**After each milestone** (via `$gsd-complete-milestone`):
1. Full review of all sections
2. Core Value check — still the right priority?
3. Audit Out of Scope — reasons still valid?
4. Update Context with current state

---
*Last updated: 2026-08-13 after Phase 1（快速记账 MVP）完成*
