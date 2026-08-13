# Phase 3: 共享账本与多设备同步 - Context

**Gathered:** 2026-08-14
**Status:** Ready for planning

<domain>
## Phase Boundary

Phase 3 交付：家人通过邀请链接/二维码/短码加入同一个账本（无需登录），每笔支出显示记录人昵称，多设备通过定时轮询保持数据一致；弱网/离线可正常记账，联网后自动补同步。

**范围内：** SHAR-01（邀请加入）、SHAR-02（记录人昵称）、SHAR-03（多设备同步）。

**范围外：** 登录体系（v2）、预算（v2）、多账本管理与切换（v2 候选）。
</domain>

<decisions>
## Implementation Decisions

### 后端与数据存储
- **D-01:** 后端使用 EdgeOne Blob 文件型存储，**每个账本一个文件**（JSON），由 EdgeOne Pages Functions 读写；不使用云数据库服务 — **Reversibility:** costly — 数据结构与 API 契约成型后更换存储形态需迁移
- **D-02:** 多设备同步采用**定时轮询**（30–60 秒），频率与触发时机由实现决定
- **D-03:** 数据模型沿用既有架构：记录带 updatedAt 版本 + 软删除 tombstone，冲突按**最后写入生效**（last-write-wins）

### 邀请与加入
- **D-04:** 邀请形式为**链接 + 二维码 + 短码**，**长期有效**（无过期）
- **D-05:** 家人打开邀请后**直接加入**账本（无需登录），加入后设置自己的昵称

### 账本与昵称
- **D-06:** 第一个用户**创建账本并设置昵称**（未设置时默认"我"）
- **D-07:** 昵称**可修改**，展示在**列表每行**（记录人标识）
- **D-08:** 离线记账走本地优先（IndexedDB 乐观写入 + 同步队列），联网后自动补同步

### the agent's Discretion
- 轮询具体频率（30s / 60s）与触发时机（页面激活时立即拉取一次）
- 邀请短码生成方式与长度、二维码内容格式、链接域名
- 昵称修改入口位置（如首页账本信息区）
- Blob 文件内的 JSON 结构（成员、记录、分类组织）与读一致性选择（强一致/最终一致）
- 首次加入后是否展示"加入成功"确认页

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### 项目定义
- `.planning/PROJECT.md` — 项目蓝图：核心价值、约束、关键决策
- `.planning/REQUIREMENTS.md` — v1 需求（SHAR-01/02/03 属于 Phase 3）
- `.planning/ROADMAP.md` §Phase 3 — 阶段目标、依赖与成功标准

### 研究与架构
- `.planning/research/ARCHITECTURE.md` — 本地优先、同步、冲突、软删除 tombstone
- `.planning/research/STACK.md` — 技术栈与 EdgeOne 能力
- `.planning/research/PITFALLS.md` — 同步冲突、邀请安全、缓存事故
- EdgeOne Makers Blob 官方文档（pages.edgeone.ai/document/blob-storage）— 文件型持久化存储 API

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `src/db/ledger.ts` — Dexie 本地库（expenses/categories，软删除、updatedAt 版本）
- `src/data/categories.ts` — 预设分类与配色解析（resolveCategoryColor）
- Pinia stores（category / draft）与 Vant 组件体系

### Established Patterns
- 本地优先：IndexedDB 乐观写入；查询统一过滤软删除
- 金额整数"分"存储；分类多彩标签体系

### Integration Points
- `src/db/ledger.ts` 需要增加"上传/拉取"适配层（调用 EdgeOne Functions API）
- 新增 API 客户端模块；新增账本/邀请/昵称相关页面与入口

</code_context>

<specifics>
## Specific Ideas

- 用户最初提出"后端数据库使用本地文件数据库如 SQLite"；经核实 EdgeOne 无持久文件系统（官方不支持真 SQLite 文件），按用户意图落地为 **EdgeOne Blob 文件型存储（每账本一个文件）**
- 邀请流程：创建者建账本（设置昵称，默认"我"）；家人打开链接/扫码/输入短码 → 直接加入 → 设置自己的昵称
- 昵称展示在列表每行（与分类颜色并列）

</specifics>

<deferred>
## Deferred Ideas

- 登录体系（手机号/账号）— v2
- 多账本管理与切换 — v2 候选
- 实时推送同步 — 本轮明确选择轮询

</deferred>

---
*Phase: 3-共享账本与多设备同步*
*Context gathered: 2026-08-14*
