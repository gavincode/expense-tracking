# Architecture Patterns

**Domain:** 家庭共享账本 Web 应用（EdgeOne 部署）
**Researched:** 2026-08-13

## Recommended Architecture

```
手机浏览器 (H5/PWA, Vue 3 + Vant)
        │  静态资源: EdgeOne Pages (GitHub 直连自动部署)
        ▼
API 层: EdgeOne Pages Functions (Node Functions, 与前端同域)
        │
        ▼
数据层: 腾讯云 CloudBase 云数据库（文档型, 实时 watch）
       └ 附: EdgeOne KV 仅作会话/邀请码等小数据缓存
```

**理由**：家庭规模（一个账本、几个成员、数千条记录）不需要重型后端；CloudBase 提供文档数据库与实时推送，避免自建服务器；EdgeOne 承担前端与 API，符合"部署到 EdgeOne"的既定方向。

### Component Boundaries

| Component | Responsibility | Communicates With |
|-----------|---------------|-------------------|
| SPA (Vue) | 记账交互、本地优先缓存、展示 | EdgeOne API、IndexedDB |
| Service Worker | 静态缓存、后台同步队列 | 浏览器缓存、EdgeOne API |
| EdgeOne Functions | 鉴权、账本/支出/预算 CRUD、邀请码校验 | CloudBase 数据库 |
| CloudBase 数据库 | 权威数据存储、实时订阅 | EdgeOne Functions |

### Data Flow

1. 用户记账 → 先写 IndexedDB（乐观更新，立即显示）→ 入同步队列
2. 联网后队列推送到 EdgeOne API → 校验后写 CloudBase
3. 其他家人设备通过 CloudBase watch（或轮询）收到变更 → 更新本地缓存
4. 冲突：每条记录带 `updatedAt` + 版本号，简单场景 last-write-wins；删除用 tombstone（`deleted: true`），避免"删了又回来"

## Patterns to Follow

### Pattern 1: 金额整数化（分）
**What:** 金额一律以"分"为单位的整数存储与计算，仅展示层格式化为元。
**When:** 所有涉及金额的读写。
**Example:**
```typescript
const amountCents = Math.round(Number(input) * 100);
// 展示: (amountCents / 100).toLocaleString('zh-CN', { style: 'currency', currency: 'CNY' })
```

### Pattern 2: 本地优先（Offline-first）
**What:** 写入先落 IndexedDB（Dexie），联网后同步；读接口优先本地缓存 + 增量拉取。
**When:** 移动网络不稳定时保证"打开就能记"。

### Pattern 3: 服务端强制数据隔离
**What:** 所有数据请求服务端校验 `ledgerId` + 成员身份；客户端不可信。
**When:** 任何跨账本读取/写入。

### Pattern 4: 增量同步（since updatedAt）
**What:** 拉取 `updatedAt > 上次同步时间` 的记录，控制流量与冲突范围。
**When:** 多设备同步。

## Anti-Patterns to Avoid

### Anti-Pattern 1: 整个账本塞进一个 KV 值
**What:** 把全部支出记录作为一个 JSON 存入单个 KV key。
**Why bad:** EdgeOne KV 单值 1 MB 且最终一致性最长 60 s；多设备并发写同一 key 会互相覆盖，丢数据。
**Instead:** 用数据库按记录存储；KV 只放会话、邀请码等小数据。

### Anti-Pattern 2: 金额用浮点数
**What:** `amount: 123.45` 存 double/JS number。
**Why bad:** 浮点误差导致预算统计错误。
**Instead:** 整数"分"存储，展示层格式化。

### Anti-Pattern 3: 删除即物理删除
**What:** DELETE 直接移除记录。
**Why bad:** 未同步设备会"复活"已删记录（tombstone 缺失）。
**Instead:** 软删除 tombstone，同步完成后可清理。

### Anti-Pattern 4: Service Worker 缓存 index.html 且不更新
**What:** 部署后用户仍拿到旧页面（白屏/功能不一致）。
**Why bad:** 前端事故最常见来源。
**Instead:** 静态资源带内容哈希；`skipWaiting + clients.claim`；新版本提示刷新。

## Scalability Considerations

| Concern | At 100 users (家庭级) | At 10K users | At 1M users |
|---------|--------------|--------------|-------------|
| 数据量 | 数千条记录，CloudBase 绰绰有余 | 需索引与分页 | 需分库/缓存层 |
| 同步方式 | watch/轮询即可 | 轮询需加间隔控制 | 需要更重的推送通道 |
| 预算聚合 | 实时查询 | 预聚合计数 | 离线聚合任务 |

本项目按"家庭级"设计即可，架构上避免把数据锁死在单值 KV，其余不做过度设计。

## Sources

- EdgeOne Pages 常见问题（edgeone.cloud.tencent.com/pages）— HIGH
- EdgeOne Makers 限制与配额（cloud.tencent.com/document/product/1552/132789）— HIGH
- EdgeOne Makers KV 文档（cloud.tencent.com/document/product/1552/127420）— HIGH
- 腾讯云开发 CloudBase 文档（cloud.tencent.com/document/product/876）— HIGH
- 金额整数化/避免浮点实践（腾讯云开发者社区、阿里云开发者社区）— HIGH
- 本地优先与冲突解决实践（local-first-sync-engine、react-offline-kit）— MEDIUM
