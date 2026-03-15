---
slug: lorem-ipsum
lang: zh-hant
title: "Lorem Ipsum 與占位文字的藝術"
description: "關於占位文字的歷史、價值，以及它為何仍在現代設計流程中有效。"
---

Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor
incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis
nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.

很多人都聽過這段文字，卻很少知道它的來源。它其實來自西塞羅 _de Finibus Bonorum
et Malorum_ 的一段打亂文本，這部哲學著作寫於西元前 45 年。 自 16
世紀起，它就被當作排版占位文字使用：一位不知名的印刷工把活字順序打亂，
做出了一本字體樣張。

## 為什麼占位文字仍然重要

Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu
fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in
culpa qui officia deserunt mollit anim id est laborum.

當你用真實文案設計版面時，你其實是在為那一批具體句子做設計。
占位文字迫使你先為結構而不是語義做決定。這是一種很有價值的約束：
它能暴露設計是否能承受不確定性，例如三行標題、沒有自然換氣點的段落，
或是一個超出容器長度的長單字。

## 關於「擬真度」的問題

Ut enim ad minima veniam, quis nostrum exercitationem ullam corporis suscipit
laboriosam? 在設計中，真實內容的還原度與抽象帶來的自由之間，總是存在張力。

高保真原型需要先有真實內容。低保真線框圖則在不被語義分散注意力的前提下傳達結構。
兩種方法都合理，關鍵是判斷當下該用哪一種工具。

```ts
// A small utility to generate repeating text blocks.
function lorem(words: number): string {
  const base = "lorem ipsum dolor sit amet consectetur adipiscing elit";
  const tokens = base.split(" ");
  const result: string[] = [];
  for (let i = 0; i < words; i++) {
    result.push(tokens[i % tokens.length] ?? "");
  }
  return result.join(" ");
}
```

Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed
quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt.

## 結語

Lorem ipsum 不只是填充物。它像一面鏡子，照出設計在剝離語義後留下的純結構：
有形式、無內容。也正因如此，它才能跨越這麼多時代持續存在。
