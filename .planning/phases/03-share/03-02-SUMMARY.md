---
phase: 03-share
plan: 02
subsystem: ui
tags: [invite, qrcode, join]

requires:
  - phase: 03-01
    provides: 账本文件存储、invites 索引、客户端 API
provides:
  - 邀请加入（链接 + 二维码 + 短码，长期有效）
  - 加入页（无需登录，设置昵称）
affects: [03-03 轮询]

actuals:
  tokens: 4500
  tasks: 3
  commits: 2

tech-stack:
  added: [qrcode]
  patterns: [invites 索引解析邀请码 → 账本, 成员幂等写入]

key-files:
  created: [functions/api/invite.ts, src/pages/JoinView.vue]
  modified: [functions/api/ledger.ts, src/api/client.ts, src/router/index.ts, src/pages/HomeView.vue]

key-decisions:
  - "邀请码 6 位数字、长期有效；链接/二维码/短码同源"
  - "加入即写成员（幂等），返回 members 供本地保存"

requirements-completed: [SHAR-01]

coverage:
  - id: D1
    description: "joinLedger 客户端请求正确（/api/invite 负载）"
    requirement: SHAR-01
    verification:
      - kind: unit
        ref: "src/api/client.test.ts#joinLedger 向 /api/invite 发送加入请求并解析结果"
        status: pass
    human_judgment: false
  - id: D2
    description: "邀请面板（链接/二维码/短码）与加入流程（需部署后人工验证）"
    requirement: SHAR-01
    verification: []
    human_judgment: true
    rationale: "扫码/输码加入需部署后在多设备验证"

duration: 12min
completed: 2026-08-14
status: complete
---

# Phase 3 Plan 02: 邀请加入 Summary

**链接 + 二维码 + 短码邀请家人直接加入（无需登录），加入后设置昵称**

## Performance

- **Duration:** 12 min
- **Completed:** 2026-08-14
- **Tasks:** 3
- **Commits:** 2（afcd418, 8cb3f51）

## Accomplishments
- functions/api/invite.ts：邀请码校验 → 账本 → 成员幂等写入
- JoinView：/join?code= 自动带入、短码输入、昵称设置、加入后拉取
- HomeView 邀请面板：邀请码大字、二维码（qrcode 渲染）、复制链接

## Deviations from Plan

None

## Issues Encountered

无

## Next Phase Readiness

加入后已写入成员并保存本地，03-03 轮询即可持续同步。

---
*Phase: 03-share*
*Completed: 2026-08-14*
