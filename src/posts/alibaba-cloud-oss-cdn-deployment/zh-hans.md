---
slug: alibaba-cloud-oss-cdn-deployment
lang: zh-hans
title: "这个博客如何部署到阿里云 OSS 与 CDN"
description: "一份实践向说明：我的 GitHub Actions 流水线如何完成 Lume 构建、OIDC 角色临时授权、OSS 同步、CDN 刷新与预热，以及自动清理。"
---

这个站点使用 Lume 构建，并部署到阿里云 OSS，再由阿里云 CDN 对外分发。
整条部署流水线刻意保持简洁：一个 GitHub Workflow、一个构建步骤，再加一个自定义
Action：
[`frenchvandal/aliyun-oss-cdn-sync-action`](https://github.com/frenchvandal/aliyun-oss-cdn-sync-action)。

我希望同时满足四件事：短时凭证、可预测上传、与文件类型相匹配的缓存头，以及自动的
缓存一致性。这套配置同时做到四者，而且不需要在每个仓库里额外维护部署脚本。

## 流水线总览

从长期生产配置来看，这个仓库里的 GitHub Workflow 做四件事：

1. 检出仓库代码。
2. 按 `.tool-versions` 安装固定版本的 Deno。
3. 执行 `deno task build`，将站点构建到 `_site`。
4. 调用 OSS/CDN 同步 Action，完成上传、刷新、预热和清理。

```yaml
name: Deploy static content to OSS

on:
  push:
    branches: ["master"]
  workflow_dispatch:

permissions:
  contents: read
  id-token: write

concurrency:
  group: "oss-deploy"
  cancel-in-progress: true

jobs:
  deploy:
    environment:
      name: development
    runs-on: macos-26
    steps:
      - name: Checkout
        uses: actions/checkout@v6
        with:
          fetch-depth: 0
      - name: Setup Deno environment
        uses: denoland/setup-deno@v2
        with:
          deno-version-file: .tool-versions
      - name: Run build task
        run: deno task build
      - name: Deploy to Alibaba Cloud OSS
        uses: frenchvandal/aliyun-oss-cdn-sync-action@master
        with:
          role-oidc-arn: ${{ secrets.ALIBABA_CLOUD_ROLE_ARN }}
          oidc-provider-arn: ${{ secrets.ALIBABA_CLOUD_OIDC_PROVIDER_ARN }}
          role-session-name: ${{ github.run_id }}
          role-session-expiration: 3600
          input-dir: _site
          bucket: ${{ secrets.OSS_BUCKET }}
          region: ${{ secrets.OSS_REGION }}
          audience: ${{ github.repository_id }}
          cdn-enabled: true
          cdn-base-url: ${{ secrets.OSS_CDN_BASE_URL }}
          cdn-actions: refresh,preload
```

在这个 Action 里，只要启用了 CDN，refresh 就一定会执行。preload 是可选项，可以
关闭，但它只在作为 refresh 的补充时才有意义。

## 为什么选 OIDC，而不是长期 Access Key

这个 Action 在运行时通过 GitHub OIDC 去扮演阿里云 RAM 角色。仓库中不保存长期
Access Key。Workflow 只需要 `id-token: write`，再加上 RAM 角色和 OIDC Provider
的 ARN。

当前配置还传入了 `audience: ${{ github.repository_id }}`。GitHub 可以为自定义
audience 签发 ID token，而阿里云 RAM 可以把这个 `aud` 值与 OIDC 身份提供商里配置
的 Client ID，以及角色信任策略中的条件进行校验。这样比单纯依赖默认 audience
更收敛。

## Action 内部是怎么执行的

这个 Action 被拆成三个阶段：

- **pre**：通过 OIDC 扮演 RAM 角色，并把临时凭证写入 action state。
- **main**：上传本地文件到 OSS，写入缓存头，并先执行 CDN refresh，再按需执行
  preload。
- **post**：比较目标前缀下的远端对象与本地文件，删除远端孤儿对象，在需要时刷新被
  删除 URL 的 CDN 缓存，并查询 `main` 阶段提交的 CDN 任务状态。

清理阶段通过 `post-if: always()` 执行，所以即使前面步骤失败也会运行。清理和 CDN
调用都被设计为“非致命”：会记录警告，但不会因为 CDN API 的短暂抖动而阻塞部署。

## 上传、缓存、配额与漂移控制

下面这些实现细节对可靠性非常关键：

- 上传通过 `max-concurrency` 并行化。
- 全局 API 限速通过 `api-rps-limit` 控制。
- 每个文件上传失败后最多重试三次。
- 上传阶段现在会自动写入 `Cache-Control`：HTML 与 `sw.js` 会被更积极地重新验证，
  带哈希的资源按 immutable 处理，常见静态资源也会拿到更短的重新验证窗口，而不是
  一刀切的统一策略。
- Action 会在提交 refresh 或 preload 批次前检查剩余 CDN 配额。
- refresh 会先于 preload 执行，而 preload 也可以在保留 CDN refresh 的情况下单独
  关闭。
- 删除 OSS 对象时可触发对应 URL 的 CDN 刷新，减少旧缓存窗口，也能抑制对象随时间
  漂移。

最后一点很容易被低估：长期运行的静态站点仅有上传远远不够。你还需要删除机制，以及
对不该再存在对象的缓存失效处理。

## 最小化 RAM 权限

权限上，这个角色需要目标 bucket 范围内的 OSS 权限，用于列举、上传和删除对象。 在
CDN 一侧，则需要 refresh/preload 权限，以及用于查询配额和任务状态的只读 API
权限。此外，Trust Policy 必须允许 GitHub OIDC Provider 扮演部署角色。

我把它单独作为“部署角色”维护，不与更宽泛的运营权限混用。

## 在其他仓库复用这个 Action

这个 Action 已发布，可直接复用：
[github.com/frenchvandal/aliyun-oss-cdn-sync-action](https://github.com/frenchvandal/aliyun-oss-cdn-sync-action)。

这个仓库目前跟踪 `@master`，因为站点和 Action
是一起维护、一起验证的。放到独立仓库 里时，我通常会固定到
`@v1`，或者更进一步固定到完整的 commit SHA。

对我来说，最关键的结果还是一样：部署保持“无聊”。build、sync、refresh、preload、
cleanup，结束。
