# Requirements: 装修账本 (Renovation Ledger)

**Defined:** 2026-08-13
**Core Value:** 在手机上随时随地快速记下每一笔装修开销，全家人在同一个账本里看到完整支出。

## v1 Requirements

### 记账 (REC)

- [ ] **REC-01**: 用户能在手机上几秒内记下一笔装修支出（金额 + 分类 + 日期，常用项一键选）
- [ ] **REC-02**: 用户能查看支出列表与单笔支出详情
- [ ] **REC-03**: 用户能编辑或删除一笔支出
- [ ] **REC-04**: 系统内置装修分类预设（按阶段/空间：硬装、软装、家电 / 客厅、厨房等）
- [ ] **REC-05**: 用户能添加自定义分类

### 共享账本 (SHAR)

- [ ] **SHAR-01**: 用户能通过邀请链接/二维码加入同一个装修账本
- [ ] **SHAR-02**: 每笔支出显示记录人（设备昵称标识，v1 无需登录）
- [ ] **SHAR-03**: 多个家人的设备能同步同一个账本的数据

### 统计 (STAT)

- [ ] **STAT-01**: 用户能查看装修支出汇总与按分类的图表

### 体验 (UX)

- [ ] **UX-01**: 界面简洁时尚、女性友好、移动端优先，全中文

## v2 Requirements

### 预算

- **BUDG-01**: 每个分类（阶段/空间）可以单独设置预算
- **BUDG-02**: 显示预算剩余金额与超支提醒
- **BUDG-03**: 显示装修总预算一览

### 账号与增强

- **AUTH-01**: 登录体系（手机号+验证码等）
- **UX-02**: PWA 添加到主屏幕的引导与优化
- **REC-06**: 拍照留凭证（小票/合同）
- **REC-07**: 语音记账
- **STAT-02**: 分享卡片（"这个月装修花了 X"）
- **STAT-03**: CSV 导出

## Out of Scope

| Feature | Reason |
|---------|--------|
| 贷款/分期/税费计算 | 超出家庭记账场景 |
| 报销、发票管理 | 非家庭场景 |
| 复杂角色权限（管理员/成员分级） | 家庭共享账本不需要 |
| 社交、社区、广告 | 破坏简洁与隐私 |
| 微信小程序 | 用户选定 H5 + EdgeOne 部署 |
| 原生 App | 与 EdgeOne 部署方向不符 |

## Traceability

> 由路线图阶段填充（每个 v1 需求映射到唯一阶段）。

| Requirement | Phase | Status |
|-------------|-------|--------|
| REC-01 | — | Pending |
| REC-02 | — | Pending |
| REC-03 | — | Pending |
| REC-04 | — | Pending |
| REC-05 | — | Pending |
| SHAR-01 | — | Pending |
| SHAR-02 | — | Pending |
| SHAR-03 | — | Pending |
| STAT-01 | — | Pending |
| UX-01 | — | Pending |

**Coverage:**
- v1 requirements: 10 total
- Mapped to phases: 0（待路线图填充）
- Unmapped: 10 ⚠️

---
*Requirements defined: 2026-08-13*
*Last updated: 2026-08-13 after initial definition*
