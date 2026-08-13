# Phase 3 User Setup: EdgeOne Blob 存储

> 后端"文件数据库"需要你在 EdgeOne 控制台创建 Blob 存储并绑定到 Pages Functions。

## 目标

创建 Blob 存储（账本文件持久化），并让 `functions/api/*` 能访问它。

## 操作步骤

1. 打开 [EdgeOne Pages 控制台](https://edgeone.cloud.tencent.com/pages)（或 EdgeOne Makers 控制台）
2. 进入你的项目 → **存储 / Storage** → **Blob**
3. 创建一个 Blob 存储，名称建议 `ledgers`（与代码默认读取的 `BLOB_STORE_NAME` 一致）
4. 在项目环境变量/绑定中设置 `BLOB_STORE_NAME=ledgers`（若存储名不同则改成实际名称）
5. 部署 `functions/` 目录下的 API（随仓库一起部署即自动生效）

## 验证

- 部署后浏览器打开 `https://<你的域名>/api/ledger`，GET 应返回 `{"error":"ledgerId required"}`（400）——说明函数已上线
- 应用内"创建账本"成功且同步按钮可用，说明 Blob 读写正常

## 状态

**Status:** Incomplete（等待用户执行）

> 免费版 Blob 总容量 1 GB，家庭账本数据量完全够用。
