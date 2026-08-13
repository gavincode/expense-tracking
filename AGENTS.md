<!-- GSD:project-start source:PROJECT.md -->

## Project

**装修账本（Renovation Ledger）**

给家人用的装修开销记账应用，以手机浏览器（H5/PWA）为主要入口，记录新房装修全过程的每一笔开销。开销按装修阶段/空间分类（硬装、软装、家电 / 客厅、厨房等），每个分类可以单独设置预算，随时看到剩余金额和超支提醒。家人通过邀请链接/二维码加入同一个账本，实时同步，一起把装修的每一分钱记清楚。

**Core Value:** 在手机上随时随地快速记下每一笔装修开销，全家人在同一个账本里看到完整支出。

### Constraints

- **平台**: H5/PWA（手机浏览器打开，可添加到主屏幕）— 用户选定，作为主要使用形态
- **部署**: 腾讯 EdgeOne — 用户指定，需评估静态托管 + 边缘函数/后端方案
- **代码管理**: GitHub — 用户指定
- **设计**: 简洁时尚、女性用户友好 — 用户明确要求，属于产品体验硬要求
- **界面语言**: 中文 — 家庭用户场景
- **同步**: 家人共享账本需要可靠的数据同步 — 架构设计必须覆盖

<!-- GSD:project-end -->

<!-- GSD:stack-start source:research/STACK.md -->

## Technology Stack

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

# 前端

# 后端（EdgeOne Pages Functions）

## Sources

- EdgeOne Pages 官方文档与常见问题（edgeone.cloud.tencent.com/pages）— HIGH
- EdgeOne Makers 限制与配额（cloud.tencent.com/document/product/1552/132789）— HIGH
- EdgeOne Makers KV 文档（cloud.tencent.com/document/product/1552/127420）— HIGH
- 腾讯云开发 CloudBase 产品文档（cloud.tencent.com/document/product/876/18431）— HIGH
- 微信开放平台网页登录要求（open.weixin.qq.com / 腾讯云身份认证文档）— MEDIUM
- 金额整数化存储行业实践（腾讯云开发者社区多篇）— HIGH

<!-- GSD:stack-end -->

<!-- GSD:conventions-start source:CONVENTIONS.md -->

## Conventions

Conventions not yet established. Will populate as patterns emerge during development.
<!-- GSD:conventions-end -->

<!-- GSD:architecture-start source:ARCHITECTURE.md -->

## Architecture

Architecture not yet mapped. Follow existing patterns found in the codebase.
<!-- GSD:architecture-end -->

<!-- GSD:skills-start source:skills/ -->

## Project Skills

No project skills found. Add skills to any of: `.claude/skills/`, `.agents/skills/`, `.cursor/skills/`, `.github/skills/`, or `.codex/skills/` with a `SKILL.md` index file.
<!-- GSD:skills-end -->

<!-- GSD:workflow-start source:GSD defaults -->

## GSD Workflow Enforcement

Before using Edit, Write, or other file-changing tools, start work through a GSD command so planning artifacts and execution context stay in sync.

Use these entry points:

- `/gsd-quick` for small fixes, doc updates, and ad-hoc tasks
- `/gsd-debug` for investigation and bug fixing
- `/gsd-execute-phase` for planned phase work

Do not make direct repo edits outside a GSD workflow unless the user explicitly asks to bypass it.
<!-- GSD:workflow-end -->

<!-- GSD:profile-start -->

## Developer Profile

> Profile not yet configured. Run `/gsd-profile-user` to generate your developer profile.
> This section is managed by `generate-claude-profile` -- do not edit manually.
<!-- GSD:profile-end -->
