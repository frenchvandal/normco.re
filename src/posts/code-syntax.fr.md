---
title: Coloration syntaxique du code
description: Une vitrine de la coloration syntaxique avec Prism.js dans plusieurs langages de programmation.
date: 2026-01-25
author: phiphi
tags:
  - Markdown
  - Code
  - Syntax
id: code-syntax
lang: fr
---

Cet article demontre comment les blocs de code sont rendus avec la coloration
syntaxique en utilisant Prism.js.

<!--more-->

## Code en ligne

Utilisez des accents graves pour le `code en ligne` comme les noms de variables
ou les commandes courtes.

## Blocs de code

### JavaScript

```javascript
// Generateur de suite de Fibonacci
function* fibonacci() {
  let [prev, curr] = [0, 1];
  while (true) {
    yield curr;
    [prev, curr] = [curr, prev + curr];
  }
}

const fib = fibonacci();
console.log([...Array(10)].map(() => fib.next().value));
// Sortie : [1, 1, 2, 3, 5, 8, 13, 21, 34, 55]
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
    throw new Error(`Echec de la recuperation : ${reponse.status}`);
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
        print(f"Publie : {self.titre}")

article = Article(
    titre="Bonjour le monde",
    contenu="Ceci est mon premier article.",
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
            messages <- fmt.Sprintf("Bonjour depuis la goroutine %d", id)
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

    scores.insert("Bleu", 10);
    scores.insert("Jaune", 50);

    for (equipe, score) in &scores {
        println!("{equipe}: {score}");
    }

    // Mise a jour du score
    scores.entry("Bleu").and_modify(|s| *s += 10);
    println!("Score equipe Bleue : {}", scores["Bleu"]);
}
```

### HTML

```html
<!DOCTYPE html>
<html lang="fr">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Bonjour le monde</title>
  </head>
  <body>
    <header>
      <h1>Bienvenue</h1>
      <nav>
        <a href="/">Accueil</a>
        <a href="/a-propos">A propos</a>
      </nav>
    </header>
    <main>
      <p>Bonjour, le monde !</p>
    </main>
  </body>
</html>
```

### CSS

```css
:root {
  --couleur-primaire: hsl(220, 70%, 50%);
  --couleur-fond: hsl(0, 0%, 100%);
  --espacement-md: 1rem;
}

.carte {
  background: var(--couleur-fond);
  border-radius: 8px;
  padding: var(--espacement-md);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s ease;
}

.carte:hover {
  transform: translateY(-4px);
}

@media (prefers-color-scheme: dark) {
  :root {
    --couleur-fond: hsl(220, 20%, 10%);
  }
}
```

### Shell / Bash

```bash
#!/bin/bash

# Script de deploiement
set -e

echo "Construction du projet..."
npm run build

echo "Execution des tests..."
npm test

echo "Deploiement en production..."
rsync -avz --delete ./dist/ utilisateur@serveur:/var/www/app/

echo "Deploiement termine !"
```

### JSON

```json
{
  "nom": "normco.re",
  "version": "1.0.0",
  "description": "Blog personnel",
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
  description: Trouver la liberation dans le fait de n'etre rien de special
  auteur: phiphi

build:
  src: ./src
  dest: ./_site

plugins:
  - prism
  - pagefind
  - feed
```

## Copie de code

Les blocs de code supportent automatiquement la fonction de copie. Cliquez sur
l'icone de copie dans le coin superieur droit de n'importe quel bloc de code
pour copier son contenu.

## Mise en evidence des differences

```diff
- const ancienneValeur = "supprime";
+ const nouvelleValeur = "ajoute";

  function inchangee() {
-   return ancienneValeur;
+   return nouvelleValeur;
  }
```

Voila pour la vitrine de la syntaxe du code !
