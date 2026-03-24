---
lang: zh-hant
title: "這個部落格如何部署到阿里雲 OSS 與 CDN"
description: "一份實作導向說明：我的 GitHub Actions 流水線如何完成帶快取的 Lume 建置、OIDC 角色臨時授權、OSS 同步、CDN 刷新，以及自動清理。"
---

這個站點使用 Lume 建置，並部署到阿里雲 OSS，再由阿里雲 CDN 對外分發。整條部署
流水線刻意保持精簡：一個 GitHub Workflow、讓 Deno 出現在 runner 上，再加上一個
自訂 Action；它會還原本地建置快取、執行建置、同步 OSS 並完成清理：
[`frenchvandal/aliyun-oss-cdn-sync-action`](https://github.com/frenchvandal/aliyun-oss-cdn-sync-action)。

我現在希望同時滿足五件事：短時憑證、在全新 runner 上也能熱啟動的建置、可預測
上傳、與檔案型別相匹配的快取標頭，以及自動的快取一致性。這套配置同時做到五者，
而且不需要在每個倉庫裡額外維護部署腳本。

## 流水線總覽

從長期生產配置來看，這個倉庫中的 GitHub Workflow 現在做三件事：

1. 檢出倉庫程式碼。
2. 依 `.tool-versions` 安裝固定版本的 Deno，並啟用 runner 端工具快取。
3. 呼叫 OSS/CDN 同步 Action；它會還原 `_cache`、執行 `deno task build`、上傳
   `_site`、刷新 CDN，並完成清理。

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

在這個倉庫裡，我現在只保留 `cdn-actions: refresh`。Action 仍支援
`refresh,preload`，只是這個站點目前不再為每次部署啟用 preload。

## 為什麼選 OIDC，而不是長期 Access Key

這個 Action 在執行時透過 GitHub OIDC 去扮演阿里雲 RAM 角色。倉庫中不保存長期
Access Key。Workflow 只需要 `id-token: write`，再加上 RAM 角色與 OIDC Provider
的 ARN。

現在的認證路徑也只走 OIDC。如果角色扮演失敗，Action 不會再從輸入或環境變數回退到
靜態 Access Key。

目前的配置還傳入了 `audience: ${{ github.repository_id }}`。GitHub 可以為自訂
audience 簽發 ID token，而阿里雲 RAM 可以把這個 `aud` 值與 OIDC 身分提供者裡配置
的 Client ID，以及角色信任策略中的條件進行校驗。這比單純依賴預設 audience
更收斂。

## Action 內部如何執行

這個 Action 被拆成三個階段：

- **pre**：透過 OIDC 扮演 RAM 角色，並把臨時憑證寫入 action state。
- **main**：按需還原本地 `_cache` 目錄，執行 `build-command`，上傳本地檔案到
  OSS，寫入快取標頭，並在啟用時執行 CDN 動作。
- **post**：比較目標前綴下的遠端物件與本地檔案，刪除遠端孤兒物件，在需要時刷新已
  刪除 URL 的 CDN 快取，寫入 CDN 任務摘要，並在設定了 `cache-key` 時保存
  `_cache`。

清理階段透過 `post-if: always()` 執行，所以即使前面步驟失敗也會執行。清理與 CDN
呼叫，以及快取還原或保存，都被設計成「非致命」：會記錄警告，但不會因 CDN API
或快取服務的短暫波動阻塞部署。

## 上傳、快取、配額與漂移控制

以下實作細節對可靠性非常關鍵：

- `build-command` 在 Action 內部執行，而且發生在 OSS 上傳或 CDN 呼叫之前。
- 如果 `cache-enabled` 為 `true` 且設定了 `cache-key`，就會先還原 `_cache`，
  build 結束後也可以在 `post` 階段保存新的快照。
- `cache-enabled` 只控制還原路徑，所以我可以暫時關閉 warm cache，同時保留
  post-step 的快取保存。
- 上傳透過 `max-concurrency` 平行化。
- 全域 API 限速由 `api-rps-limit` 控制。
- 每個檔案上傳失敗後最多重試三次。
- 部分上傳失敗會透過 `failed-count` 和 GitHub Actions job summary 暴露出來，
  而不是埋在日誌裡。
- 上傳階段現在會自動寫入 `Cache-Control`：HTML 與 `sw.js` 會被更積極地重新驗證，
  帶雜湊的資源會以 immutable 方式處理，常見靜態資源也會拿到更短的重新驗證窗口，
  而不是一刀切的統一策略。
- `cdn-actions` 只接受 `refresh` 或 `refresh,preload`；如果 CDN
  已啟用而這個值為空或無效，Action 會回退到 `refresh`。
- Action 會在提交 refresh 或 preload 批次前檢查剩餘 CDN 配額。
- 刪除 OSS 物件時可觸發對應 URL 的 CDN 刷新，減少過期快取窗口，也能抑制物件隨
  時間漂移。
- Action 還會為部署、清理和 CDN 任務狀態寫入 GitHub Actions job summary。

最後一點很容易被低估：長期運行的靜態站點僅靠上傳遠遠不夠。你還需要刪除機制，以及
對不應再存在物件的快取失效處理。

## 最小化 RAM 權限

權限上，這個角色需要目標 bucket 範圍內的 OSS 權限，用於列舉、上傳與刪除物件。
CDN 一側，這個 workflow 需要 refresh 權限，以及用於查詢配額與任務狀態的唯讀 API
權限。如果啟用 preload，再補上對應權限即可。此外，Trust Policy 必須允許 GitHub
OIDC Provider 扮演部署角色。

我把它獨立作為「部署角色」維護，不與更寬泛的營運權限混用。

## 在其他倉庫重用這個 Action

這個 Action 已發布，可直接重用：
[github.com/frenchvandal/aliyun-oss-cdn-sync-action](https://github.com/frenchvandal/aliyun-oss-cdn-sync-action)。

這個倉庫目前追蹤 `@master`，因為站點和 Action 是一起維護、一起驗證的。放到獨立
倉庫時，我通常會固定到 `@v1`，或者更進一步固定到完整的 commit SHA。我現在也把
build 和 `_cache` 生命週期交給 Action 自己管理，讓消費端 workflow 更短，也更偏
向宣告式配置。

對我來說，最關鍵的結果還是一樣：部署維持「無聊」。還原快取、build、sync、
refresh、cleanup，完成。
