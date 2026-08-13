---
status: testing
phase: 03-share
source: [03-VERIFICATION.md]
started: 2026-08-14
updated: 2026-08-14
---

## Current Test

number: 1
name: 账本创建与同步
expected: |
  部署 EdgeOne（Blob 已绑定）后：创建账本 → 记一笔 → 同步 → 数据持久
awaiting: user response（部署后）

## Tests

### 1. 账本创建与同步
expected: 创建账本、记一笔、手动同步无报错、刷新数据仍在
result: [pending]

### 2. 邀请加入与昵称
expected: 第二台设备链接/二维码/短码加入 → 设昵称 → 看到已有记录
result: [pending]

### 3. 多设备一致性
expected: 双设备增/改/删，30–60 秒互见一致
result: [pending]

### 4. 离线补同步
expected: 飞行模式记账（待同步提示）→ 恢复网络自动同步
result: [pending]

## Summary

total: 4
passed: 0
issues: 0
pending: 4
skipped: 0
blocked: 1（需先完成 EdgeOne 部署）

## Gaps

部署前置：EdgeOne Blob 创建与绑定（03-USER-SETUP.md）
