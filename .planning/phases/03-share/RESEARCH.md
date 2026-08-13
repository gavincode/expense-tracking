# Phase 3: 共享账本与多设备同步 - Research

**Researched:** 2026-08-14
**Domain:** EdgeOne Blob 文件型存储 + Pages Functions API + 定时轮询同步
**Confidence:** HIGH（Blob/Functions 基于官方文档；同步细节 MEDIUM）

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- D-01: EdgeOne Blob 文件型存储，每账本一个文件，EdgeOne Functions 读写
- D-02: 定时轮询同步（30–60 秒）
- D-03: updatedAt + 软删除 tombstone，last-write-wins
- D-04: 邀请 = 链接 + 二维码 + 短码，长期有效
- D-05: 家人直接加入（无需登录），加入后设置昵称
- D-06: 第一个用户创建账本并设置昵称（默认"我"）
- D-07: 昵称可修改，展示在列表每行
- D-08: 离线本地优先 + 同步队列

### the agent's Discretion
- 轮询频率/触发时机、短码格式、昵称入口、Blob JSON 结构、一致性选择、加入确认页
</user_constraints>

<research_summary>
## Summary

Phase 3 用 EdgeOne 全家桶实现共享：**EdgeOne Makers Blob**（对象存储）持久化每个账本的文件，**EdgeOne Pages Functions**（Node Functions）提供 API，前端定时轮询同步。

**Blob 存储要点**（官方文档）：
- 分布式对象存储，数据持久化在云端，边缘节点加速读取，毫秒级返回
- SDK：`@edgeone/pages-blob`（npm，当前版本）；`getStore({ name, consistency })`，`store.get(key, { consistency })` 支持 `eventual | strong` 一致性
- 单 Blob 上限 25MB、免费版总容量 1GB——家庭账本（数千条记录 JSON）完全够用
- 在 Pages Functions 内自动鉴权，无需额外凭证

**Functions API**：EdgeOne Pages Functions 目录约定（`functions/` 下按路径映射路由，如 `functions/api/ledger.ts` 对应 `/api/ledger`），支持 Node Functions（128MB 包、30–120s、免费 100 万次/月）。API 采用 REST：创建账本、读取账本文件、更新账本文件、加入账本。

**同步设计**：
- 轮询：每 30–60 秒（页面激活时立即一次）GET 账本文件（或增量 `since updatedAt` 参数）
- 合并：服务端 last-write-wins（比较 updatedAt），删除用 tombstone 上传
- 离线：本地 Dexie 乐观写入 + 待同步队列，联网后按序推送

**无登录身份**：设备生成 `deviceId`（localStorage 持久化）；昵称本地保存并随记录快照上传；记录字段携带 `deviceId + nickname`（快照，昵称修改不影响历史）。

**邀请**：账本创建时生成短码；链接形如 `https://<domain>/join?code=XXXX`；二维码在前端用 `qrcode` 库把链接渲染成图片；家人打开链接/扫码/输短码 → 调用加入 API → 写入成员（deviceId+nickname）→ 设置昵称 → 进入账本。

**安全注意**：邀请码长期有效意味着知道链接即可加入——家庭场景可接受；Blob 文件按账本隔离，函数校验请求中的 ledgerId 归属。
</research_summary>

<key_findings>
## Key Findings

- Blob 是"文件型数据库"的正解：每账本一个 key（如 `ledgers/{ledgerId}.json`），读写简单、容量足够
- 强烈建议读采用 `strong` 一致性（轮询场景延迟可忽略），写按"读-改-写 + 版本号"避免覆盖
- 服务端合并规则：按记录 `updatedAt` 取新；删除 = tombstone（deleted=1）同样按 updatedAt 合并
- 昵称快照随记录存储，展示无需查成员表；成员表只用于邀请/修改昵称
- 部署需用户在 EdgeOne 控制台创建 Blob 存储并绑定 Functions（user_setup）
</key_findings>

<sources>
## Sources

- EdgeOne Makers Blob 官方文档（pages.edgeone.ai/document/blob-storage）— HIGH
- @edgeone/pages-blob npm 包说明 — HIGH
- EdgeOne Pages Functions 文档（edgeone.cloud.tencent.com/pages）— HIGH
- 项目既有研究：ARCHITECTURE.md（同步/冲突/tombstone）、PITFALLS.md — HIGH
</sources>
