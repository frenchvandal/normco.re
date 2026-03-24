---
lang: zh-hans
title: "Lorem Ipsum 与占位文本的艺术"
description: "关于占位文本的历史、价值，以及它为何仍在现代设计流程中有效。"
---

Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor
incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis
nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.

很多人都听过这段文字，却很少知道它的来源。它其实来自西塞罗 _de Finibus Bonorum
et Malorum_ 的一段打乱文本，这部哲学著作写于公元前 45 年。自 16
世纪起，它就被作为排版占位文本使用：一位不知名的印刷工把活字顺序打乱，
做出了一本字体样张。

## 为什么占位文本仍然重要

Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu
fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in
culpa qui officia deserunt mollit anim id est laborum.

当你用真实文案设计版面时，你其实是在为那一批具体句子做设计。
占位文本迫使你先为结构而不是语义做决定。这是一种很有价值的约束：
它能暴露设计是否能承受不确定性，比如三行标题、没有自然换气点的段落，
或者一个超出容器长度的长单词。

## 关于“逼真度”的问题

Ut enim ad minima veniam, quis nostrum exercitationem ullam corporis suscipit
laboriosam? 在设计中，真实内容的还原度与抽象带来的自由之间，总是存在张力。

高保真原型需要先有真实内容。低保真线框图则在不被语义分散注意力的前提下传达结构。
两种方法都合理，关键是判断当下该用哪一种工具。

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

## 结语

Lorem ipsum 不只是填充物。它像一面镜子，照出设计在剥离语义后留下的纯结构：
有形式、无内容。也正因为如此，它才能跨越这么多时代继续存在。
