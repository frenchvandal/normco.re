---
slug: proin-facilisis
lang: zh-hans
title: "Proin Facilisis：让事情更轻松"
description: "关于降低摩擦的哲学：在代码、设计和日常生活中。"
---

_Proin facilisis_ 在拉丁语里可以理解为“促进顺畅”。它曾出现在古老植物学文本中，
形容一种能帮助消化、疏通阻滞的植物。作为软件设计哲学，这个词意外地贴切。

好的软件会降低摩擦。它会提前预判用户的下一步，在恰当时机给出恰当的可供性，
然后退到背景里。

## 先做“摩擦清单”

Proin in tellus sit amet nibh dignissim sagittis. 减少摩擦的第一步是把它画出来：
用户在哪些环节会放慢？注意力在哪些节点会飙升？错误会集中出现在哪里？

在典型 Web
应用里，高摩擦时刻通常很稳定：注册引导、表单提交、错误恢复、加载状态。
这些就是产品的“门厅”，是用户为了抵达价值必须跨过的门槛。

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

## “简单”本身的悖论

Vivamus pretium aliquet erat. “让事情变简单”最困难的地方在于：它真的很难。
你需要深入理解用户、场景和失败模式。也就是说，构建者要多做工作，用户才能少费力。

这也是为什么“简单”是一种慷慨。每移除一个不必要步骤，都是把时间还给用户，
让他们去做真正重要的事。

## 如何把 facilisis 落地

Donec aliquet metus ut erat semper, et tincidunt nulla luctus.
我经常回到这些原则：

- 默认值应覆盖多数人多数场景。
- 错误信息应说明问题，也说明修复路径。
- 主流程不应要求额外思考。
- 配置应当可选，而不是前置门槛。
- 文档是产品的一部分，而不是附录。

Nulla facilisi. Phasellus blandit leo ut odio. Nam sed nulla non diam tincidunt
tempus. 这个原则的名字本身也提醒我们： _nulla
facilisi_，没有真正“天然简单”的事。好的简单，从来都不是偶然。
