# Walking Skeleton — 装修账本 (Renovation Ledger)

**Phase:** 1
**Generated:** 2026-08-13

## Capability Proven End-to-End

> 一个装修中的家庭成员可以在手机上打开应用，输入一笔装修支出（金额 + 分类 + 日期 + 备注），保存后在首页立刻看到这笔记录。

## Architectural Decisions

| Decision | Choice | Rationale |
|---|---|---|
| Framework | Vue 3 + TypeScript + Vite | 国内生态成熟、EdgeOne Pages 官方支持；用户认可的技术栈方向 |
| UI | Vant 4 | 国内移动端 H5 组件库，金额键盘/表单/导航开箱即用 |
| State | Pinia | Vue 官方推荐，轻量 |
| Data layer | Dexie (IndexedDB) | Phase 1 本地优先；为 Phase 3 多设备同步预留（记录带 updatedAt） |
| Money | 整数"分"存储 | 避免浮点误差（架构决策） |
| Visual | 极简白底 + 鼠尾草绿主色（CSS 令牌） | 用户选定：简洁时尚、女性友好 |
| Deployment | EdgeOne Pages（GitHub 直连自动构建） | 用户指定部署平台；免费额度充足 |
| Directory layout | `src/pages/*` 页面 + `src/db/` + `src/data/` + `src/stores/` + `src/styles/` | 按职责分目录，后续阶段可扩展 |

## Stack Touched in Phase 1

- [x] 项目脚手架（Vite + Vue3 + TS + Vant + Pinia + Dexie + PWA 依赖）
- [x] 路由——首页、记账页、分类页（至少一条真实路由）
- [x] 数据层——Dexie 一次真实写入 + 一次真实读取（保存支出 → 首页显示）
- [x] UI——记账表单（金额键盘、分类选择）接线到数据层
- [x] 部署——本地 `npm run dev` 全栈运行命令 + EdgeOne Pages 部署配置说明

## Out of Scope (Deferred to Later Slices)

- 编辑/删除、自定义分类（Phase 2）
- 共享账本、多设备同步、记录人昵称（Phase 3）
- 统计图表（Phase 4）
- 预算、登录（v2）
- 空间维度分类（未采用，备注代替）

## Subsequent Slice Plan

- Phase 2: 记账完善——编辑/删除、自定义分类
- Phase 3: 共享账本与多设备同步——邀请加入、记录归属、数据同步
- Phase 4: 统计图表——总支出汇总与分类占比
