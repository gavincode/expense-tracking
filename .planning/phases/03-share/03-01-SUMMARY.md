---
phase: 03-share
plan: 01
subsystem: backend
tags: [edgeone, blob, sync, identity]

requires:
  - phase: 02-edit
    provides: 数据层（软删除、updatedAt）、UI 体系
provides:
  - EdgeOne Functions + Blob 账本文件存储（每账本一文件）
  - 上传/拉取同步引擎（last-write-wins + 版本锁 + tombstone）
  - 设备身份与昵称（默认"我"，可修改，记录快照）
affects: [03-02 邀请, 03-03 轮询]

actuals:
  tokens: 9000
  tasks: 3
  commits: 3

tech-stack:
  added: [@edgeone/pages-blob]
  patterns: [文件型存储（每账本一个 Blob key）, 版本乐观锁, updatedAt LWW 合并]

key-files:
  created: [functions/api/ledger.ts, src/api/client.ts, src/db/sync.ts, src/stores/identity.ts, src/types/ledger.ts]
  modified: [src/db/ledger.ts, src/pages/HomeView.vue, src/pages/ListView.vue, src/pages/DetailView.vue, src/pages/RecordView.vue, tsconfig.json]

key-decisions:
  - "Blob 每账本一个文件（ledgers/{ledgerId}.json），invites 索引记录邀请码"
  - "合并按 updatedAt LWW；版本冲突 409 + 重试一次"

requirements-completed: [SHAR-02]

coverage:
  - id: D1
    description: "同步合并语义（LWW、tombstone、版本锁冲突重试）"
    verification:
      - kind: unit
        ref: "src/db/sync.test.ts#pushLedger 成功路径与版本冲突重试"
        status: pass
    human_judgment: false
  - id: D2
    description: "记录 cloudId 与昵称快照写入"
    requirement: SHAR-02
    verification:
      - kind: unit
        ref: "src/db/ledger.test.ts#addExpense 写入 cloudId 与默认昵称"
        status: pass
    human_judgment: false
  - id: D3
    description: "创建账本 + 上传/拉取全链路（需部署 EdgeOne Blob 后人工验证）"
    verification: []
    human_judgment: true
    rationale: "真实 Blob 读写需部署到 EdgeOne 后在浏览器验证"

duration: 20min
completed: 2026-08-14
status: complete
---

# Phase 3 Plan 01: 账本文件存储与同步引擎 Summary

**EdgeOne Functions + Blob 每账本一文件：创建/上传/拉取同步引擎 + 设备身份昵称落地**

## Performance

- **Duration:** 20 min
- **Completed:** 2026-08-14
- **Tasks:** 3
- **Commits:** 3（31975d9, 7d04c08 + 后续）

## Accomplishments
- functions/api/ledger.ts：创建/读取/更新账本（版本乐观锁），invites 索引
- src/api/client.ts：REST 客户端（409/404 语义化）
- src/db/sync.ts：merge（LWW + tombstone）、push（冲突重试）、pull（合并到本地）
- src/stores/identity.ts：deviceId + 昵称（默认"我"）
- 记录带 cloudId + 昵称快照；列表/详情显示记录人
- HomeView 创建账本流程 + 手动同步

## Deviations from Plan

- 同步队列以"updatedAt > lastSyncedAt + 整文件推送 + 失败重试"实现（未单独建 sync_queue 表，语义等价且更简单）— 已在 03-03 记录

## Issues Encountered

- @edgeone/pages-blob 类型声明对 token 模式标注必填，实际 Pages Functions 自动鉴权——已强转并注释说明

## User Setup Required

⚠️ 见 [03-USER-SETUP.md](./03-USER-SETUP.md)：EdgeOne 控制台创建 Blob 存储并绑定 Functions

## Next Phase Readiness

邀请 API 依赖 invites 索引，已在创建时写入。

---
*Phase: 03-share*
*Completed: 2026-08-14*
