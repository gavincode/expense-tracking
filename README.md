# 装修账本（Renovation Ledger）

给家人用的装修开销记账应用：手机上快速记下每一笔装修支出，按装修阶段/空间分类，全家共享一个账本。

技术栈：Vue 3 + TypeScript + Vite + Vant 4 + Pinia + Dexie（本地优先），PWA，部署到腾讯 EdgeOne Pages。

## 本地运行

```bash
npm install
npm run dev
```

打开终端输出的本地地址（默认 http://localhost:5173），建议用手机浏览器访问查看移动端效果。

## 使用说明

1. 打开应用进入首页，点底部"记一笔"
2. 输入金额 → 点"分类"选择（两级：先选一级，再选具体项目）
3. 可按需修改日期（默认今天）与填写备注（如"定金"）
4. 点"保存"回到首页，记录出现在最近列表与"全部支出"中

## 测试与构建

```bash
npm test        # 运行单元测试（金额/数据层）
npm run build   # 类型检查 + 生产构建（输出到 dist/）
```

## 部署到 EdgeOne Pages

1. 将本仓库推送到 GitHub
2. 打开 [EdgeOne Pages 控制台](https://edgeone.cloud.tencent.com/pages)，连接你的 GitHub 仓库
3. 平台读取 `edgeone.json`（构建命令 `npm run build`，输出目录 `dist`）自动构建部署
4. 部署完成后用线上地址在手机上验证"记一笔 → 回首页看到记录"的完整路径

> 自定义域名面向中国大陆访问时，需要确认 ICP 备案情况。

## 数据说明

- 金额以整数"分"存储与计算，仅在展示时格式化为元（避免浮点误差）
- Phase 1 数据保存在浏览器本地（IndexedDB），多设备同步将在后续阶段加入
