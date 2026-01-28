---
title: Code Syntax Highlighting
description: A showcase of syntax highlighting with Prism.js across multiple programming languages.
date: 2026-01-25
author: phiphi
tags:
  - Markdown
  - Code
  - Syntax
id: code-syntax
lang: en
---

This post demonstrates how code blocks are rendered with syntax highlighting
using Prism.js.

<!--more-->

## Inline Code

Use backticks for `inline code` like variable names or short commands.

## Code Blocks

### JavaScript

```javascript
// Fibonacci sequence generator
function* fibonacci() {
  let [prev, curr] = [0, 1];
  while (true) {
    yield curr;
    [prev, curr] = [curr, prev + curr];
  }
}

const fib = fibonacci();
console.log([...Array(10)].map(() => fib.next().value));
// Output: [1, 1, 2, 3, 5, 8, 13, 21, 34, 55]
```

### TypeScript

```typescript
interface User {
  id: number;
  name: string;
  email: string;
  createdAt: Date;
}

async function fetchUser(id: number): Promise<User> {
  const response = await fetch(`/api/users/${id}`);
  if (!response.ok) {
    throw new Error(`Failed to fetch user: ${response.status}`);
  }
  return response.json();
}
```

### Python

```python
from dataclasses import dataclass
from typing import Optional

@dataclass
class Article:
    title: str
    content: str
    author: str
    published: bool = False
    views: int = 0

    def publish(self) -> None:
        self.published = True
        print(f"Published: {self.title}")

article = Article(
    title="Hello World",
    content="This is my first post.",
    author="phiphi"
)
article.publish()
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
            messages <- fmt.Sprintf("Hello from goroutine %d", id)
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

    scores.insert("Blue", 10);
    scores.insert("Yellow", 50);

    for (team, score) in &scores {
        println!("{team}: {score}");
    }

    // Update score
    scores.entry("Blue").and_modify(|s| *s += 10);
    println!("Blue team score: {}", scores["Blue"]);
}
```

### HTML

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Hello World</title>
  </head>
  <body>
    <header>
      <h1>Welcome</h1>
      <nav>
        <a href="/">Home</a>
        <a href="/about">About</a>
      </nav>
    </header>
    <main>
      <p>Hello, world!</p>
    </main>
  </body>
</html>
```

### CSS

```css
:root {
  --color-primary: hsl(220, 70%, 50%);
  --color-background: hsl(0, 0%, 100%);
  --spacing-md: 1rem;
}

.card {
  background: var(--color-background);
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
    --color-background: hsl(220, 20%, 10%);
  }
}
```

### Shell / Bash

```bash
#!/bin/bash

# Deploy script
set -e

echo "Building project..."
npm run build

echo "Running tests..."
npm test

echo "Deploying to production..."
rsync -avz --delete ./dist/ user@server:/var/www/app/

echo "✓ Deployment complete!"
```

### JSON

```json
{
  "name": "normco.re",
  "version": "1.0.0",
  "description": "Personal blog",
  "scripts": {
    "dev": "deno task serve",
    "build": "deno task build"
  },
  "author": {
    "name": "phiphi",
    "url": "https://normco.re"
  }
}
```

### YAML

```yaml
site:
  title: normco.re
  description: Finding liberation into being nothing special
  author: phiphi

build:
  src: ./src
  dest: ./_site

plugins:
  - prism
  - pagefind
  - feed
```

## Code with Line Numbers

Code blocks automatically support the copy button feature. Click the copy icon
in the top-right corner of any code block to copy its contents.

## Diff Highlighting

```diff
- const oldValue = "removed";
+ const newValue = "added";

  function unchanged() {
-   return oldValue;
+   return newValue;
  }
```

That's it for the code syntax showcase!
