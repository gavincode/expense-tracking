# Phase 3: 共享账本与多设备同步 - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-08-14
**Phase:** 3-共享账本与多设备同步
**Areas discussed:** 后端与数据存储, 同步实时性, 邀请机制, 昵称与记录人

---

## 后端与数据存储

| Option | Description | Selected |
|--------|-------------|----------|
| A | 腾讯云 CloudBase 云数据库 | |
| B | EdgeOne Pages Functions + KV | |
| 用户自由输入 | 本地文件数据库如 SQLite | ✓（经核实落地为 EdgeOne Blob 文件型存储） |

**User's choice:** 本地文件数据库思路 → EdgeOne Blob 文件型存储（每账本一个文件），EdgeOne Functions 读写
**Notes:** 官方确认 EdgeOne 无持久文件系统、不支持真 SQLite 文件；Blob 对象存储为同思路的可行落地。

## 同步实时性

| Option | Description | Selected |
|--------|-------------|----------|
| A | 接近实时（CloudBase 实时推送） | |
| B | 定时轮询（30–60 秒） | ✓ |
| C | 打开/记账时同步 + 手动刷新 | |

**User's choice:** B — 定时轮询
**Notes:** 具体频率与触发时机留给实现。

## 邀请机制

| Option | Description | Selected |
|--------|-------------|----------|
| A | 链接 + 二维码 + 短码，长期有效 | ✓ |
| B | 链接 + 二维码，7 天有效 | |
| C | 其他 | |

**User's choice:** A — 链接 + 二维码 + 短码，长期有效
**Notes:** 家人打开邀请直接加入（无需登录），进入后设置昵称。

## 昵称与记录人

**User's choice:** 首次使用设置昵称（创建者默认"我"）；昵称可修改；展示在列表每行
**Notes:** 记录人昵称随记录一起上传显示。

---

## the agent's Discretion

- 轮询频率与触发时机、短码格式、昵称修改入口位置、Blob 文件 JSON 结构、加入确认页

## Deferred Ideas

- 登录体系、多账本管理与切换、实时推送 — 均推迟
