---
slug: instructions
lang: zh-hant
title: "如何安裝這個主題？"
description: "一份快速指南，協助你為 Lume 設定 Simple Blog 主題。"
---

**Simple blog** 是一個為 Lume 準備的簡潔極簡部落格主題，支援標籤與作者。
你可以**在幾秒內**建立自己的部落格，並為讀者提供 Atom 與 JSON 訂閱來源。

設定這個主題**最快最簡單**的方法是使用
[Lume init 指令](https://deno.land/x/lume_init)， 你也可以直接從
[Simple Blog 主題頁面](https://lume.land/theme/simple-blog/)複製。 執行：

```bash
deno run -A https://lume.land/init.ts --theme=simple-blog
```

即可建立一個已設定好 Simple Blog 的新專案。接著編輯部落格根目錄下的 `_data.yml`
檔案，自訂站點標題、描述與中繼資料。

文章需要儲存在 `posts` 目錄中，例如： `posts/my-first-post.md`。

## 以遠端主題安裝

若要將這個主題接入既有的 Lume 專案，可在 `_config.ts`
中以遠端模組方式匯入。後續更新時，只要調整匯入 URL 裡的版本號：

```ts
import lume from "lume/mod.ts";
import blog from "https://deno.land/x/lume_theme_simple_blog@v0.15.6/mod.ts";

const site = lume();

site.use(blog());

export default site;
```

然後把
[`_data.yml`](https://github.com/lumeland/theme-simple-blog/blob/main/src/_data.yml)
複製到部落格根目錄，並填入你的資訊。

## 客製化

你也可以使用 [lumeCMS](https://lume.land/cms) 來客製部落格並更輕鬆地發佈內容。
