---
slug: alibaba-cloud-oss-cdn-deployment
lang: zh-hant
title: "這個部落格如何部署到阿里雲 OSS 與 CDN"
description: "一份實作導向說明：我的 GitHub Actions 流水線如何完成 Lume 建置、OIDC 角色臨時授權、OSS 同步、CDN 刷新與預熱，以及自動清理。"
---

這個站點使用 Lume 建置，並部署到阿里雲 OSS，再由阿里雲 CDN 對外分發。
整條部署流水線刻意保持精簡：一個 GitHub Workflow、一個建置步驟， 再加上一個自訂
Action：
[`frenchvandal/aliyun-oss-cdn-sync-action`](https://github.com/frenchvandal/aliyun-oss-cdn-sync-action)。

我希望同時滿足三件事：短時憑證、可預測上傳、自動快取一致性。
這套配置同時做到三者，而且不需要在每個倉庫裡額外維護腳本。

## 流水線總覽

這個倉庫中的 GitHub Workflow 做了四件事：

1. 檢出倉庫程式碼。
2. 依 `.tool-versions` 安裝固定版本的 Deno。
3. 執行 `deno task build`，將站點建置到 `_site`。
4. 呼叫 OSS/CDN 同步 Action，完成上傳與快取刷新。

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

## 為什麼選 OIDC，而不是長期 Access Key

這個 Action 在執行時透過 GitHub OIDC 去扮演阿里雲 RAM 角色。 倉庫中不保存長期
Access Key。Workflow 只需要 `id-token: write`，再加上角色與 OIDC Provider 的
ARN。

這代表憑證是按需簽發、受 RAM 策略限制、並且自然過期。
從維運風險角度來看，這比長期把靜態金鑰放在 secrets 裡更穩健。

## Action 內部如何執行

這個 Action 被拆成三個階段：

- **pre**：透過 OIDC 扮演 RAM 角色，並把臨時憑證寫入 action state。
- **main**：上傳本地檔案到 OSS，並可選對上傳路徑執行 CDN 刷新/預熱。
- **post**：比較目標前綴下的遠端物件與本地檔案，刪除遠端孤兒物件。

清理階段透過 `post-if: always()` 執行，所以即使前面步驟失敗也會執行。 清理與 CDN
呼叫都被設計成「非致命」：會記錄警告，但不會因 CDN API 的短暫波動阻塞部署。

## 上傳、快取與漂移控制

以下實作細節對可靠性非常關鍵：

- 上傳透過 `max-concurrency` 平行化。
- 全域 API 限速由 `api-rps-limit` 控制。
- 每個檔案上傳失敗後最多重試三次。
- 啟用 CDN 時，同一批部署裡 refresh 可以先於 preload 執行。
- 刪除 OSS 物件時可觸發對應 URL 的 CDN 刷新，降低過期快取窗口。

最後一點很容易被低估：長期運行的靜態站點僅靠上傳遠遠不夠。
你還需要刪除機制，避免物件漂移與不應再存在的過期資源。

## 最小化 RAM 權限

權限上，這個 Action 需要目標 bucket 範圍內的 OSS 權限（list、put、delete），
以及 CDN refresh/preload API 的呼叫權限。 此外，Trust Policy 必須允許 GitHub
OIDC Provider 扮演部署角色。

我把它獨立作為「部署角色」維護，不與更寬泛的營運權限混用。

## 在其他倉庫重用這個 Action

這個 Action 已發布，可直接重用：
[github.com/frenchvandal/aliyun-oss-cdn-sync-action](https://github.com/frenchvandal/aliyun-oss-cdn-sync-action)。
如果你的輸出目錄是靜態的（例如 `dist` 或 `_site`）， 整合成本基本就是填設定。

對我來說，最關鍵的結果是：部署可以維持「無聊」。
build、sync、refresh、cleanup，完成。
