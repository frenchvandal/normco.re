---
lang: zh-hans
title: "这个博客如何部署到阿里云 OSS 与 CDN"
description: "一份实践向说明：我的 GitHub Actions 流水线如何完成带缓存的 Lume 构建、OIDC 角色临时授权、OSS 同步、CDN 刷新，以及自动清理。"
---

这个站点使用 Lume 构建，并部署到阿里云 OSS，再由阿里云 CDN 对外分发。整条部署
流水线刻意保持简洁：一个 GitHub Workflow、让 Deno 出现在 runner 上，再加一个
自定义 Action；它会恢复本地构建缓存、执行构建、同步 OSS 并完成清理：
[`frenchvandal/aliyun-oss-cdn-sync-action`](https://github.com/frenchvandal/aliyun-oss-cdn-sync-action)。

我现在希望同时满足五件事：短时凭证、在全新 runner 上也能热启动的构建、可预测
上传、与文件类型相匹配的缓存头，以及自动的缓存一致性。这套配置同时做到五者，
而且不需要在每个仓库里额外维护部署脚本。

## 流水线总览

从长期生产配置来看，这个仓库里的 GitHub Workflow 现在做三件事：

1. 检出仓库代码。
2. 按 `.tool-versions` 安装固定版本的 Deno，并启用 runner 侧工具缓存。
3. 调用 OSS/CDN 同步 Action；它会恢复 `_cache`、执行 `deno task build`、上传
   `_site`、刷新 CDN，并完成清理。

目前，这一步构建还会为共享样式和按路由拆分的关键 CSS 生成指纹，移除 source
map，并在同步 `_site` 之前删除最终 HTML 未引用的可选 Pagefind 文件。

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
          cache: true

      - name: Deploy to Alibaba Cloud OSS
        uses: frenchvandal/aliyun-oss-cdn-sync-action@master
        with:
          role-oidc-arn: ${{ secrets.ALIBABA_CLOUD_ROLE_ARN }}
          oidc-provider-arn: ${{ secrets.ALIBABA_CLOUD_OIDC_PROVIDER_ARN }}
          role-session-name: ${{ github.run_id }}
          role-session-expiration: 3600
          cache-enabled: true
          cache-key: >-
            lume-cache-${{ runner.os }}-${{ runner.arch }}-${{ hashFiles('deno.lock') }}-${{ hashFiles('_cache/**/*') || 'empty' }}
          cache-restore-keys: |
            lume-cache-${{ runner.os }}-${{ runner.arch }}-${{ hashFiles('deno.lock') }}-
            lume-cache-${{ runner.os }}-${{ runner.arch }}-
          input-dir: _site
          bucket: ${{ secrets.OSS_BUCKET }}
          region: ${{ secrets.OSS_REGION }}
          audience: ${{ github.repository_id }}
          cdn-enabled: true
          cdn-base-url: ${{ secrets.OSS_CDN_BASE_URL }}
          cdn-actions: refresh
          build-command: deno task build
```

在这个仓库里，我现在只保留 `cdn-actions: refresh`。Action 仍支持
`refresh,preload`，只是这个站点当前不再为每次部署开启 preload。

## 为什么选 OIDC，而不是长期 Access Key

这个 Action 在运行时通过 GitHub OIDC 去扮演阿里云 RAM 角色。仓库中不保存长期
Access Key。Workflow 只需要 `id-token: write`，再加上 RAM 角色和 OIDC Provider
的 ARN。

现在认证路径也只走 OIDC。如果角色扮演失败，Action 不会再从输入或环境变量回退到
静态 Access Key。

当前配置还传入了 `audience: ${{ github.repository_id }}`。GitHub 可以为自定义
audience 签发 ID token，而阿里云 RAM 可以把这个 `aud` 值与 OIDC 身份提供商里配置
的 Client ID，以及角色信任策略中的条件进行校验。这样比单纯依赖默认 audience
更收敛。

## Action 内部是怎么执行的

这个 Action 被拆成三个阶段：

- **pre**：通过 OIDC 扮演 RAM 角色，并把临时凭证写入 action state。
- **main**：按需恢复本地 `_cache` 目录，执行 `build-command`，上传本地文件到
  OSS，写入缓存头，并在启用时执行 CDN 动作。
- **post**：比较目标前缀下的远端对象与本地文件，删除远端孤儿对象，在需要时刷新被
  删除 URL 的 CDN 缓存，写入 CDN 任务摘要，并在配置了 `cache-key` 时保存
  `_cache`。

清理阶段通过 `post-if: always()` 执行，所以即使前面步骤失败也会运行。清理和 CDN
调用，以及缓存恢复或保存，都被设计为"非致命"：会记录警告，但不会因为 CDN API
或缓存服务的短暂抖动而阻塞部署。

## 上传、缓存、配额与漂移控制

下面这些实现细节对可靠性非常关键：

- `build-command` 在 Action 内部执行，而且发生在 OSS 上传或 CDN 调用之前。
- 如果 `cache-enabled` 为 `true` 且配置了 `cache-key`，那么会先恢复 `_cache`，
  build 结束后还可以在 `post` 阶段保存一份新的快照。
- `cache-enabled` 只控制恢复路径，所以我可以临时关闭 warm cache，同时保留
  post-step 的缓存保存。
- 上传通过 `max-concurrency` 并行化。
- 全局 API 限速通过 `api-rps-limit` 控制。
- 每个文件上传失败后最多重试三次。
- 部分上传失败会通过 `failed-count` 和 GitHub Actions job summary 暴露出来，
  而不是埋在日志里。
- 上传阶段现在会自动写入 `Cache-Control`：HTML 与 `sw.js` 会被更积极地重新验证，
  带哈希的资源按 immutable 处理，常见静态资源也会拿到更短的重新验证窗口，而不是
  一刀切的统一策略。
- `cdn-actions` 只接受 `refresh` 或 `refresh,preload`；如果 CDN
  已启用而这个值为空或无效，Action 会回退到 `refresh`。
- Action 会在提交 refresh 或 preload 批次前检查剩余 CDN 配额。
- 删除 OSS 对象时可触发对应 URL 的 CDN 刷新，减少旧缓存窗口，也能抑制对象随时间
  漂移。
- Action 还会为部署、清理和 CDN 任务状态写入 GitHub Actions job summary。

最后一点很容易被低估：长期运行的静态站点仅有上传远远不够。你还需要删除机制，以及
对不该再存在对象的缓存失效处理。

## 最小化 RAM 权限

权限上，这个角色需要目标 bucket 范围内的 OSS 权限，用于列举、上传和删除对象。
CDN 一侧，这个 workflow 需要 refresh 权限，以及用于查询配额和任务状态的只读 API
权限。如果启用 preload，再补上对应权限即可。此外，Trust Policy 必须允许 GitHub
OIDC Provider 扮演部署角色。

我把它单独作为"部署角色"维护，不与更宽泛的运营权限混用。

## 在其他仓库复用这个 Action

这个 Action 已发布，可直接复用：
[github.com/frenchvandal/aliyun-oss-cdn-sync-action](https://github.com/frenchvandal/aliyun-oss-cdn-sync-action)。

这个仓库目前跟踪 `@master`，因为站点和 Action 是一起维护、一起验证的。放到独立
仓库里时，我通常会固定到 `@v1`，或者更进一步固定到完整的 commit SHA。我现在也把
build 和 `_cache` 生命周期交给 Action 自己管理，这让消费端 workflow 更短，也更偏
声明式。

对我来说，最关键的结果还是一样：部署保持"无聊"。恢复缓存、build、sync、
refresh、cleanup，结束。
