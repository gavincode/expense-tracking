# Domain Pitfalls

**Domain:** 家庭共享装修记账 Web 应用（EdgeOne）
**Researched:** 2026-08-13

## Critical Pitfalls

### Pitfall 1: 金额浮点误差
**What goes wrong:** 用 JS number/double 存金额，累计统计出现 0.1+0.2 类误差。
**Why it happens:** 浮点数无法精确表示十进制小数。
**Consequences:** 预算对比、汇总金额错误，用户失去信任。
**Prevention:** 全链路整数"分"存储与计算，仅展示层格式化。
**Detection:** 总额与逐条相加不一致。

### Pitfall 2: 多设备并发写导致丢记录
**What goes wrong:** 两个家人同时记账，后写者覆盖先写者（尤其"整个账本存一个 KV 值"方案）。
**Why it happens:** 读-改-写同一个 key 无并发控制；EdgeOne KV 最终一致性最长 60 s。
**Consequences:** 一条真实支出丢失，家庭数据不可信。
**Prevention:** 按记录独立存储 + 服务端事务/版本校验；KV 不做账本主存储。
**Detection:** 设备间记录数不一致。

### Pitfall 3: Service Worker 缓存导致部署后白屏/旧版本
**What goes wrong:** 发新版后用户仍命中旧缓存，甚至更新中断产生白屏。
**Why it happens:** index.html 被长期缓存；SW 更新流程未处理。
**Consequences:** 线上事故，家人以为应用坏了。
**Prevention:** 资源带内容哈希；SW 版本提示 + 点击激活；不长期缓存 index.html；更新失败保留旧缓存兜底。
**Detection:** 线上 JS 错误率/白屏率监控、手动验证。

## Moderate Pitfalls

### Pitfall 1: 邀请链接滥用
**What goes wrong:** 邀请链接泄露后陌生人加入账本看到家庭开销。
**Prevention:** 邀请码一次性、带有效期、可撤销；加入需登录。

### Pitfall 2: 短信登录成本与风控
**What goes wrong:** 短信费用不可控、被刷（防盗刷）。
**Prevention:** 腾讯云短信 + 频率限制（同一手机号/设备限次）；验证码 5–10 分钟有效。

### Pitfall 3: iOS Safari 添加到主屏幕的怪癖
**What goes wrong:** iOS 无自动安装提示；`start_url` 被忽略；独立模式路由跳转出现 Safari 控件。
**Prevention:** 应用内放"添加到主屏幕"图文指引；测试从根路径安装；接受 iOS 行为差异。

### Pitfall 4: 安卓国内浏览器 PWA 支持参差
**What goes wrong:** 华为/小米等浏览器对 PWA 支持不一。
**Prevention:** 把应用当普通 H5 保证可用，PWA 作为增强；不依赖安装提示。

### Pitfall 5: 预算提醒疲劳
**What goes wrong:** 每次记账都弹"超支"，家人开始忽略。
**Prevention:** 阈值提醒（80%、100%），超支后只提示一次/可关闭。

### Pitfall 6: 家庭协作信任问题
**What goes wrong:** 家人发现支出被改/删，互相猜疑。
**Prevention:** 显示"谁记的/谁改的"；轻量操作日志。

## Minor Pitfalls

### Pitfall 1: 分类太复杂
**What goes wrong:** 自定义分类过多，记账变慢。
**Prevention:** 内置装修预设分类 + 最多两级结构。

### Pitfall 2: 补记时间错乱
**What goes wrong:** 隔几天补记，默认记成当天。
**Prevention:** 记一笔时日期可快速改（默认今天，一键改昨天/自定义）。

## Phase-Specific Warnings

| Phase Topic | Likely Pitfall | Mitigation |
|-------------|---------------|------------|
| 记账录入 | 输入摩擦 | 3 秒流程：金额 → 分类 → 保存；常用项一键选 |
| 预算 | 数据口径不清（定金 vs 尾款） | 备注字段引导；按实际支付记录 |
| 同步 | 离线写入丢失 | 本地队列 + 后台同步 + 失败重试 |
| 部署 | 缓存事故 | 内容哈希 + SW 更新策略（见 Critical 3） |
| 登录 | 家人记不住密码 | 手机号+验证码；邀请码加入免密码 |

## Sources

- EdgeOne Makers 限制与配额 / KV 文档（cloud.tencent.com）— HIGH
- 前端缓存事故复盘（腾讯云开发者社区）— MEDIUM
- iOS PWA 添加主屏幕问题（developer.apple.com forums、WebKit bugzilla）— MEDIUM
- 金额精度实践（腾讯云/阿里云开发者社区）— HIGH
- 本地优先同步与冲突解决实践（npm: local-first-sync-engine、react-offline-kit）— MEDIUM
