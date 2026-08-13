# Research Summary: 装修账本 (Renovation Ledger)

**Domain:** 家庭共享装修开销记账（移动端 H5/PWA）
**Researched:** 2026-08-13
**Overall confidence:** HIGH

## Executive Summary

这是一个面向家庭（女性用户为主、非技术背景）的装修开销记账应用：按装修阶段/空间组织支出，每个分类可设预算并提醒超支，家人通过邀请链接共享同一个账本、多设备同步。技术方向已由用户指定：GitHub 管理代码、部署腾讯 EdgeOne。

调研显示，这类产品的成熟形态是"结构化预算 + 真实记录 + 多人协作"：用户期望清晰的预算层级、记账自动归入预算结构，以及多成员协同（参考"装修预算表""初创装修记账"等国内产品）。差异化在于移动端快速记账的顺滑度与视觉设计——简洁、时尚、女性友好。

技术栈推荐为 Vue 3 + Vite + Vant 4 构建 PWA，前端部署在 EdgeOne Pages（GitHub 直连自动部署），API 用 EdgeOne Pages Functions，数据层用腾讯云 CloudBase 云数据库（支持实时同步）。金额一律以"分"整数存储。最关键的风险是数据一致性（并发写丢失、同步冲突、缓存事故）和家庭协作信任，架构上必须做本地优先 + 软删除 + 服务端数据隔离。

## Key Findings

**Stack:** Vue 3 + TypeScript + Vite + Vant 4 + vite-plugin-pwa；EdgeOne Pages（前端）+ EdgeOne Functions（API）+ CloudBase 云数据库（数据）；金额整数"分"存储。
**Architecture:** SPA 本地优先（IndexedDB 乐观写入）→ API 校验 → CloudBase 权威存储 → 家人设备 watch/增量拉取；软删除 tombstone；每记录版本号 + last-write-wins。
**Critical pitfall:** 把整个账本塞进单个 EdgeOne KV 值会因并发写与最终一致性（最长 60 s）丢数据；金额浮点误差与 SW 缓存事故次之。

## Implications for Roadmap

基于研究建议的交付顺序：

1. **项目骨架 + 部署流水线** — Vite + Vue 脚手架、EdgeOne Pages 部署、GitHub 直连
   - Addresses: 部署与开发基础（FEATURES: 部署）
   - Avoids: 缓存/部署事故（PITFALLS Critical 3）

2. **账号与账本** — 登录、创建账本、邀请链接加入、成员管理
   - Addresses: 共享账本（FEATURES: 邀请链接/二维码）
   - Avoids: 邀请滥用、登录成本（PITFALLS Moderate 1/2）

3. **分类与快速记账** — 装修分类预设、3 秒记一笔、编辑/删除
   - Addresses: 快速记账、分类体系（FEATURES Table Stakes）
   - Avoids: 输入摩擦、分类复杂（PITFALLS Minor 1/2）

4. **预算与统计** — 分类预算、剩余/超支提醒、支出汇总
   - Addresses: 预算对比（FEATURES Table Stakes）
   - Avoids: 预算口径、提醒疲劳（PITFALLS Moderate 5）

5. **离线与多设备同步** — IndexedDB 本地优先、后台同步、冲突处理
   - Addresses: 多设备同步（FEATURES Differentiators）
   - Avoids: 并发丢写、离线写入丢失（PITFALLS Critical 2）

6. **视觉打磨与发布** — 时尚简洁的主题、图标、PWA 安装引导、上线检查
   - Addresses: 美观设计（FEATURES Differentiators）
   - Avoids: iOS/安卓浏览器 PWA 差异（PITFALLS Moderate 3/4）

**Phase ordering rationale:** 先有可部署的壳，再有人与账本，再有记账与预算核心价值，最后做同步与打磨——每一阶段都交付可验证的用户能力。

**Research flags for phases:**
- Phase 2（账号/邀请）：规划时需确认短信登录成本与风控细节
- Phase 5（同步）：规划时需确认 CloudBase watch 与本地冲突策略细节
- Phase 6（视觉）：建议 `$gsd-ui-phase` 生成设计契约
- 其余阶段为成熟模式，无需额外研究

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | HIGH | EdgeOne/CloudBase 官方文档直接核实配额与能力 |
| Features | MEDIUM | 基于国内同类产品功能与用户明确需求推断 |
| Architecture | HIGH | 基于官方文档与成熟本地优先实践 |
| Pitfalls | HIGH | 数据一致性、缓存事故有明确工程证据 |

## Gaps to Address

- 短信验证码服务是否已在腾讯云开通、费用预算——需用户确认
- 自定义域名是否需要 ICP 备案（影响正式域名选择）——部署阶段确认
- 语音记账、照片凭证等 v2 能力暂不深入

## Sources

- EdgeOne Pages 官方文档与 FAQ（edgeone.cloud.tencent.com/pages）— HIGH
- EdgeOne Makers 限制与配额 / KV 文档（cloud.tencent.com/document/product/1552）— HIGH
- 腾讯云开发 CloudBase 产品文档（cloud.tencent.com/document/product/876）— HIGH
- 装修预算表 / 装企财多多 / 初创装修记账 / 装修记账（App Store、小米应用商店）— MEDIUM
- 前端缓存事故复盘、金额精度实践（腾讯云开发者社区）— HIGH
- 本地优先同步实践（npm: local-first-sync-engine、react-offline-kit）— MEDIUM
