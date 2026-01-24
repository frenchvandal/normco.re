# Guide d'Utilisation des Composants UI

Ce guide explique comment utiliser tous les composants interactifs du design
system dans vos pages Lume.

---

## 📑 Table des Matières

1. [Tabs](#tabs)
2. [Toast Notifications](#toast-notifications)
3. [Modal](#modal)
4. [Form Components](#form-components)
5. [Navigation Components](#navigation-components)
6. [Tooltip](#tooltip)
7. [Skeleton Loaders](#skeleton-loaders)

---

## 🗂️ Tabs

### Usage dans Lume

```typescript
// Dans votre page .ts
export default function (data: Lume.Data, helpers: Lume.Helpers) {
  const { comp } = data;

  return `
    <h1>Ma Page avec Tabs</h1>

    ${
    comp.tabs({
      tabs: [
        {
          label: "Overview",
          content: "<p>Vue d'ensemble du projet</p>",
        },
        {
          label: "Settings",
          content: "<p>Paramètres de configuration</p>",
        },
        {
          label: "Advanced",
          content: "<p>Options avancées</p>",
          badge: "New",
        },
      ],
    })
  }
  `;
}
```

### Variants

```typescript
// Pills variant
${comp.tabs({
  tabs: [...],
  variant: "pills"
})}

// Boxed variant
${comp.tabs({
  tabs: [...],
  variant: "boxed"
})}

// Vertical tabs
${comp.tabs({
  tabs: [...],
  vertical: true
})}
```

### Avec Icônes et Badges

```typescript
${comp.tabs({
  tabs: [
    {
      label: "Inbox",
      content: "<p>Messages</p>",
      icon: '<svg>...</svg>',
      badge: "5"
    },
    {
      label: "Archive",
      content: "<p>Archivés</p>",
      disabled: true
    }
  ]
})}
```

### Navigation par Clavier

- **Arrow Left/Right** : Naviguer entre les tabs
- **Home** : Aller au premier tab
- **End** : Aller au dernier tab
- **Tab** : Focus sur le contenu du panel actif

---

## 🔔 Toast Notifications

### API Globale

Le toast manager est disponible globalement via `window.toast` :

```javascript
// Toast de succès
toast.success("Article publié avec succès !");

// Toast d'erreur
toast.error("Erreur lors de la sauvegarde");

// Toast d'avertissement
toast.warning("Connexion instable détectée");

// Toast d'information
toast.info("Synchronisation en cours...", 3000);
```

### API Avancée

```javascript
// Toast personnalisé
toast.show({
  message: "Opération en cours",
  title: "Traitement",
  variant: "info",
  duration: 5000, // 0 = pas d'auto-dismiss
  closeable: true,
});

// Fermer tous les toasts
toast.dismissAll();
```

### Exemples d'Utilisation

#### Après une action utilisateur

```javascript
// Dans un événement de formulaire
form.addEventListener("submit", async (e) => {
  e.preventDefault();

  try {
    await saveData(formData);
    toast.success("Données sauvegardées !", 3000);
  } catch (error) {
    toast.error("Échec de la sauvegarde");
  }
});
```

#### Notification de bienvenue

```javascript
// Au chargement de la page
document.addEventListener("DOMContentLoaded", () => {
  toast.info("Bienvenue sur normco.re", 4000);
});
```

### Variants

- `success` : Vert avec icône checkmark
- `error` : Rouge avec icône erreur
- `warning` : Orange avec icône avertissement
- `info` : Bleu avec icône information

---

## 🪟 Modal

### Usage dans Lume

```typescript
// Dans votre layout ou page
export default function (data: Lume.Data, helpers: Lume.Helpers) {
  const { comp } = data;

  return `
    <button onclick="openModal('confirm-delete')">
      Supprimer
    </button>

    ${
    comp.modal({
      id: "confirm-delete",
      title: "Confirmer la suppression",
      content: `
        <p>Êtes-vous sûr de vouloir supprimer cet élément ?</p>
        <p>Cette action est irréversible.</p>
      `,
      footer: `
        <button class="btn" onclick="closeModal('confirm-delete')">
          Annuler
        </button>
        <button class="btn btn--primary" onclick="handleDelete()">
          Supprimer
        </button>
      `,
    })
  }
  `;
}
```

### Tailles de Modal

```typescript
// Petit modal
${comp.modal({
  id: "small-modal",
  title: "Confirmation",
  content: "...",
  size: "small"
})}

// Grand modal
${comp.modal({
  id: "large-modal",
  title: "Détails",
  content: "...",
  size: "large"
})}

// Fullscreen
${comp.modal({
  id: "fullscreen-modal",
  title: "Édition",
  content: "...",
  size: "fullscreen"
})}
```

### API JavaScript

```javascript
// Ouvrir un modal
openModal("my-modal");

// Fermer un modal
closeModal("my-modal");

// Toggle modal
toggleModal("my-modal");
```

### Events Personnalisés

```javascript
const modal = document.getElementById("my-modal");

modal.addEventListener("modal:open", (e) => {
  console.log("Modal ouvert:", e.detail.modalId);
});

modal.addEventListener("modal:close", (e) => {
  console.log("Modal fermé:", e.detail.modalId);
});
```

### Fonctionnalités Accessibilité

- **Escape** : Fermer le modal
- **Focus trap** : Le focus reste dans le modal
- **Restoration du focus** : Le focus revient à l'élément déclencheur
- **Backdrop click** : Cliquer en dehors ferme le modal
- **ARIA attributes** : role="dialog", aria-modal="true"

---

## 📝 Form Components

### Input & Textarea

```html
<!-- Input basique -->
<div class="form-group">
  <label class="form-label">Email</label>
  <input type="email" class="input" placeholder="votre@email.com" />
</div>

<!-- Input avec erreur -->
<div class="form-group">
  <label class="form-label form-label--required">Nom</label>
  <input type="text" class="input input--error" value="ab" />
  <span class="form-help form-help--error">
    Le nom doit contenir au moins 3 caractères
  </span>
</div>

<!-- Input avec succès -->
<div class="form-group">
  <label class="form-label">Username</label>
  <input type="text" class="input input--success" value="john_doe" />
  <span class="form-help form-help--success">Username disponible</span>
</div>

<!-- Textarea -->
<div class="form-group">
  <label class="form-label">Message</label>
  <textarea class="textarea" rows="5"></textarea>
  <span class="form-help">Maximum 500 caractères</span>
</div>
```

### Select

```html
<div class="form-group">
  <label class="form-label">Pays</label>
  <select class="select">
    <option value="">Sélectionner...</option>
    <option value="fr">France</option>
    <option value="be">Belgique</option>
    <option value="ca">Canada</option>
  </select>
</div>

<!-- Select avec erreur -->
<select class="select select--error">
  <option value="">Requis</option>
</select>
```

### Checkbox

```html
<!-- Checkbox simple -->
<label class="checkbox-wrapper">
  <input type="checkbox" class="checkbox" />
  <span class="checkbox-custom"></span>
  <span class="checkbox-label">J'accepte les conditions</span>
</label>

<!-- Checkbox avec erreur -->
<label class="checkbox-wrapper checkbox-wrapper--error">
  <input type="checkbox" class="checkbox" />
  <span class="checkbox-custom"></span>
  <span class="checkbox-label">Requis</span>
</label>

<!-- État indeterminate (via JS) -->
<script>
  document.getElementById("select-all").indeterminate = true;
</script>
```

### Radio Buttons

```html
<fieldset>
  <legend>Taille du t-shirt</legend>

  <label class="radio-wrapper">
    <input type="radio" name="size" class="radio" value="s" />
    <span class="radio-custom"></span>
    <span class="radio-label">Small</span>
  </label>

  <label class="radio-wrapper">
    <input type="radio" name="size" class="radio" value="m" checked />
    <span class="radio-custom"></span>
    <span class="radio-label">Medium</span>
  </label>

  <label class="radio-wrapper">
    <input type="radio" name="size" class="radio" value="l" />
    <span class="radio-custom"></span>
    <span class="radio-label">Large</span>
  </label>
</fieldset>
```

### Switch (Toggle)

```html
<!-- Switch basique -->
<label class="switch-wrapper">
  <input type="checkbox" class="switch" />
  <span class="switch-track"></span>
  <span class="switch-label">Activer les notifications</span>
</label>

<!-- Switch checked -->
<label class="switch-wrapper">
  <input type="checkbox" class="switch" checked />
  <span class="switch-track"></span>
  <span class="switch-label">Mode sombre</span>
</label>

<!-- Switch disabled -->
<label class="switch-wrapper switch-wrapper--disabled">
  <input type="checkbox" class="switch" disabled />
  <span class="switch-track"></span>
  <span class="switch-label">Option non disponible</span>
</label>
```

---

## 🧭 Navigation Components

### Breadcrumbs

```html
<nav class="breadcrumbs" aria-label="Breadcrumb">
  <ol class="breadcrumbs__list">
    <li class="breadcrumbs__item">
      <a href="/" class="breadcrumbs__link">Accueil</a>
      <span class="breadcrumbs__separator" aria-hidden="true">/</span>
    </li>
    <li class="breadcrumbs__item">
      <a href="/blog" class="breadcrumbs__link">Blog</a>
      <span class="breadcrumbs__separator" aria-hidden="true">/</span>
    </li>
    <li class="breadcrumbs__item">
      <span class="breadcrumbs__current" aria-current="page">
        Article courant
      </span>
    </li>
  </ol>
</nav>

<!-- Breadcrumbs boxed -->
<nav class="breadcrumbs breadcrumbs--boxed">
  ...
</nav>
```

---

## 💬 Tooltip

```html
<!-- Tooltip en haut (défaut) -->
<div class="tooltip-wrapper">
  <button class="btn">Hover me</button>
  <span class="tooltip tooltip--top">Tooltip text</span>
</div>

<!-- Tooltip en bas -->
<div class="tooltip-wrapper">
  <button class="btn">Info</button>
  <span class="tooltip tooltip--bottom">Information supplémentaire</span>
</div>

<!-- Tooltip avec variant -->
<div class="tooltip-wrapper">
  <button class="btn btn--primary">Success</button>
  <span class="tooltip tooltip--top tooltip--success">
    Action réussie
  </span>
</div>

<!-- Tooltip multiligne -->
<div class="tooltip-wrapper">
  <button class="btn">Details</button>
  <span class="tooltip tooltip--top tooltip--multiline">
    Ceci est un tooltip<br>
    avec plusieurs lignes<br>
    de contenu
  </span>
</div>
```

### Variants

- `tooltip--top` : Au-dessus (défaut)
- `tooltip--bottom` : En-dessous
- `tooltip--left` : À gauche
- `tooltip--right` : À droite
- `tooltip--light` : Fond clair avec bordure
- `tooltip--success` : Vert
- `tooltip--error` : Rouge
- `tooltip--warning` : Orange

---

## ⏳ Skeleton Loaders

### Formes de Base

```html
<!-- Texte -->
<div class="skeleton skeleton--text"></div>
<div class="skeleton skeleton--text skeleton--w-75"></div>
<div class="skeleton skeleton--text skeleton--w-50"></div>

<!-- Heading -->
<div class="skeleton skeleton--heading"></div>

<!-- Circle (avatar) -->
<div class="skeleton skeleton--circle"></div>

<!-- Rectangle (image) -->
<div class="skeleton skeleton--rect"></div>

<!-- Bouton -->
<div class="skeleton skeleton--button"></div>
```

### Patterns Pré-configurés

```html
<!-- Skeleton de post/article -->
<div class="skeleton-post">
  <div class="skeleton-post__header">
    <div class="skeleton skeleton--circle"></div>
    <div class="skeleton skeleton--text skeleton--w-75"></div>
  </div>
  <div class="skeleton-post__content">
    <div class="skeleton skeleton--heading"></div>
    <div class="skeleton skeleton--text"></div>
    <div class="skeleton skeleton--text skeleton--w-50"></div>
  </div>
</div>

<!-- Skeleton de liste -->
<div class="skeleton-list">
  <div class="skeleton-list-item">
    <div class="skeleton skeleton--circle"></div>
    <div class="skeleton-list-item__content">
      <div class="skeleton skeleton--text"></div>
      <div class="skeleton skeleton--text skeleton--w-75"></div>
    </div>
  </div>
  <!-- Répéter pour chaque item -->
</div>

<!-- Skeleton de table -->
<div class="skeleton-table">
  <div class="skeleton-table__row">
    <div class="skeleton skeleton--text"></div>
    <div class="skeleton skeleton--text"></div>
    <div class="skeleton skeleton--text"></div>
  </div>
  <!-- Répéter pour chaque ligne -->
</div>
```

### Variants d'Animation

```html
<!-- Animation shimmer (défaut) -->
<div class="skeleton skeleton--text"></div>

<!-- Animation wave (pulse seulement) -->
<div class="skeleton skeleton--text skeleton--wave"></div>

<!-- Pas d'animation -->
<div class="skeleton skeleton--text skeleton--static"></div>
```

---

## 🎨 Exemples Complets

### Page avec Tabs et Toast

```typescript
export default function (data: Lume.Data, helpers: Lume.Helpers) {
  const { comp } = data;

  return `
    <div class="container">
      <h1>Configuration</h1>

      ${
    comp.tabs({
      tabs: [
        {
          label: "Général",
          content: `
              <form id="settings-form">
                <div class="form-group">
                  <label class="form-label">Nom</label>
                  <input type="text" class="input" name="name" />
                </div>
                <button type="submit" class="btn btn--primary">
                  Sauvegarder
                </button>
              </form>

              <script>
                document.getElementById('settings-form')
                  .addEventListener('submit', (e) => {
                    e.preventDefault();
                    toast.success('Paramètres sauvegardés !');
                  });
              </script>
            `,
        },
        {
          label: "Notifications",
          content: `
              <label class="switch-wrapper">
                <input type="checkbox" class="switch" checked />
                <span class="switch-track"></span>
                <span class="switch-label">Notifications email</span>
              </label>
            `,
        },
      ],
    })
  }
    </div>
  `;
}
```

### Modal de Confirmation avec Actions

```typescript
${comp.modal({
  id: "delete-account",
  title: "Supprimer le compte",
  content: `
    <div class="alert alert--error">
      <strong>Attention !</strong> Cette action est irréversible.
    </div>
    <p>Toutes vos données seront définitivement supprimées.</p>

    <div class="form-group">
      <label class="form-label form-label--required">
        Tapez "SUPPRIMER" pour confirmer
      </label>
      <input type="text" class="input" id="confirm-input" />
    </div>
  `,
  footer: `
    <button class="btn" onclick="closeModal('delete-account')">
      Annuler
    </button>
    <button class="btn btn--primary" onclick="confirmDelete()">
      Confirmer la suppression
    </button>
  `,
  size: "small"
})}

<script>
  function confirmDelete() {
    const input = document.getElementById('confirm-input');
    if (input.value === 'SUPPRIMER') {
      closeModal('delete-account');
      toast.success('Compte supprimé');
    } else {
      toast.error('Confirmation incorrecte');
    }
  }
</script>
```

---

## 🎯 Bonnes Pratiques

### Accessibilité

1. **Toujours utiliser les labels** pour les inputs
2. **ARIA attributes** sont gérés automatiquement par les composants
3. **Navigation clavier** : Tester avec Tab, Enter, Escape, Arrow keys
4. **Focus visible** : Ne jamais supprimer l'outline sans alternative

### Performance

1. **Lazy loading** : Initialiser les modals uniquement au besoin
2. **Toast queue** : Maximum 3 toasts simultanés (géré automatiquement)
3. **Skeleton** : Utiliser pendant le chargement de contenu asynchrone

### UX

1. **Toast duration** :
   - Success: 3-5s
   - Info: 4-6s
   - Error: 7-10s (utilisateur doit pouvoir lire)
2. **Modal size** : Utiliser `small` pour les confirmations simples
3. **Tabs** : Maximum 5-7 tabs pour une bonne UX

---

## 🔧 Debugging

### Vérifier l'initialisation

```javascript
// Dans la console du navigateur
console.log(window.toast); // ToastManager instance
console.log(window.openModal); // Modal API
console.log(TabsManager); // TabsManager class
```

### Events du navigateur

```javascript
// Écouter tous les events modal
document.addEventListener("modal:open", (e) => {
  console.log("Modal ouvert:", e.detail);
});

document.addEventListener("modal:close", (e) => {
  console.log("Modal fermé:", e.detail);
});
```

### Erreurs Courantes

1. **Toast ne s'affiche pas** → Vérifier que le `toast-container` existe dans le
   DOM
2. **Tabs ne fonctionnent pas** → Vérifier l'attribut `data-tabs` sur le
   conteneur
3. **Modal ne se ferme pas** → Vérifier que `closeModal()` est appelé avec le
   bon ID

---

## 📚 Ressources

- **Design System Tokens** : `/src/_includes/css/01-tokens/tokens.css`
- **Component CSS** : `/src/_includes/css/04-components/`
- **Component JS** : `/src/js/components/`
- **Lume Components** : `/src/_components/`

---

## 🆘 Support

Pour toute question ou bug, référez-vous à :

- `DESIGN_SYSTEM_INTEGRATION_ANALYSIS.md` : Architecture et intégration
- Ce fichier : Exemples d'utilisation
- Code source : Commentaires inline dans chaque fichier
