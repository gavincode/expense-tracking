# Technology Stack

**Project:** 装修账本 (Renovation Ledger)
**Researched:** 2026-08-13

## Recommended Stack

### Core Framework
| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| Vue 3 + TypeScript | 3.5+ | 前端框架 | 国内生态成熟、上手平缓，组件库适配好；中文文档完善 |
| Vite | 6+ | 构建工具 | EdgeOne Pages 官方支持 Vite 项目，零配置部署 |
| Vant 4 | 4.x | 移动端 UI 组件库 | 专为国内移动端 H5 设计，表单/日历/弹层/主题定制齐全，开箱即用 |
| Pinia + Vue Router | 2.x / 4.x | 状态与路由 | Vue 官方推荐，轻量 |
| vite-plugin-pwa | 1.x | PWA 能力 | Workbox 集成：静态资源缓存、离线壳、添加到主屏幕 |
| Dexie.js | 4.x | IndexedDB 封装 | 本地优先存储，配合后台同步 |
| ECharts | 5.x | 图表 | 国内最成熟的图表库，移动端适配好，中文文档全 |

### Database
| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| 腾讯云 CloudBase 云数据库（文档型） | 当前版本 | 账本、成员、支出、预算的持久化 | 无需自建服务器，支持实时数据推送（watch），与腾讯云生态无缝配合；家庭级规模免费额度足够 |

> **备选（纯 EdgeOne 方案）**：EdgeOne Makers KV（免费版 1 GB 存储、单值 1 MB、最终一致性最长 60 s）可做 MVP 存储，但多设备并发写同一键会丢更新、1 MB 单值容量有限，且非实时。仅建议作为过渡或缓存层，不建议作为账本主存储。

### Infrastructure
| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| EdgeOne Pages | — | 前端托管 + 自动部署 | 连接 GitHub 仓库后自动构建部署；免费额度（500 次构建/月，静态流量不限量） |
| EdgeOne Pages Functions（Node Functions / Cloud Functions） | — | API 层 | 与前端同域部署，免费额度 100 万次/月执行，代码包 128 MB，body 6 MB，执行时长 30–120 s |
| GitHub | — | 代码管理 | 用户指定；Pages 支持 Git 仓库直连，push 即部署 |

### Supporting Libraries
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| Tencent Cloud SMS SDK | 最新 | 手机验证码登录 | 采用手机号+验证码登录时 |
| dayjs | 1.x | 日期处理 | 记账日期、月/周统计 |
| zod 或 valibot | 最新 | 前后端入参校验 | API 边界校验 |
| Workbox（随 vite-plugin-pwa） | 7.x | Service Worker | 离线缓存与后台同步 |

## Alternatives Considered

| Category | Recommended | Alternative | Why Not |
|----------|-------------|-------------|---------|
| 前端框架 | Vue 3 | React | React 可用（antd-mobile），但 Vue + Vant 在国内移动端 H5 生态更顺、模板更贴合本项目 |
| UI 库 | Vant 4 | antd-mobile | Vant 主题定制灵活、默认风格更年轻时尚，适合"简洁时尚"要求 |
| 数据存储 | CloudBase 云数据库 | EdgeOne KV / MySQL 自建 | KV 有并发丢写与容量限制；MySQL 需维护服务器，家庭规模过重 |
| 认证 | 手机号+短信验证码 | 微信网页授权 | 微信开放平台网站应用需企业资质认证，家庭项目周期长、成本高；短信码注册简单直接 |
| 图表 | ECharts | Chart.js | ECharts 中文生态与移动端表现更好 |

## Installation

```bash
# 前端
npm create vite@latest . -- --template vue-ts
npm install vant pinia vue-router dexie dayjs echarts
npm install -D vite-plugin-pwa

# 后端（EdgeOne Pages Functions）
npm install tencentcloud-sdk-nodejs-sms zod
```

## Sources

- EdgeOne Pages 官方文档与常见问题（edgeone.cloud.tencent.com/pages）— HIGH
- EdgeOne Makers 限制与配额（cloud.tencent.com/document/product/1552/132789）— HIGH
- EdgeOne Makers KV 文档（cloud.tencent.com/document/product/1552/127420）— HIGH
- 腾讯云开发 CloudBase 产品文档（cloud.tencent.com/document/product/876/18431）— HIGH
- 微信开放平台网页登录要求（open.weixin.qq.com / 腾讯云身份认证文档）— MEDIUM
- 金额整数化存储行业实践（腾讯云开发者社区多篇）— HIGH
