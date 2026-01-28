# Design System Integration Overview

## Overview

This document summarizes how the design system is currently integrated with the
Lume templating layer and the client-side JavaScript architecture. The design
system is inspired by **Hugo PaperMod** and has been fully migrated to Lume with
TypeScript components and modern CSS architecture.

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
- `src/js/features/`: Feature enhancements (theme, TOC, search, scroll-to-top,
  code-copy, accesskeys, language selector, etc.).
- `src/js/components/`: Interactive UI components (tabs, modal, toast).
- `src/js/core/`: Initialization and global helpers.

`main.js` initializes features and UI components on `DOMContentLoaded`. The
`ui-components` module exposes UI helpers (toast, modal API) to `window`.

---

## Implemented UI Components

### Template Components

These components are rendered from `src/_components/` and used in layouts or
pages via `comp.*` helpers:

**Core components:**

- **Breadcrumbs** (`src/_components/Breadcrumbs.ts`)
- **Code Tabs** (`src/_components/CodeTabs.ts`) — wraps the tabs component for
  code snippets
- **Modal** (`src/_components/Modal.ts`)
- **Pagination** (`src/_components/Pagination.ts`)
- **Post Details** (`src/_components/PostDetails.ts`)
- **Post List** (`src/_components/PostList.ts`)
- **Source Info** (`src/_components/SourceInfo.ts`)
- **Tabs** (`src/_components/Tabs.ts`)

**PaperMod-specific components:**

- **Author Profile** (`src/_components/AuthorProfile.ts`) — author bio with
  avatar and social links
- **Cover Image** (`src/_components/CoverImage.ts`) — responsive post cover
  images with AVIF/WebP/JPG
- **Language Selector** (`src/_components/LanguageSelector.ts`) — i18n dropdown
  menu
- **Related Posts** (`src/_components/RelatedPosts.ts`) — tag-based related
  posts
- **Share Buttons** (`src/_components/ShareButtons.ts`) — social sharing with
  copy-to-clipboard
- **Social Icons** (`src/_components/SocialIcons.ts`) — footer social media
  links

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

- Buttons, badges, alerts, cards
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

## Feature Modules (PaperMod)

The following feature modules in `src/js/features/` provide PaperMod-style
enhancements:

| Module              | Description                                           |
| ------------------- | ----------------------------------------------------- |
| `accesskeys.js`     | Keyboard shortcuts (h=home, a=archives, s=search)     |
| `anchors.js`        | Header anchor links with hover reveal                 |
| `code-copy.js`      | Copy button for code blocks with visual feedback      |
| `external-links.js` | Opens external links in new tabs                      |
| `images.js`         | Lazy loading and image enhancements                   |
| `lang-selector.js`  | Language selector dropdown behavior                   |
| `scroll-to-top.js`  | Floating scroll-to-top button                         |
| `search-modal.js`   | Pagefind search modal with Cmd/Ctrl+K shortcut        |
| `search.js`         | Search initialization                                 |
| `service-worker.js` | SW registration with update notifications             |
| `share-copy.js`     | Copy-to-clipboard for share buttons                   |
| `theme.js`          | Dark/light theme toggle with localStorage persistence |
| `toc.js`            | Table of contents highlighting and smooth scroll      |

---

## Notes for Future Updates

- Add new UI components in `src/_components/` for markup and
  `src/js/components/` for behavior.
- Wire new JS components through `src/js/core/ui-components.js` so they are
  initialized automatically.
- Keep CSS components in `src/_includes/css/04-components/` and import them from
  `src/styles.css`.
- For PaperMod-specific features, add modules in `src/js/features/` and
  initialize them in `main.js`.
