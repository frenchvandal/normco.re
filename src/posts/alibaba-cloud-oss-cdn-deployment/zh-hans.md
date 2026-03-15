---
slug: alibaba-cloud-oss-cdn-deployment
lang: zh-hans
title: "这个博客如何部署到阿里云 OSS 与 CDN"
description: "一份实践向说明：我的 GitHub Actions 流水线如何完成 Lume 构建、OIDC 角色临时授权、OSS 同步、CDN 刷新与预热，以及自动清理。"
---

这个站点使用 Lume 构建，并部署到阿里云 OSS，再由阿里云 CDN 对外分发。
整条部署流水线刻意保持简洁：一个 GitHub Workflow、一个构建步骤、 再加一个自定义
Action：
[`frenchvandal/aliyun-oss-cdn-sync-action`](https://github.com/frenchvandal/aliyun-oss-cdn-sync-action)。

我希望同时满足三件事：短时凭证、可预测上传、自动缓存一致性。
这套配置同时做到三者，而且不需要在每个仓库里额外维护脚本。

## 流水线总览

这个仓库里的 GitHub Workflow 做了四件事：

1. 检出仓库代码。
2. 按 `.tool-versions` 安装固定版本的 Deno。
3. 执行 `deno task build`，将站点构建到 `_site`。
4. 调用 OSS/CDN 同步 Action，完成上传与缓存刷新。

```yaml
name: Deploy static content to OSS

on:
  push:
    branches: ["master"]
  workflow_dispatch:

permissions:
  contents: read
  id-token: write

jobs:
  deploy:
    runs-on: macos-26
    steps:
      - uses: actions/checkout@v6
      - uses: denoland/setup-deno@v2
        with:
          deno-version-file: .tool-versions
      - run: deno task build
      - uses: frenchvandal/aliyun-oss-cdn-sync-action@v1
        with:
          role-oidc-arn: ${{ secrets.ALIBABA_CLOUD_ROLE_ARN }}
          oidc-provider-arn: ${{ secrets.ALIBABA_CLOUD_OIDC_PROVIDER_ARN }}
          role-session-name: ${{ github.run_id }}
          role-session-expiration: 3600
          input-dir: _site
          bucket: ${{ secrets.OSS_BUCKET }}
          region: ${{ secrets.OSS_REGION }}
          cdn-enabled: true
          cdn-base-url: ${{ secrets.OSS_CDN_BASE_URL }}
          cdn-actions: refresh,preload
```

## 为什么选 OIDC，而不是长期 Access Key

这个 Action 在运行时通过 GitHub OIDC 去扮演阿里云 RAM 角色。 仓库中不保存长期
Access Key。Workflow 只需要 `id-token: write`，再加上角色和 OIDC Provider 的
ARN。

这意味着凭证是按需签发、受 RAM 策略约束、并且自然过期。
从运维风险角度看，这比长期把静态密钥放在 secrets 里要更稳健。

## Action 内部是怎么执行的

这个 Action 被拆成三个阶段：

- **pre**：通过 OIDC 扮演 RAM 角色，并把临时凭证写入 action state。
- **main**：上传本地文件到 OSS，并可选对上传路径执行 CDN 刷新/预热。
- **post**：比较目标前缀下的远端对象与本地文件，删除远端孤儿对象。

清理阶段通过 `post-if: always()` 执行，所以即使前面步骤失败也会运行。 清理和 CDN
调用都被设计为“非致命”：会记录警告，但不会因为 CDN API 的短暂抖动而阻塞部署。

## 上传、缓存与漂移控制

下面这些实现细节对可靠性非常关键：

- 上传通过 `max-concurrency` 并行化。
- 全局 API 限速通过 `api-rps-limit` 控制。
- 每个文件上传失败后最多重试三次。
- 开启 CDN 时，同一批部署里 refresh 可以先于 preload 执行。
- 删除 OSS 对象时可触发对应 URL 的 CDN 刷新，减少旧缓存窗口。

最后一条很容易被低估：长期运行的静态站点仅有上传远远不够。
你还需要删除机制，避免对象漂移和不该再存在的过期资源。

## 最小化 RAM 权限

权限上，这个 Action 需要目标 bucket 范围内的 OSS 权限（list、put、delete），
以及 CDN refresh/preload API 的调用权限。 此外，Trust Policy 必须允许 GitHub
OIDC Provider 扮演部署角色。

我把它单独作为“部署角色”维护，不与更宽泛的运营权限混用。

## 在其他仓库复用这个 Action

这个 Action 已发布，可直接复用：
[github.com/frenchvandal/aliyun-oss-cdn-sync-action](https://github.com/frenchvandal/aliyun-oss-cdn-sync-action)。
如果你的输出目录是静态的（例如 `dist` 或 `_site`）， 集成成本基本就是填配置。

对我来说，最关键的结果是：部署可以保持“无聊”。
build、sync、refresh、cleanup，结束。
