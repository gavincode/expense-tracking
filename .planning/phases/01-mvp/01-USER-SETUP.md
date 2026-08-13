# Phase 1 User Setup: EdgeOne Pages 部署

> 部署验证步骤需要用户手动完成（EdgeOne 控制台操作）。

## 目标

将本应用部署到腾讯 EdgeOne Pages，并用线上地址验证"记一笔 → 回首页看到记录"。

## 前置条件

- [ ] 代码已推送到 GitHub（`git push -u origin main`）
- [ ] 拥有腾讯云账号并已开通 EdgeOne Pages（免费版即可）

## 操作步骤

1. 打开 [EdgeOne Pages 控制台](https://edgeone.cloud.tencent.com/pages)
2. 选择"连接 Git 仓库"，授权 GitHub 并选择 `gavincode/expense-tracking`
3. 平台读取 `edgeone.json`（`npm run build` / 输出目录 `dist`），点击部署
4. 等待构建完成，记录线上访问地址

## 验证命令（部署后）

- 手机浏览器打开线上地址
- 首页 → 记一笔 → 输入金额 → 选分类 → 保存 → 回首页看到新记录
- 刷新后记录仍在（本地 IndexedDB 持久化）

## 状态

**Status:** Incomplete（等待用户执行）

> 自定义域名面向中国大陆访问时，需要确认 ICP 备案情况。
