---
slug: alibaba-cloud-oss-cdn-deployment
lang: zh-hant
title: "這個部落格如何部署到阿里雲 OSS 與 CDN"
description: "一份實作導向說明：我的 GitHub Actions 流水線如何完成 Lume 建置、OIDC 角色臨時授權、OSS 同步、CDN 刷新與預熱，以及自動清理。"
---

這個站點使用 Lume 建置，並部署到阿里雲 OSS，再由阿里雲 CDN 對外分發。
整條部署流水線刻意保持精簡：一個 GitHub Workflow、一個建置步驟，再加上一個自訂
Action：
[`frenchvandal/aliyun-oss-cdn-sync-action`](https://github.com/frenchvandal/aliyun-oss-cdn-sync-action)。

我希望同時滿足四件事：短時憑證、可預測上傳、與檔案型別相匹配的快取標頭，以及自動
的快取一致性。這套配置同時做到四者，而且不需要在每個倉庫裡額外維護部署腳本。

## 流水線總覽

從長期生產配置來看，這個倉庫中的 GitHub Workflow 做四件事：

1. 檢出倉庫程式碼。
2. 依 `.tool-versions` 安裝固定版本的 Deno。
3. 執行 `deno task build`，將站點建置到 `_site`。
4. 呼叫 OSS/CDN 同步 Action，完成上傳、刷新、預熱與清理。

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

在這個 Action 裡，只要啟用了 CDN，refresh 就一定會執行。preload 是可選項，可以
關閉，但它只在作為 refresh 的補充時才有意義。

## 為什麼選 OIDC，而不是長期 Access Key

這個 Action 在執行時透過 GitHub OIDC 去扮演阿里雲 RAM 角色。倉庫中不保存長期
Access Key。Workflow 只需要 `id-token: write`，再加上 RAM 角色與 OIDC Provider
的 ARN。

目前的配置還傳入了 `audience: ${{ github.repository_id }}`。GitHub 可以為自訂
audience 簽發 ID token，而阿里雲 RAM 可以把這個 `aud` 值與 OIDC 身分提供者裡配置
的 Client ID，以及角色信任策略中的條件進行校驗。這比單純依賴預設 audience
更收斂。

## Action 內部如何執行

這個 Action 被拆成三個階段：

- **pre**：透過 OIDC 扮演 RAM 角色，並把臨時憑證寫入 action state。
- **main**：上傳本地檔案到 OSS，寫入快取標頭，並先執行 CDN refresh，再按需執行
  preload。
- **post**：比較目標前綴下的遠端物件與本地檔案，刪除遠端孤兒物件，在需要時刷新已
  刪除 URL 的 CDN 快取，並查詢 `main` 階段提交的 CDN 任務狀態。

清理階段透過 `post-if: always()` 執行，所以即使前面步驟失敗也會執行。清理與 CDN
呼叫都被設計成「非致命」：會記錄警告，但不會因 CDN API 的短暫波動阻塞部署。

## 上傳、快取、配額與漂移控制

以下實作細節對可靠性非常關鍵：

- 上傳透過 `max-concurrency` 平行化。
- 全域 API 限速由 `api-rps-limit` 控制。
- 每個檔案上傳失敗後最多重試三次。
- 上傳階段現在會自動寫入 `Cache-Control`：HTML 與 `sw.js` 會被更積極地重新驗證，
  帶雜湊的資源會以 immutable 方式處理，常見靜態資源也會拿到更短的重新驗證窗口，
  而不是一刀切的統一策略。
- Action 會在提交 refresh 或 preload 批次前檢查剩餘 CDN 配額。
- refresh 會先於 preload 執行，而 preload 也可以在保留 CDN refresh 的情況下單獨
  關閉。
- 刪除 OSS 物件時可觸發對應 URL 的 CDN 刷新，減少過期快取窗口，也能抑制物件隨
  時間漂移。

最後一點很容易被低估：長期運行的靜態站點僅靠上傳遠遠不夠。你還需要刪除機制，以及
對不應再存在物件的快取失效處理。

## 最小化 RAM 權限

權限上，這個角色需要目標 bucket 範圍內的 OSS 權限，用於列舉、上傳與刪除物件。 在
CDN 一側，則需要 refresh/preload 權限，以及用於查詢配額與任務狀態的唯讀 API
權限。此外，Trust Policy 必須允許 GitHub OIDC Provider 扮演部署角色。

我把它獨立作為「部署角色」維護，不與更寬泛的營運權限混用。

## 在其他倉庫重用這個 Action

這個 Action 已發布，可直接重用：
[github.com/frenchvandal/aliyun-oss-cdn-sync-action](https://github.com/frenchvandal/aliyun-oss-cdn-sync-action)。

這個倉庫目前追蹤 `@master`，因為站點和 Action 是一起維護、一起驗證的。放到獨立
倉庫時，我通常會固定到 `@v1`，或者更進一步固定到完整的 commit SHA。

對我來說，最關鍵的結果還是一樣：部署維持「無聊」。build、sync、refresh、preload、
cleanup，完成。
