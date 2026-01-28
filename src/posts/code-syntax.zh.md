---
title: 代码语法高亮展示
description: 使用 Prism.js 展示多种编程语言的代码语法高亮效果。
date: 2026-01-25
author: phiphi
tags:
  - Markdown
  - Code
  - Syntax
id: code-syntax
lang: zh-CN
---

本文演示了如何使用 Prism.js 对代码块进行语法高亮渲染。

<!--more-->

## 行内代码

使用反引号来标记`行内代码`，例如变量名或简短的命令。

## 代码块

### JavaScript

```javascript
// 斐波那契数列生成器
function* fibonacci() {
  let [prev, curr] = [0, 1];
  while (true) {
    yield curr;
    [prev, curr] = [curr, prev + curr];
  }
}

const fib = fibonacci();
console.log([...Array(10)].map(() => fib.next().value));
// 输出 : [1, 1, 2, 3, 5, 8, 13, 21, 34, 55]
```

### TypeScript

```typescript
interface Utilisateur {
  id: number;
  nom: string;
  email: string;
  dateCreation: Date;
}

async function recupererUtilisateur(id: number): Promise<Utilisateur> {
  const reponse = await fetch(`/api/utilisateurs/${id}`);
  if (!reponse.ok) {
    throw new Error(`获取失败 : ${reponse.status}`);
  }
  return reponse.json();
}
```

### Python

```python
from dataclasses import dataclass
from typing import Optional

@dataclass
class Article:
    titre: str
    contenu: str
    auteur: str
    publie: bool = False
    vues: int = 0

    def publier(self) -> None:
        self.publie = True
        print(f"已发布 : {self.titre}")

article = Article(
    titre="你好，世界",
    contenu="这是我的第一篇文章。",
    auteur="phiphi"
)
article.publier()
```

### Go

```go
package main

import (
    "fmt"
    "sync"
)

func main() {
    var wg sync.WaitGroup
    messages := make(chan string, 3)

    for i := 1; i <= 3; i++ {
        wg.Add(1)
        go func(id int) {
            defer wg.Done()
            messages <- fmt.Sprintf("来自 goroutine %d 的问候", id)
        }(i)
    }

    go func() {
        wg.Wait()
        close(messages)
    }()

    for msg := range messages {
        fmt.Println(msg)
    }
}
```

### Rust

```rust
use std::collections::HashMap;

fn main() {
    let mut scores: HashMap<&str, i32> = HashMap::new();

    scores.insert("蓝队", 10);
    scores.insert("黄队", 50);

    for (equipe, score) in &scores {
        println!("{equipe}: {score}");
    }

    // 更新分数
    scores.entry("蓝队").and_modify(|s| *s += 10);
    println!("蓝队得分 : {}", scores["蓝队"]);
}
```

### HTML

```html
<!DOCTYPE html>
<html lang="zh-CN">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>你好，世界</title>
  </head>
  <body>
    <header>
      <h1>欢迎</h1>
      <nav>
        <a href="/">首页</a>
        <a href="/about">关于</a>
      </nav>
    </header>
    <main>
      <p>你好，世界！</p>
    </main>
  </body>
</html>
```

### CSS

```css
:root {
  --primary-color: hsl(220, 70%, 50%);
  --background-color: hsl(0, 0%, 100%);
  --spacing-md: 1rem;
}

.card {
  background: var(--background-color);
  border-radius: 8px;
  padding: var(--spacing-md);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s ease;
}

.card:hover {
  transform: translateY(-4px);
}

@media (prefers-color-scheme: dark) {
  :root {
    --background-color: hsl(220, 20%, 10%);
  }
}
```

### Shell / Bash

```bash
#!/bin/bash

# 部署脚本
set -e

echo "构建项目..."
npm run build

echo "运行测试..."
npm test

echo "部署到生产环境..."
rsync -avz --delete ./dist/ utilisateur@serveur:/var/www/app/

echo "部署完成！"
```

### JSON

```json
{
  "nom": "normco.re",
  "version": "1.0.0",
  "description": "个人博客",
  "scripts": {
    "dev": "deno task serve",
    "build": "deno task build"
  },
  "auteur": {
    "nom": "phiphi",
    "url": "https://normco.re"
  }
}
```

### YAML

```yaml
site:
  titre: normco.re
  description: 在一无所是中获得解放
  auteur: phiphi

build:
  src: ./src
  dest: ./_site

plugins:
  - prism
  - pagefind
  - feed
```

## 代码复制

代码块默认支持复制功能。点击任意代码块右上角的复制图标即可将其内容复制到剪贴板。

## 差异高亮

```diff
- const ancienneValeur = "supprime";
+ const nouvelleValeur = "ajoute";

  function inchangee() {
-   return ancienneValeur;
+   return nouvelleValeur;
  }
```

以上就是代码语法高亮的完整展示。
