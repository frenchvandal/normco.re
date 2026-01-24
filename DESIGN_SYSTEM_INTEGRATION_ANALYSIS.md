# Design System Integration Overview

## Overview

This document summarizes how the design system is currently integrated with the
Lume templating layer and the client-side JavaScript architecture. Everything
listed here reflects the current implementation in the codebase.

---

## Current Architecture

### Lume Templates

- **Template language**: TypeScript functions that return HTML strings.
- **Components**: Reusable TS components in `src/_components/`.
- **Layouts**: Base and page layouts in `src/_includes/layouts/`.
- **CSS**: ITCSS layers in `src/_includes/css/`, imported from `src/styles.css`.

### Client-side JavaScript

The JS code is split into three areas:

- `src/js/main.js`: The entry point.
- `src/js/features/`: Feature enhancements (theme, TOC, search, etc.).
- `src/js/components/`: Interactive UI components.
- `src/js/core/`: Initialization and global helpers.

`main.js` initializes features and UI components on `DOMContentLoaded`. The
`ui-components` module exposes UI helpers (toast, modal API) to `window`.

---

## Implemented UI Components

### Tabs

- **Template**: `src/_components/tabs.ts`
- **Behavior**: `src/js/components/tabs.js`
- **Initialization**: Auto-initialized by `TabsManager.initAll()`.
- **Accessibility**: ARIA roles, keyboard navigation, and focus handling.

### Modal

- **Template**: `src/_components/modal.ts`
- **Behavior**: `src/js/components/modal.js`
- **Initialization**: Auto-initialized by `ModalManager.initAll()`.
- **Global API**: `openModal`, `closeModal`, `toggleModal` are exposed on
  `window`.
- **Accessibility**: Focus trap, ESC close, and ARIA attributes.

### Toast Notifications

- **Behavior**: `src/js/components/toast.js`
- **Initialization**: Instantiated in `src/js/core/ui-components.js`.
- **Global API**: `window.toast` provides `show`, `success`, `error`, `warning`,
  `info`, and `dismissAll`.
- **Container**: Rendered in `src/_includes/layouts/base.ts`.

### CSS-first Components

The following components are styled in CSS and require no JS:

- Form inputs, selects, checkboxes, switches
- Breadcrumbs (optional custom JS for ellipsis menus)
- Tooltips (hover/focus behavior is CSS-based)
- Skeleton loaders

---

## Design System CSS Layers

The CSS is organized using ITCSS and imported in `src/styles.css`:

1. **Tokens** (`css/01-tokens/`): Colors, typography, spacing, z-index
2. **Base** (`css/02-base/`): Reset, typography, global styles
3. **Utilities** (`css/03-utilities/`): Single-purpose helpers
4. **Components** (`css/04-components/`): UI elements
5. **Layouts** (`css/05-layouts/`): Page- and section-level layout styles

---

## Notes for Future Updates

- Add new UI components in `src/_components/` for markup and
  `src/js/components/` for behavior.
- Wire new JS components through `src/js/core/ui-components.js` so they are
  initialized automatically.
- Keep CSS components in `src/_includes/css/04-components/` and import them
  from `src/styles.css`.
