# Analyse d'Intégration - Design System & Templating Lume

## 📋 Vue d'Ensemble

Cette analyse identifie les adaptations nécessaires pour intégrer les **10
nouveaux composants CSS** avec le système de templating Lume et le JavaScript
existant.

---

## 🏗️ Architecture Actuelle

### Templating Lume

- **Langage** : TypeScript/JSX (string-based rendering, pas de VDOM)
- **Composants** : Fonctions async retournant des strings HTML
- **Localisation** : `/src/_components/*.ts`
- **Layouts** : `/src/_includes/layouts/*.ts`

### JavaScript Existant (`main.js`)

```javascript
// Fonctionnalités actuelles :
✅ ThemeManager (dark/light mode)
✅ Search (Pagefind UI)
✅ Image lazy loading
✅ External links enhancement
✅ Smooth anchor scroll
✅ TOC highlighting (IntersectionObserver)
```

### Pattern Architectural

- **Progressive Enhancement** : HTML de base fonctionne sans JS
- **Module ES** : `<script type="module">`
- **Error Handling** : try-catch pour localStorage/matchMedia
- **DOMContentLoaded** : Initialisation conditionnelle

---

## 🆕 Composants CSS Créés

| Composant      | Interactivité          | Nécessite JS                                   |
| -------------- | ---------------------- | ---------------------------------------------- |
| Input          | Validation visuelle    | ❌ (CSS only)                                  |
| Select         | Native browser         | ❌ (CSS only)                                  |
| Checkbox/Radio | Native toggle          | ⚠️ (optionnel - indeterminate state)           |
| Switch         | Toggle                 | ⚠️ (optionnel - peut utiliser checkbox natif)  |
| Tabs           | Navigation             | ✅ **Requis**                                  |
| Breadcrumbs    | Ellipsis menu          | ⚠️ (optionnel - menu déroulant)                |
| Modal          | Open/Close, Focus trap | ✅ **Requis**                                  |
| Toast          | Auto-dismiss, Close    | ✅ **Requis**                                  |
| Tooltip        | Show/Hide              | ⚠️ (CSS hover fonctionne, JS pour positioning) |
| Skeleton       | Animation              | ❌ (CSS only)                                  |

---

## 🎯 Adaptations Requises

### PRIORITÉ 1 - Composants Critiques

#### 1. **Modal Component** ✅ Requis

**Fonctionnalités à implémenter :**

```javascript
class ModalManager {
  // Requis :
  - Open/Close modal
  - Focus trap (keyboard navigation limitée au modal)
  - Escape key pour fermer
  - Click backdrop pour fermer
  - Body scroll lock pendant ouverture
  - Restaurer focus après fermeture

  // Nice to have :
  - Animation state management (data-state="open/closed")
  - Multiple modals stack management
  - Custom events (modal:open, modal:close)
}
```

**HTML Template Pattern :**

```html
<div class="modal-backdrop" data-state="closed" id="modal-1">
  <div class="modal">
    <div class="modal__header">
      <h2 class="modal__title">Title</h2>
      <button class="modal__close" aria-label="Close">×</button>
    </div>
    <div class="modal__body">Content</div>
    <div class="modal__footer">
      <button class="btn">Cancel</button>
      <button class="btn btn--primary">Confirm</button>
    </div>
  </div>
</div>
```

**Intégration Lume :**

```typescript
// /src/_components/modal.ts
export default function ({ title, content, id }: ModalProps) {
  return `
    <div class="modal-backdrop" data-state="closed" id="${id}">
      <div class="modal">
        <div class="modal__header">
          <h2 class="modal__title">${title}</h2>
          <button class="modal__close" aria-label="Close">
            <svg>...</svg>
          </button>
        </div>
        <div class="modal__body">${content}</div>
      </div>
    </div>
  `;
}
```

---

#### 2. **Toast Component** ✅ Requis

**Fonctionnalités à implémenter :**

```javascript
class ToastManager {
  // Requis :
  - Show toast (variant: info/success/warning/error)
  - Auto-dismiss avec timer configurable
  - Progress bar animation
  - Close button
  - Queue management (max 3 toasts simultanés)
  - Position configuration (top-right par défaut)

  // API :
  toast.show({ message, variant, duration, closeable })
  toast.success(message, duration)
  toast.error(message, duration)
  toast.info(message, duration)
  toast.warning(message, duration)
}
```

**HTML Template Pattern :**

```html
<div class="toast-container toast-container--top-right" id="toast-container">
  <!-- Toasts insérés dynamiquement -->
</div>
```

**Usage dans Lume :**

```typescript
// Dans layout base.ts, ajouter le container :
`<div class="toast-container toast-container--top-right" id="toast-container"></div>`;

// Dans JavaScript, créer toasts dynamiquement :
toastManager.success("Post published!", 5000);
```

---

#### 3. **Tabs Component** ✅ Requis

**Fonctionnalités à implémenter :**

```javascript
class TabsManager {
  // Requis :
  - Switch panel au click sur tab
  - Keyboard navigation (Arrow Left/Right)
  - Home/End pour premier/dernier tab
  - Update aria-selected
  - Panel visibility toggle
  - URL hash sync (optionnel)

  // Auto-initialisation :
  - Detecter tous les .tabs au chargement
  - Setup event listeners
}
```

**HTML Template Pattern :**

```html
<div class="tabs" data-tabs>
  <div class="tabs__list" role="tablist">
    <button
      class="tabs__tab"
      role="tab"
      aria-selected="true"
      aria-controls="panel-1"
      id="tab-1"
    >
      Tab 1
    </button>
    <button
      class="tabs__tab"
      role="tab"
      aria-selected="false"
      aria-controls="panel-2"
      id="tab-2"
    >
      Tab 2
    </button>
  </div>
  <div class="tabs__panels">
    <div
      class="tabs__panel"
      role="tabpanel"
      data-state="active"
      aria-labelledby="tab-1"
      id="panel-1"
    >
      Content 1
    </div>
    <div
      class="tabs__panel"
      role="tabpanel"
      data-state="inactive"
      aria-labelledby="tab-2"
      id="panel-2"
    >
      Content 2
    </div>
  </div>
</div>
```

**Intégration Lume :**

```typescript
// /src/_components/tabs.ts
export default function ({ tabs }: { tabs: TabItem[] }) {
  return `
    <div class="tabs" data-tabs>
      <div class="tabs__list" role="tablist">
        ${
    tabs.map((tab, i) => `
          <button class="tabs__tab" role="tab"
                  aria-selected="${i === 0}"
                  aria-controls="panel-${i}"
                  id="tab-${i}">
            ${tab.label}
          </button>
        `).join("")
  }
      </div>
      <div class="tabs__panels">
        ${
    tabs.map((tab, i) => `
          <div class="tabs__panel" role="tabpanel"
               data-state="${i === 0 ? "active" : "inactive"}"
               aria-labelledby="tab-${i}"
               id="panel-${i}">
            ${tab.content}
          </div>
        `).join("")
  }
      </div>
    </div>
  `;
}
```

---

### PRIORITÉ 2 - Composants Optionnels

#### 4. **Tooltip Component** ⚠️ Optionnel

**CSS hover fonctionne déjà**, mais JS améliore :

```javascript
class TooltipManager {
  // Nice to have :
  - Positioning intelligent (detect viewport edges)
  - Show delay (300ms)
  - Hide delay (100ms)
  - Touch device handling
  - ARIA live region pour screen readers
}
```

**Recommandation** : Commencer avec CSS `:hover`, ajouter JS plus tard si
nécessaire.

---

#### 5. **Breadcrumbs Ellipsis Menu** ⚠️ Optionnel

**Fonctionnalité :**

```javascript
// Toggle menu au click sur ellipsis button
function toggleBreadcrumbMenu(menuId) {
  const menu = document.getElementById(menuId);
  const isOpen = menu.getAttribute("data-state") === "open";
  menu.setAttribute("data-state", isOpen ? "closed" : "open");
}
```

**Recommandation** : Implémenter si nécessaire pour longs chemins.

---

#### 6. **Checkbox Indeterminate State** ⚠️ Optionnel

**Usage :**

```javascript
// Pour "select all" avec partial selection
const checkbox = document.getElementById("select-all");
checkbox.indeterminate = true;
```

**Recommandation** : Implémenter si vous avez des multi-select avec "select
all".

---

### PRIORITÉ 3 - Pure CSS (Aucune adaptation)

Ces composants fonctionnent **100% en CSS** :

✅ **Input/Textarea** - États gérés par `:focus`, `:disabled`, classes
`.input--error` ✅ **Select** - Native browser dropdown ✅ **Switch** - Utilise
`<input type="checkbox">` natif sous le capot ✅ **Skeleton** - Animations CSS
pures (@keyframes shimmer/pulse)

**Aucune modification JavaScript requise.**

---

## 📝 Plan d'Implémentation JavaScript

### Étape 1 : Créer les Classes de Gestion

**Fichier** : `/src/js/components/modal.js`

```javascript
export class ModalManager {
  constructor(modalId) {/* ... */}
  open() {/* ... */}
  close() {/* ... */}
  // Focus trap, escape key, etc.
}
```

**Fichier** : `/src/js/components/toast.js`

```javascript
export class ToastManager {
  constructor(containerId = "toast-container") {/* ... */}
  show({ message, variant, duration }) {/* ... */}
  success(message, duration = 5000) {/* ... */}
  error(message, duration = 5000) {/* ... */}
}
```

**Fichier** : `/src/js/components/tabs.js`

```javascript
export class TabsManager {
  static initAll() {
    document.querySelectorAll("[data-tabs]").forEach((tabs) => {
      new TabsManager(tabs);
    });
  }

  constructor(tabsElement) {/* ... */}
  switchTab(index) {/* ... */}
  handleKeyboard(e) {/* ... */}
}
```

### Étape 2 : Mettre à jour `main.js`

```javascript
// Ajouter les imports
import { ModalManager } from "./components/modal.js";
import { ToastManager } from "./components/toast.js";
import { TabsManager } from "./components/tabs.js";

// Dans initializeFeatures()
function initializeFeatures() {
  initSearch();
  enhanceImages();
  enhanceExternalLinks();
  enhanceAnchors();
  enhanceTOC();

  // Nouveaux composants
  TabsManager.initAll();
  initializeModals();
  initializeToastManager();
}

function initializeModals() {
  // Auto-detect tous les modals
  document.querySelectorAll(".modal-backdrop").forEach((modal) => {
    new ModalManager(modal.id);
  });
}

function initializeToastManager() {
  // Toast manager global
  globalThis.toast = new ToastManager();
}
```

### Étape 3 : Créer les Composants Lume

**Fichiers à créer :**

```
/src/_components/
  ├── modal.ts          # Template modal
  ├── toast.ts          # Toast container (dans layout)
  └── tabs.ts           # Template tabs
```

### Étape 4 : Mettre à jour `base.ts` Layout

```typescript
// Ajouter le toast container avant </body>
export default function (data: Lume.Data, helpers: Lume.Helpers) {
  return `
    <!DOCTYPE html>
    <html lang="${data.lang}">
      <head>...</head>
      <body>
        <a class="skip-link" href="#main-content">Skip to main content</a>
        ${comp.navbar(data)}
        <main id="main-content" role="main">
          ${data.children}
        </main>
        ${comp.footer(data)}

        <!-- Toast Container pour notifications globales -->
        <div class="toast-container toast-container--top-right"
             id="toast-container"></div>

        <script src="/js/main.js" type="module"></script>
      </body>
    </html>
  `;
}
```

---

## 🧪 Tests & Validation

### Checklist d'Accessibilité

Pour chaque composant interactif :

- [ ] **Keyboard navigation** fonctionne (Tab, Enter, Escape, Arrow keys)
- [ ] **Focus visible** sur tous les éléments interactifs
- [ ] **ARIA attributes** corrects (role, aria-label, aria-selected, etc.)
- [ ] **Screen reader** annonce les changements d'état
- [ ] **Focus trap** dans les modals
- [ ] **Focus restoration** après fermeture de modal
- [ ] **Reduced motion** respecté (animations désactivées si préférence)

### Tests Cross-Browser

- [ ] Chrome/Edge
- [ ] Firefox
- [ ] Safari (desktop + mobile)
- [ ] Tests sur mobile (touch events pour tooltips)

---

## 📦 Structure de Fichiers Recommandée

```
/src/
  ├── js/
  │   ├── main.js                    # Point d'entrée principal
  │   └── components/
  │       ├── modal.js               # ModalManager class
  │       ├── toast.js               # ToastManager class
  │       └── tabs.js                # TabsManager class
  │
  ├── _components/
  │   ├── modal.ts                   # Template Lume pour modal
  │   ├── tabs.ts                    # Template Lume pour tabs
  │   ├── breadcrumbs.ts             # Template Lume pour breadcrumbs
  │   └── (existants...)
  │
  └── _includes/
      ├── css/
      │   └── 04-components/
      │       ├── modal.css          # ✅ Créé
      │       ├── toast.css          # ✅ Créé
      │       ├── tabs.css           # ✅ Créé
      │       └── (autres...)
      └── layouts/
          └── base.ts                # À mettre à jour (toast container)
```

---

## 🚀 Ordre de Priorité d'Implémentation

### Phase 1 : Fondamentaux (Semaine 1)

1. **Tabs** - Navigation de contenu (usage fréquent)
2. **Toast** - Feedback utilisateur (très utile)

### Phase 2 : Avancé (Semaine 2)

3. **Modal** - Confirmations, formulaires
4. **Tooltip** - Si nécessaire pour aide contextuelle

### Phase 3 : Optionnel (Semaine 3+)

5. **Breadcrumbs menu** - Si chemins très longs
6. **Checkbox indeterminate** - Si multi-select avec "select all"

---

## 💡 Recommandations Architecture

### 1. **Module Pattern**

```javascript
// Utiliser ES modules pour organisation
export class ComponentManager {}
```

### 2. **Progressive Enhancement**

```javascript
// Toujours vérifier l'existence des éléments
if (!element) return;
```

### 3. **Event Delegation**

```javascript
// Pour composants dynamiques (toasts)
container.addEventListener("click", (e) => {
  if (e.target.matches(".toast__close")) {
    // Close toast
  }
});
```

### 4. **Accessibility First**

```javascript
// Toujours gérer focus, ARIA, keyboard
element.setAttribute("aria-expanded", "true");
element.focus();
```

### 5. **Error Handling**

```javascript
// Défensif comme dans ThemeManager
try {
  localStorage.setItem("key", value);
} catch (e) {
  console.warn("localStorage unavailable:", e);
}
```

---

## 📊 Impact Estimation

| Composant   | Lignes JS   | Complexité         | Temps Estim. |
| ----------- | ----------- | ------------------ | ------------ |
| Tabs        | ~150 lignes | Moyenne            | 3-4h         |
| Toast       | ~200 lignes | Moyenne            | 4-5h         |
| Modal       | ~250 lignes | Haute (focus trap) | 6-8h         |
| Tooltip     | ~100 lignes | Faible             | 2-3h         |
| Breadcrumbs | ~50 lignes  | Faible             | 1-2h         |

**Total estimé** : 16-22h de développement + tests

---

## ✅ Conclusion

### Ce qui fonctionne DÉJÀ sans modification :

- ✅ Input, Textarea, Select (états CSS purs)
- ✅ Checkbox, Radio, Switch (input natif + CSS)
- ✅ Skeleton (animations CSS)
- ✅ Card, Badge, Alert, Button (existants inchangés)

### Ce qui NÉCESSITE du JavaScript :

- 🔴 **Tabs** (Priorité Haute)
- 🔴 **Toast** (Priorité Haute)
- 🟡 **Modal** (Priorité Moyenne)
- 🟢 **Tooltip** (Optionnel)
- 🟢 **Breadcrumbs** (Optionnel)

### Recommandation Finale :

**Commencer par Tabs + Toast** car :

1. Tabs = navigation de contenu (très utile pour docs/settings)
2. Toast = feedback utilisateur (utile pour actions asynchrones)
3. Les deux sont réutilisables globalement
4. Complexité modérée, bon ROI

**Ensuite Modal** si vous avez des cas d'usage (confirmations, formulaires).

Le design system CSS est **production-ready**, le JavaScript est une couche
d'amélioration progressive.
