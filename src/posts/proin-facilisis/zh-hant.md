---
lang: zh-hant
title: "Proin Facilisis：讓事情更輕鬆"
description: "關於降低摩擦的哲學：在程式碼、設計與日常生活中。"
---

_Proin facilisis_ 在拉丁語裡可理解為「促進順暢」。它曾出現在古老植物學文本中，
形容一種能幫助消化、疏通阻滯的植物。作為軟體設計哲學，這個詞意外地貼切。

好的軟體會降低摩擦。它會提前預判使用者的下一步，在恰當時機給出恰當的可供性，
然後退到背景裡。

## 先做「摩擦清單」

Proin in tellus sit amet nibh dignissim sagittis. 減少摩擦的第一步是把它畫出來：
使用者在哪些環節會放慢？注意力在哪些節點會飆升？錯誤會集中出現在哪裡？

在典型 Web
應用中，高摩擦時刻通常很穩定：註冊引導、表單提交、錯誤復原、載入狀態。
這些就是產品的「門廳」，是使用者為了抵達價值必須跨過的門檻。

```ts
// Friction shows up in code too.
// Compare these two approaches to handling a missing value:

// High friction — the caller must always check:
function getUser(id: string): User | undefined {/* … */}

// Lower friction — the error is explicit and handled at the boundary:
function getUser(id: string): User {
  const user = db.find(id);
  if (user === undefined) {
    throw new Error(`User not found: ${id}`);
  }
  return user;
}
```

## 「簡單」本身的悖論

Vivamus pretium aliquet erat. 「讓事情變簡單」最困難的地方在於：它真的很難。
你需要深入理解使用者、情境與失敗模式。也就是說，建構者要多做工作，使用者才能少費力。

這也是為什麼「簡單」是一種慷慨。每移除一個不必要步驟，都是把時間還給使用者，
讓他們去做真正重要的事。

## 如何把 facilisis 落地

Donec aliquet metus ut erat semper, et tincidunt nulla luctus.
我經常回到這些原則：

- 預設值應覆蓋多數人與多數情境。
- 錯誤訊息應說明問題，也說明修復路徑。
- 主流程不應要求額外思考。
- 設定應當可選，而不是前置門檻。
- 文件是產品的一部分，而不是附錄。

Nulla facilisi. Phasellus blandit leo ut odio. Nam sed nulla non diam tincidunt
tempus. 這個原則的名稱本身也提醒我們：_nulla
facilisi_，沒有真正「天然簡單」的事。好的簡單，從來都不是偶然。
