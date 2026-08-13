# Phase 1: 快速记账 MVP - Research

**Researched:** 2026-08-13
**Domain:** 移动端 H5/PWA 快速记账交互 + Vant 4 组件 + Vite PWA + EdgeOne 部署
**Confidence:** HIGH

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- D-01: 首页 = 本月合计 + 本月笔数 + 最近记录，底部大按钮记账
- D-02: 保存后自动回到首页
- D-03: 记账顺序：金额 → 分类页 → 二级分类 → 返回 → 保存
- D-04: 字段 = 金额、分类、日期（默认今天可改）、可选备注
- D-05: 分类选择走独立分类页（非弹层）
- D-06: 两级分类：5 组一级 + 38 个二级（用户提供清单）
- D-07: v1 不做空间维度
- D-08: 极简白 + 清新绿（鼠尾草绿）视觉

### the agent's Discretion
- 分类页列表形态、首页统计口径（自然月）、底部导航结构、备注字段细节

### Deferred Ideas (OUT OF SCOPE)
- 空间维度分类、编辑/删除（Phase 2）、共享/同步（Phase 3）、统计图表（Phase 4）
</user_constraints>

<architectural_responsibility_map>
## Architectural Responsibility Map

Single-tier application（Phase 1 纯前端）——所有能力位于 Browser/Client：界面、路由、本地数据（IndexedDB/Dexie）、视觉令牌。后端与同步属于 Phase 3。
</architectural_responsibility_map>

<research_summary>
## Summary

Phase 1 是纯前端单层应用：Vue 3 + Vite + Vant 4 + Pinia + Dexie，部署到 EdgeOne Pages（GitHub 直连自动构建）。

快速记账的关键交互模式（业界成熟做法）：
1. **金额输入**：使用 Vant `NumberKeyboard`（`theme="custom"` 带右侧栏，专为金额输入设计）配合只读 `Field` 展示，避免原生数字键盘在 iOS/Android 的兼容问题（maxlength 失效、小数输入不一致等）。
2. **分类选择**：独立页面两级导航（一级分组 → 二级列表），返回后保留所选值；常用项置顶可选。
3. **保存与反馈**：保存后返回首页并即时显示新记录（本地 IndexedDB 乐观写入，无网络延迟）。
4. **金额精度**：输入以元为单位展示，内部以"分"整数存储（避免浮点误差，见 ARCHITECTURE.md）。

PWA：`vite-plugin-pwa` 生成 manifest（name/short_name/start_url/display: standalone/theme-color）+ Service Worker 预缓存；注意部署后缓存更新策略（内容哈希 + skipWaiting/clients.claim，避免白屏）。

EdgeOne Pages：`edgeone.json` 配置 `buildCommand`/`outDir`（Vite 默认 `dist`）；控制台连接 GitHub 仓库自动部署；免费版 500 次构建/月，静态流量不限量。
</research_summary>

<key_findings>
## Key Findings

### Vant 4 组件清单（本阶段）
| 组件 | 用途 | 备注 |
|------|------|------|
| `Field` (readonly) | 金额/备注展示 | 配合 NumberKeyboard |
| `NumberKeyboard` | 金额数字键盘 | `theme="custom"` 右侧栏，专为金额场景 |
| `DatePicker` / `Calendar` | 日期修改 | 默认今天，可回改 |
| `Cell` / `CellGroup` | 分类列表项 | 两级导航 |
| `NavBar` | 页面导航/返回 | 记账页、分类页 |
| `Button` | 保存、底部大按钮 | 圆角、主色清新绿 |
| `Tabbar`（可选） | 底部导航 | 首页/记账入口 |
| `Empty` | 空状态 | 首用引导 |
| `Tag` / `Progress`（可选） | 分类标签/预算占位 | 预算在 v2，不实现 |

### 关键实现要点
- Dexie 表：`ledger`（支出记录：id, amountCents, categoryId, categoryPath, date, note, createdAt, updatedAt）、`categories`（预设+后续自定义）、`meta`（可选）
- 统计口径：`date` 在当月（自然月）的记录求和/计数
- 分类种子数据：5 组一级 + 38 项二级（CONTEXT.md Specific Ideas 完整清单）
- 视觉令牌：CSS 变量 `--color-primary`（鼠尾草绿 ≈ #8FAE8B）、背景白、圆角 12–16px、大触控目标（≥44px）
- PWA：manifest + SW 预缓存；`registerType: 'autoUpdate'` + `skipWaiting: true` + `clientsClaim: true` 以规避缓存事故

### 部署（EdgeOne Pages）
- `edgeone.json`: `{ "buildCommand": "npm run build", "outputDirectory": "dist" }`（字段以官方文档为准）
- 控制台连接 GitHub 仓库 → 自动部署；免费 SSL、自定义域名（大陆访问需确认 ICP 备案）
- 本地验证：`npm run dev` 全栈可运行命令即为 skeleton 验收的一部分
</key_findings>

<sources>
## Sources

- Vant 4 官方文档（NumberKeyboard/Field/DatePicker）— HIGH
- vite-plugin-pwa 文档与社区实践（juejin / CoreUI / GitHub issues）— HIGH
- EdgeOne Pages 官方文档（edgeone.json、Vite/Vue 部署）— HIGH
- 项目既有研究：.planning/research/STACK.md、ARCHITECTURE.md、PITFALLS.md — HIGH
</sources>
