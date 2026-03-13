# Carbon Design System Migration Plan

## Overview

This document outlines the systematic migration of normco.re to Carbon Design System v11, following the exhaustive specification provided. The migration prioritizes:

1. **Foundation first**: Tokens, grid, typography before components
2. **Progressive enhancement**: Existing functionality remains intact during migration
3. **Editorial integrity**: Blog reading experience takes precedence over dashboard aesthetics

## Current State Analysis

### What's Already Carbon-Aligned

- Header structure follows UI Shell pattern (`bx--header` classes)
- Search integration with Pagefind uses Carbon-style panel
- Theme toggle with sun/moon icons
- Language selector panel structure
- Side navigation pattern for mobile

### What Needs Migration

- **Tokens**: Currently using Primer-like tokens, need full Carbon token mapping
- **Typography**: System fonts → IBM Plex (Sans + Mono)
- **Grid**: Ad-hoc spacing → Carbon 2x Grid (8px base unit)
- **Components**: Need formal Carbon component implementation
- **Colors**: Primer semantic colors → Carbon theme tokens

## Phase 1: Foundation Tokens (Priority: High)

### 1.1 Carbon Theme Tokens

**File**: `src/styles/base.css`

Replace current Primer-like tokens with Carbon Design System v11 tokens:

```css
:root {
  /* Carbon White Theme (default light) */
  --cds-background: #ffffff;
  --cds-background-inverse: #161616;
  --cds-background-hover: #f4f4f4;
  --cds-background-active: #e0e0e0;
  --cds-background-selected: #e0e0e0;
  
  --cds-layer: #f4f4f4;
  --cds-layer-hover: #e0e0e0;
  --cds-layer-active: #cdcdcd;
  --cds-layer-selected: #cdcdcd;
  
  --cds-layer-accent: #e0e0e0;
  --cds-layer-accent-hover: #cdcdcd;
  --cds-layer-accent-active: #b6b6b6;
  
  --cds-field: #ffffff;
  --cds-field-hover: #f4f4f4;
  
  --cds-border-subtle: #e0e0e0;
  --cds-border-strong: #8d8d8d;
  --cds-border-inverse: #ffffff;
  --cds-border-interactive: #0f62fe;
  
  --cds-text-primary: #161616;
  --cds-text-secondary: #525252;
  --cds-text-placeholder: #8d8d8d;
  --cds-text-helper: #6f6f6f;
  --cds-text-inverse: #ffffff;
  --cds-text-link: #0f62fe;
  
  --cds-link-primary: #0f62fe;
  --cds-link-primary-hover: #0043ce;
  --cds-link-secondary: #0f62fe;
  
  --cds-icon-primary: #161616;
  --cds-icon-secondary: #525252;
  --cds-icon-inverse: #ffffff;
  --cds-icon-on-color: #ffffff;
  
  --cds-focus: #0f62fe;
  
  --cds-support-error: #da1e28;
  --cds-support-success: #198038;
  --cds-support-warning: #f1c21b;
  --cds-support-info: #0043ce;
  
  /* Spacing - Carbon 2x Grid (8px base) */
  --cds-spacing-01: 0.125rem;  /* 2px */
  --cds-spacing-02: 0.25rem;   /* 4px */
  --cds-spacing-03: 0.5rem;    /* 8px */
  --cds-spacing-04: 0.75rem;   /* 12px */
  --cds-spacing-05: 1rem;      /* 16px */
  --cds-spacing-06: 1.5rem;    /* 24px */
  --cds-spacing-07: 2rem;      /* 32px */
  --cds-spacing-08: 2.5rem;    /* 40px */
  --cds-spacing-09: 3rem;      /* 48px */
  --cds-spacing-10: 4rem;      /* 64px */
  --cds-spacing-11: 5rem;      /* 80px */
  --cds-spacing-12: 6rem;      /* 96px */
  --cds-spacing-13: 10rem;     /* 160px */
  
  /* Layout */
  --cds-fluid-width: 100%;
  --cds-fixed-width: 1584px; /* max width for large screens */
}

/* Dark theme (Gray 100) */
:root[data-color-mode="dark"] {
  --cds-background: #161616;
  --cds-background-inverse: #ffffff;
  --cds-background-hover: #262626;
  --cds-background-active: #393939;
  --cds-background-selected: #393939;
  
  --cds-layer: #262626;
  --cds-layer-hover: #393939;
  --cds-layer-active: #4c4c4c;
  --cds-layer-selected: #4c4c4c;
  
  --cds-layer-accent: #393939;
  --cds-layer-accent-hover: #4c4c4c;
  --cds-layer-accent-active: #6f6f6f;
  
  --cds-field: #262626;
  --cds-field-hover: #393939;
  
  --cds-border-subtle: #393939;
  --cds-border-strong: #6f6f6f;
  --cds-border-inverse: #ffffff;
  --cds-border-interactive: #4589ff;
  
  --cds-text-primary: #f4f4f4;
  --cds-text-secondary: #c6c6c6;
  --cds-text-placeholder: #8d8d8d;
  --cds-text-helper: #a8a8a8;
  --cds-text-inverse: #161616;
  --cds-text-link: #78a9ff;
  
  --cds-link-primary: #78a9ff;
  --cds-link-primary-hover: #a6c8ff;
  --cds-link-secondary: #78a9ff;
  
  --cds-icon-primary: #f4f4f4;
  --cds-icon-secondary: #c6c6c6;
  --cds-icon-inverse: #161616;
  --cds-icon-on-color: #ffffff;
  
  --cds-focus: #78a9ff;
}
```

### 1.2 IBM Plex Typography

**File**: `src/styles/base.css` (add to `@layer base`)

```css
@layer base {
  /* IBM Plex font stack */
  --cds-font-family-sans: 
    'IBM Plex Sans', 
    -apple-system, 
    BlinkMacSystemFont, 
    'Segoe UI', 
    Roboto, 
    Helvetica, 
    Arial, 
    sans-serif;
  
  --cds-font-family-mono: 
    'IBM Plex Mono', 
    'SF Mono', 
    'Menlo', 
    'Consolas', 
    monospace;
  
  /* Productive type tokens (UI, forms, metadata) */
  --cds-productive-heading-01: 0.875rem/1.285rem; /* 14px / line-height */
  --cds-productive-heading-02: 1rem/1.375rem;     /* 16px */
  --cds-productive-heading-03: 1.25rem/1.625rem;  /* 20px */
  --cds-productive-heading-04: 1.75rem/2.25rem;   /* 28px */
  --cds-productive-heading-05: 2rem/2.5rem;       /* 32px */
  --cds-productive-heading-06: 2.25rem/2.625rem;  /* 36px */
  
  --cds-productive-body-01: 0.875rem/1.285rem;    /* 14px */
  --cds-productive-body-02: 1rem/1.375rem;        /* 16px */
  --cds-productive-body-longform: 1rem/1.5rem;    /* 16px / relaxed */
  
  --cds-productive-code-01: 0.875rem/1.285rem;    /* 14px */
  --cds-productive-code-02: 1rem/1.375rem;        /* 16px */
  
  /* Expressive type tokens (hero, editorial) */
  --cds-expressive-heading-01: 0.875rem/1.25rem;  /* 14px */
  --cds-expressive-heading-02: 1rem/1.375rem;     /* 16px */
  --cds-expressive-heading-03: 1.25rem/1.625rem;  /* 20px */
  --cds-expressive-heading-04: 1.75rem/2.25rem;   /* 28px */
  --cds-expressive-heading-05: 2rem/2.5rem;       /* 32px */
  --cds-expressive-heading-06: 2.25rem/2.625rem;  /* 36px */
  
  /* Display sizes (for future use) */
  --cds-display-01: 2.25rem/2.625rem;             /* 36px */
  --cds-display-02: 2.625rem/3.125rem;            /* 42px */
  --cds-display-03: 3.375rem/3.75rem;             /* 54px */
  --cds-display-04: 4.5rem/4.75rem;               /* 72px */
  
  /* Font weights */
  --cds-font-weight-light: 300;
  --cds-font-weight-regular: 400;
  --cds-font-weight-semibold: 500;
  --cds-font-weight-bold: 600;
  
  /* Letter spacing */
  --cds-letter-spacing-heading: -0.01em;
  --cds-letter-spacing-body: 0;
  --cds-letter-spacing-code: 0;
}
```

### 1.3 Load IBM Plex Fonts

**File**: `src/style.css` (add at top, before layers)

```css
/* IBM Plex fonts - self-hosted or CDN */
@import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:ital,wght@0,400;0,500;0,600;1,400&family=IBM+Plex+Mono:ital,wght@0,400;0,500;1,400&display=swap');
```

**Alternative**: Use npm packages already in `deno.json`:
- `@ibm/plex-mono`
- `@ibm/plex-sans`

These would be bundled during build via the vendor script.

## Phase 2: Grid System (Priority: High)

### 2.1 Carbon 2x Grid Implementation

**File**: `src/styles/layout.css`

```css
@layer layout {
  /* Carbon 2x Grid - 8px base unit */
  .bx--grid {
    width: 100%;
    padding-right: var(--cds-spacing-05);  /* 16px */
    padding-left: var(--cds-spacing-05);   /* 16px */
    margin-right: auto;
    margin-left: auto;
    max-width: var(--cds-fixed-width);
  }
  
  .bx--grid--full-width {
    max-width: 100%;
    padding-left: var(--cds-spacing-05);
    padding-right: var(--cds-spacing-05);
  }
  
  .bx--row {
    display: flex;
    flex-wrap: wrap;
    box-sizing: border-box;
    margin: 0 calc(var(--cds-spacing-05) * -1); /* -16px */
  }
  
  /* Responsive columns */
  .bx--col {
    flex: 1 1 0%;
    box-sizing: border-box;
    padding: 0 var(--cds-spacing-05);
  }
  
  /* Fixed columns (Carbon 16-column grid) */
  .bx--col-lg-1 { flex: 0 0 6.25%; max-width: 6.25%; }
  .bx--col-lg-2 { flex: 0 0 12.5%; max-width: 12.5%; }
  .bx--col-lg-3 { flex: 0 0 18.75%; max-width: 18.75%; }
  .bx--col-lg-4 { flex: 0 0 25%; max-width: 25%; }
  .bx--col-lg-5 { flex: 0 0 31.25%; max-width: 31.25%; }
  .bx--col-lg-6 { flex: 0 0 37.5%; max-width: 37.5%; }
  .bx--col-lg-7 { flex: 0 0 43.75%; max-width: 43.75%; }
  .bx--col-lg-8 { flex: 0 0 50%; max-width: 50%; }
  .bx--col-lg-9 { flex: 0 0 56.25%; max-width: 56.25%; }
  .bx--col-lg-10 { flex: 0 0 62.5%; max-width: 62.5%; }
  .bx--col-lg-11 { flex: 0 0 68.75%; max-width: 68.75%; }
  .bx--col-lg-12 { flex: 0 0 75%; max-width: 75%; }
  .bx--col-lg-13 { flex: 0 0 81.25%; max-width: 81.25%; }
  .bx--col-lg-14 { flex: 0 0 87.5%; max-width: 87.5%; }
  .bx--col-lg-15 { flex: 0 0 93.75%; max-width: 93.75%; }
  .bx--col-lg-16 { flex: 0 0 100%; max-width: 100%; }
  
  /* Medium breakpoint */
  @media (max-width: 1056px) {
    .bx--col-md-1 { flex: 0 0 12.5%; max-width: 12.5%; }
    .bx--col-md-2 { flex: 0 0 25%; max-width: 25%; }
    .bx--col-md-3 { flex: 0 0 37.5%; max-width: 37.5%; }
    .bx--col-md-4 { flex: 0 0 50%; max-width: 50%; }
    .bx--col-md-5 { flex: 0 0 62.5%; max-width: 62.5%; }
    .bx--col-md-6 { flex: 0 0 75%; max-width: 75%; }
    .bx--col-md-7 { flex: 0 0 87.5%; max-width: 87.5%; }
    .bx--col-md-8 { flex: 0 0 100%; max-width: 100%; }
  }
  
  /* Small breakpoint */
  @media (max-width: 672px) {
    .bx--col-sm-1,
    .bx--col-sm-2,
    .bx--col-sm-3,
    .bx--col-sm-4 { flex: 0 0 100%; max-width: 100%; }
  }
  
  /* Gutter utilities */
  .bx--grid--condensed {
    padding-left: var(--cds-spacing-03);
    padding-right: var(--cds-spacing-03);
  }
  
  .bx--grid--wide {
    padding-left: var(--cds-spacing-09);
    padding-right: var(--cds-spacing-09);
  }
}
```

## Phase 3: Core Components (Priority: High → Medium)

### 3.1 Skip Link (Already Present, Needs Carbon Styling)

**File**: `src/styles/components.css`

```css
@layer components {
  .bx--skip-to-content {
    position: absolute;
    inset-inline-start: var(--cds-spacing-05);
    inset-block-start: var(--cds-spacing-05);
    z-index: 10000;
    padding: var(--cds-spacing-03) var(--cds-spacing-05);
    background: var(--cds-background);
    border: 1px solid var(--cds-border-interactive);
    color: var(--cds-text-link);
    font-size: var(--cds-productive-body-01);
    font-weight: var(--cds-font-weight-semibold);
    text-decoration: none;
    clip: rect(1px, 1px, 1px, 1px);
    clip-path: inset(50%);
    width: 1px;
    height: 1px;
    overflow: hidden;
  }
  
  .bx--skip-to-content:focus {
    clip: auto;
    clip-path: none;
    width: auto;
    height: auto;
    outline: 2px solid var(--cds-focus);
    outline-offset: 2px;
  }
}
```

### 3.2 UI Shell Header (Already Structured, Needs Token Update)

Current Header.tsx already uses `bx--header` classes. Update CSS tokens:

**File**: `src/styles/components.css`

```css
@layer components {
  .bx--header {
    position: sticky;
    top: 0;
    z-index: 1000;
    display: flex;
    align-items: center;
    height: 3rem; /* 48px - Carbon header height */
    background: var(--cds-background);
    border-block-end: 1px solid var(--cds-border-subtle);
  }
  
  .bx--header__wrapper {
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%;
    height: 100%;
    padding-inline: var(--cds-spacing-05); /* 16px */
  }
  
  .bx--header__left {
    display: flex;
    align-items: center;
    gap: var(--cds-spacing-05);
  }
  
  .bx--header__action {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 3rem; /* 48px */
    height: 3rem; /* 48px */
    padding: 0;
    background: transparent;
    border: none;
    color: var(--cds-icon-primary);
    cursor: pointer;
    transition: background-color 0.15s ease;
  }
  
  .bx--header__action:hover {
    background: var(--cds-background-hover);
  }
  
  .bx--header__action:focus-visible {
    outline: 2px solid var(--cds-focus);
    outline-offset: -2px;
  }
  
  .bx--header__menu-icon {
    width: 1.25rem; /* 20px */
    height: 1.25rem; /* 20px */
  }
  
  .bx--header__name {
    display: inline-flex;
    align-items: baseline;
    font-size: var(--cds-productive-heading-01); /* 14px */
    font-weight: var(--cds-font-weight-bold); /* 600 */
    color: var(--cds-text-primary);
    text-decoration: none;
    letter-spacing: var(--cds-letter-spacing-heading);
  }
  
  .bx--header__name--prefix {
    font-weight: var(--cds-font-weight-regular); /* 400 */
  }
  
  .bx--header__name:hover {
    color: var(--cds-text-link);
  }
  
  .bx--header__nav {
    display: flex;
    align-items: center;
    gap: var(--cds-spacing-01);
    margin-inline-start: var(--cds-spacing-05);
  }
  
  .bx--header__menu-item {
    display: inline-flex;
    align-items: center;
    height: 3rem; /* 48px */
    padding: 0 var(--cds-spacing-05); /* 16px */
    font-size: var(--cds-productive-body-01); /* 14px */
    color: var(--cds-text-secondary);
    text-decoration: none;
    border-block-end: 2px solid transparent;
    transition: 
      background-color 0.15s ease,
      color 0.15s ease,
      border-color 0.15s ease;
  }
  
  .bx--header__menu-item:hover {
    background: var(--cds-background-hover);
    color: var(--cds-text-primary);
  }
  
  .bx--header__menu-item[aria-current="page"],
  .bx--header__menu-item--active {
    color: var(--cds-text-primary);
    border-block-end-color: var(--cds-border-interactive);
  }
  
  .bx--header__global {
    display: flex;
    align-items: center;
    gap: var(--cds-spacing-01);
  }
  
  .bx--header__action-icon {
    width: 1.25rem; /* 20px */
    height: 1.25rem; /* 20px */
  }
  
  /* Header panel (dropdowns, search) */
  .bx--header__panel {
    position: absolute;
    top: 3rem; /* 48px */
    right: 0;
    z-index: 999;
    width: 100%;
    max-width: 20rem; /* 320px */
    background: var(--cds-background);
    border: 1px solid var(--cds-border-subtle);
    border-top: none;
    box-shadow: 0 4px 8px rgb(0 0 0 / 10%);
  }
  
  .bx--header__panel[hidden] {
    display: none;
  }
  
  .bx--header__panel-content {
    padding: var(--cds-spacing-05);
  }
  
  .bx--header__panel-title {
    font-size: var(--cds-productive-heading-02);
    font-weight: var(--cds-font-weight-semibold);
    color: var(--cds-text-primary);
    margin: 0 0 var(--cds-spacing-05);
  }
  
  /* Mobile breakpoint */
  @media (max-width: 672px) {
    .bx--header__nav {
      display: none; /* Hide desktop nav, show in side panel */
    }
  }
}
```

### 3.3 Side Navigation (Left Panel)

**File**: `src/styles/components.css`

```css
@layer components {
  .bx--side-nav {
    position: fixed;
    top: 3rem; /* 48px */
    left: 0;
    bottom: 0;
    z-index: 998;
    width: 16rem; /* 256px - Carbon side nav width */
    background: var(--cds-background);
    border-inline-end: 1px solid var(--cds-border-subtle);
    transform: translateX(-100%);
    transition: transform 0.24s cubic-bezier(0.2, 0, 0, 1);
    overflow-y: auto;
  }
  
  .bx--side-nav[aria-expanded="true"],
  .bx--side-nav--expanded {
    transform: translateX(0);
  }
  
  .bx--side-nav__overlay {
    position: fixed;
    inset: 0;
    z-index: 997;
    background: rgb(0 0 0 / 50%);
    opacity: 0;
    visibility: hidden;
    transition: 
      opacity 0.24s cubic-bezier(0.2, 0, 0, 1),
      visibility 0.24s cubic-bezier(0.2, 0, 0, 1);
  }
  
  .bx--side-nav--expanded ~ .bx--side-nav__overlay {
    opacity: 1;
    visibility: visible;
  }
  
  .bx--side-nav__navigation {
    padding: var(--cds-spacing-05);
  }
  
  .bx--side-nav__items {
    list-style: none;
    margin: 0;
    padding: 0;
    display: flex;
    flex-direction: column;
    gap: var(--cds-spacing-01);
  }
  
  .bx--side-nav__item {
    display: flex;
    flex-direction: column;
  }
  
  .bx--side-nav__link {
    display: flex;
    align-items: center;
    min-height: 3rem; /* 48px - touch target */
    padding: var(--cds-spacing-03) var(--cds-spacing-05);
    color: var(--cds-text-secondary);
    text-decoration: none;
    font-size: var(--cds-productive-body-01);
    transition: 
      background-color 0.15s ease,
      color 0.15s ease;
  }
  
  .bx--side-nav__link:hover {
    background: var(--cds-background-hover);
    color: var(--cds-text-primary);
  }
  
  .bx--side-nav__link[aria-current="page"],
  .bx--side-nav__link--active {
    background: var(--cds-background-selected);
    color: var(--cds-text-primary);
  }
  
  .bx--side-nav__link-text {
    margin-inline-start: var(--cds-spacing-05);
  }
  
  /* Mobile: side nav visible when expanded */
  @media (max-width: 672px) {
    .bx--side-nav {
      width: 80%;
      max-width: 18rem;
    }
  }
}
```

## Phase 4: Search Component (Priority: Medium)

### 4.1 Carbon Search (Pagefind Integration)

**File**: `src/styles/components.css`

```css
@layer components {
  .bx--search {
    display: flex;
    align-items: center;
    position: relative;
  }
  
  /* Search - Default Medium (40px) */
  .bx--search--medium {
    height: 2.5rem; /* 40px */
  }
  
  .bx--search__wrapper {
    position: relative;
    width: 100%;
    height: 100%;
  }
  
  .bx--search__input {
    width: 100%;
    height: 100%;
    padding: 0 var(--cds-spacing-09) 0 var(--cds-spacing-05); /* 48px right, 16px left */
    border: 1px solid var(--cds-border-subtle);
    border-radius: 0; /* Carbon search is square */
    background: var(--cds-field);
    color: var(--cds-text-primary);
    font-size: var(--cds-productive-body-01); /* 14px */
    font-weight: var(--cds-font-weight-regular);
    transition: 
      border-color 0.15s ease,
      background-color 0.15s ease;
  }
  
  .bx--search__input::placeholder {
    color: var(--cds-text-placeholder);
  }
  
  .bx--search__input:hover {
    background: var(--cds-field-hover);
  }
  
  .bx--search__input:focus {
    outline: 2px solid var(--cds-focus);
    outline-offset: -2px;
    border-color: var(--cds-border-interactive);
  }
  
  .bx--search__icon {
    position: absolute;
    top: 50%;
    left: var(--cds-spacing-05);
    transform: translateY(-50%);
    width: 1rem; /* 16px */
    height: 1rem; /* 16px */
    color: var(--cds-icon-secondary);
    pointer-events: none;
  }
  
  .bx--search__close {
    position: absolute;
    top: 50%;
    right: var(--cds-spacing-03);
    transform: translateY(-50%);
    width: 2rem; /* 32px */
    height: 2rem; /* 32px */
    padding: 0;
    background: transparent;
    border: none;
    color: var(--cds-icon-secondary);
    cursor: pointer;
    display: none; /* Show when input has value */
  }
  
  .bx--search__close:hover {
    background: var(--cds-background-hover);
  }
  
  .bx--search--active .bx--search__close {
    display: flex;
    align-items: center;
    justify-content: center;
  }
  
  /* Search results panel */
  .bx--search__results {
    position: absolute;
    top: calc(100% + var(--cds-spacing-03));
    left: 0;
    right: 0;
    background: var(--cds-background);
    border: 1px solid var(--cds-border-subtle);
    max-height: 24rem;
    overflow-y: auto;
    z-index: 100;
  }
}
```

## Phase 5: Language Dropdown (Priority: Medium)

### 5.1 Carbon Dropdown

**File**: `src/styles/components.css`

```css
@layer components {
  .bx--dropdown {
    position: relative;
    display: inline-block;
  }
  
  /* Dropdown - Default Small (32px) for header */
  .bx--dropdown--small .bx--dropdown__trigger {
    height: 2rem; /* 32px */
  }
  
  /* Dropdown - Default Medium (40px) */
  .bx--dropdown--medium .bx--dropdown__trigger {
    height: 2.5rem; /* 40px */
  }
  
  .bx--dropdown__trigger {
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%;
    min-width: 12rem;
    padding: 0 var(--cds-spacing-05);
    background: var(--cds-field);
    border: 1px solid var(--cds-border-subtle);
    color: var(--cds-text-primary);
    font-size: var(--cds-productive-body-01);
    cursor: pointer;
    transition: 
      border-color 0.15s ease,
      background-color 0.15s ease;
  }
  
  .bx--dropdown__trigger:hover {
    background: var(--cds-field-hover);
    border-color: var(--cds-border-strong);
  }
  
  .bx--dropdown__trigger:focus {
    outline: 2px solid var(--cds-focus);
    outline-offset: -2px;
  }
  
  .bx--dropdown__text {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  
  .bx--dropdown__chevron {
    width: 1rem; /* 16px */
    height: 1rem; /* 16px */
    color: var(--cds-icon-secondary);
    transition: transform 0.15s ease;
  }
  
  .bx--dropdown--open .bx--dropdown__chevron {
    transform: rotate(180deg);
  }
  
  .bx--dropdown__menu {
    position: absolute;
    top: calc(100% + var(--cds-spacing-01));
    left: 0;
    right: 0;
    list-style: none;
    margin: 0;
    padding: 0;
    background: var(--cds-background);
    border: 1px solid var(--cds-border-subtle);
    box-shadow: 0 4px 8px rgb(0 0 0 / 10%);
    z-index: 100;
    max-height: 18rem;
    overflow-y: auto;
  }
  
  .bx--dropdown__menu[hidden] {
    display: none;
  }
  
  .bx--dropdown__item {
    display: block;
    padding: var(--cds-spacing-03) var(--cds-spacing-05);
    color: var(--cds-text-secondary);
    font-size: var(--cds-productive-body-01);
    text-decoration: none;
    transition: 
      background-color 0.15s ease,
      color 0.15s ease;
  }
  
  .bx--dropdown__item:hover {
    background: var(--cds-background-hover);
    color: var(--cds-text-primary);
  }
  
  .bx--dropdown__item[aria-current="page"],
  .bx--dropdown__item--selected {
    background: var(--cds-background-selected);
    color: var(--cds-text-primary);
    font-weight: var(--cds-font-weight-semibold);
  }
}
```

## Phase 6: Editorial Components (Priority: Medium)

### 6.1 Hero Section

**File**: `src/styles/components.css`

```css
@layer components {
  .bx--hero {
    padding-block: var(--cds-spacing-09) var(--cds-spacing-07); /* 48px 32px */
    max-width: var(--cds-fixed-width);
  }
  
  .bx--hero__eyebrow {
    display: block;
    font-size: var(--cds-productive-heading-01); /* 14px */
    font-weight: var(--cds-font-weight-semibold);
    color: var(--cds-text-secondary);
    text-transform: uppercase;
    letter-spacing: 0.08em;
    margin-block-end: var(--cds-spacing-03);
  }
  
  .bx--hero__title {
    font-size: var(--cds-expressive-heading-05); /* 32px */
    font-weight: var(--cds-font-weight-semibold);
    color: var(--cds-text-primary);
    line-height: var(--cds-leading-heading);
    max-width: 20ch;
    margin-block-end: var(--cds-spacing-05);
    letter-spacing: var(--cds-letter-spacing-heading);
  }
  
  .bx--hero__lead {
    font-size: var(--cds-productive-body-02); /* 16px */
    color: var(--cds-text-secondary);
    max-width: 48ch;
    line-height: 1.5;
  }
}
```

### 6.2 Section Heading

**File**: `src/styles/components.css`

```css
@layer components {
  .bx--section-heading {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    gap: var(--cds-spacing-05);
    padding-block-end: var(--cds-spacing-03);
    border-block-end: 1px solid var(--cds-border-subtle);
    margin-block-end: var(--cds-spacing-05);
  }
  
  .bx--section-heading__title {
    font-size: var(--cds-productive-heading-02); /* 16px */
    font-weight: var(--cds-font-weight-semibold);
    color: var(--cds-text-primary);
    margin: 0;
  }
  
  .bx--section-heading__action {
    font-size: var(--cds-productive-body-01); /* 14px */
  }
}
```

### 6.3 Post List (Editorial Flow)

**File**: `src/styles/components.css`

```css
@layer components {
  .bx--post-list {
    list-style: none;
    margin: 0;
    padding: 0;
    display: flex;
    flex-direction: column;
    gap: var(--cds-spacing-05);
  }
  
  .bx--post-list__item {
    display: grid;
    grid-template-columns: 8ch 1fr;
    gap: 0 var(--cds-spacing-05);
    align-items: baseline;
  }
  
  .bx--post-list__date {
    font-size: var(--cds-productive-body-01); /* 14px */
    color: var(--cds-text-secondary);
    font-variant-numeric: tabular-nums;
    white-space: nowrap;
  }
  
  .bx--post-list__title {
    font-size: var(--cds-productive-body-02); /* 16px */
    font-weight: var(--cds-font-weight-semibold);
    color: var(--cds-text-primary);
    margin: 0;
  }
  
  .bx--post-list__title a {
    color: inherit;
    text-decoration: none;
    transition: color 0.15s ease;
  }
  
  .bx--post-list__title a:hover {
    color: var(--cds-text-link);
  }
  
  .bx--post-list__meta {
    grid-column: 2;
    margin-block-start: var(--cds-spacing-02);
    font-size: var(--cds-productive-body-01);
    color: var(--cds-text-secondary);
  }
  
  /* Mobile */
  @media (max-width: 480px) {
    .bx--post-list__item {
      grid-template-columns: 1fr;
    }
    
    .bx--post-list__date {
      order: 2;
    }
    
    .bx--post-list__meta {
      display: none;
    }
  }
}
```

### 6.4 Standalone Link

**File**: `src/styles/components.css`

```css
@layer components {
  .bx--link {
    display: inline-flex;
    align-items: center;
    gap: var(--cds-spacing-02);
    color: var(--cds-link-primary);
    text-decoration: underline;
    text-decoration-thickness: max(1px, 0.08em);
    text-underline-offset: 0.15em;
    text-decoration-skip-ink: auto;
    font-size: var(--cds-productive-body-01);
    transition: color 0.15s ease;
  }
  
  /* Standalone link (not inline) */
  .bx--link--standalone {
    text-decoration: none;
  }
  
  .bx--link--standalone:hover {
    color: var(--cds-link-primary-hover);
    text-decoration: underline;
    text-decoration-thickness: max(1px, 0.08em);
    text-underline-offset: 0.15em;
    text-decoration-skip-ink: auto;
  }
  
  .bx--link__icon {
    width: 1rem; /* 16px */
    height: 1rem; /* 16px */
    flex-shrink: 0;
  }
  
  /* Inline link (within text) */
  .bx--link--inline {
    text-decoration: underline;
    text-decoration-thickness: max(1px, 0.08em);
    text-underline-offset: 0.15em;
    text-decoration-skip-ink: auto;
  }
}
```

## Phase 7: Footer (Priority: Low)

### 7.1 Carbon Footer

**File**: `src/styles/components.css`

```css
@layer components {
  .bx--footer {
    padding-block: var(--cds-spacing-07) var(--cds-spacing-05);
    border-block-start: 1px solid var(--cds-border-subtle);
    background: var(--cds-background);
    margin-block-start: auto;
  }
  
  .bx--footer__content {
    display: flex;
    flex-wrap: wrap;
    justify-content: space-between;
    align-items: center;
    gap: var(--cds-spacing-05);
    max-width: var(--cds-fixed-width);
    margin-inline: auto;
    padding-inline: var(--cds-spacing-05);
  }
  
  .bx--footer__text {
    font-size: var(--cds-productive-body-01);
    color: var(--cds-text-secondary);
  }
  
  .bx--footer__links {
    display: flex;
    gap: var(--cds-spacing-05);
    list-style: none;
    margin: 0;
    padding: 0;
  }
  
  .bx--footer__link {
    font-size: var(--cds-productive-body-01);
    color: var(--cds-text-secondary);
    text-decoration: none;
    transition: color 0.15s ease;
  }
  
  .bx--footer__link:hover {
    color: var(--cds-text-primary);
  }
}
```

## Implementation Order

1. **Week 1**: Foundation (tokens, typography, grid)
2. **Week 2**: Core shell (header, nav, skip link)
3. **Week 3**: Interactive components (search, dropdown)
4. **Week 4**: Editorial components (hero, post list, links)
5. **Week 5**: Pages (archive, article, about)
6. **Week 6**: Polish (accessibility, states, testing)

## Testing Checklist

- [ ] All interactive states (hover, focus, active) match Carbon specs
- [ ] Color contrast meets WCAG 2.2 AA
- [ ] Keyboard navigation works for all components
- [ ] Screen reader announcements are correct
- [ ] Responsive breakpoints work at 320px, 672px, 1056px, 1312px
- [ ] Dark/light theme toggle works everywhere
- [ ] Pagefind search integrates cleanly
- [ ] No layout shift on font load (use `font-display: swap`)

## Notes

- Do not import `@carbon/web-components` unless absolutely necessary
- Replicate Carbon visually with CSS, avoid JavaScript overhead
- Keep the editorial blog feel—don't make it look like a dashboard
- IBM Plex fonts can be loaded from Google Fonts or bundled locally
- All measurements must be in Carbon's 8px grid multiples

# Carbon Design System Migration — Phase 1 Complete

## Summary

Phase 1 of the Carbon Design System migration has been completed. This phase focused on **foundational tokens, typography, grid system, and core editorial components**.

## What Has Been Implemented

### 1. Carbon Design Tokens (`src/styles/base.css`)

**Full Carbon v11 White Theme (light mode)**
- All background tokens: `--cds-background`, `--cds-layer`, `--cds-field`, etc.
- All border tokens: `--cds-border-subtle`, `--cds-border-strong`, `--cds-border-interactive`
- All text tokens: `--cds-text-primary`, `--cds-text-secondary`, `--cds-text-link`
- All link tokens: `--cds-link-primary`, `--cds-link-primary-hover`
- All icon tokens: `--cds-icon-primary`, `--cds-icon-secondary`
- Focus token: `--cds-focus` (#0f62fe in light, #78a9ff in dark)
- Support colors: error, success, warning, info

**Full Carbon v11 Gray 100 Theme (dark mode)**
- Complete dark theme token mapping
- Automatic switching via `data-color-mode="dark"`

**Spacing Tokens (2x Grid — 8px base unit)**
- `--cds-spacing-01` through `--cds-spacing-13` (2px to 160px)
- Legacy aliases maintained for backward compatibility

### 2. IBM Plex Typography (`src/styles/base.css`)

**Productive Type Tokens** (UI, forms, metadata)
- `--cds-productive-heading-01` through `--cds-productive-heading-06`
- `--cds-productive-body-01`, `--cds-productive-body-02`
- `--cds-productive-body-longform` (for body copy)
- `--cds-productive-code-01`, `--cds-productive-code-02`

**Expressive Type Tokens** (hero, editorial)
- `--cds-expressive-heading-01` through `--cds-expressive-heading-06`
- `--cds-display-01` through `--cds-display-04`

**Font Loading**
- IBM Plex Sans and IBM Plex Mono loaded from Google Fonts
- `display=swap` for performance
- Fallback to system fonts

### 3. Carbon 2x Grid System (`src/styles/layout.css`)

**Grid Container**
- `.bx--grid` — standard container with 16px gutters
- `.bx--grid--full-width` — full viewport width
- `.bx--grid--condensed` — 8px gutters
- `.bx--grid--wide` — 48px gutters

**16-Column Grid**
- `.bx--col-lg-1` through `.bx--col-lg-16`
- Medium breakpoint (≤1056px): 8-column grid
- Small breakpoint (≤672px): 4-column grid (full width)

**Responsive Breakpoints**
- Large: >1056px (16 columns)
- Medium: 672px–1056px (8 columns)
- Small: <672px (4 columns, full width)

### 4. Skip Link Component (`src/styles/components.css`)

**Accessibility-First Implementation**
- `.bx--skip-to-content` — hidden by default, visible on focus
- 2px solid focus border with `--cds-focus` color
- Proper z-index (10000) to appear above all content
- WCAG 2.2 AA compliant

### 5. Editorial Components (`src/styles/components.css`)

**Hero Section**
- `.bx--hero` — container with 48px/32px vertical padding
- `.bx--hero__eyebrow` — uppercase label (productive-heading-01)
- `.bx--hero__title` — expressive-heading-05, max 20ch width
- `.bx--hero__lead` — productive-body-02, max 48ch width

**Section Heading**
- `.bx--section-heading` — flex layout with bottom border
- `.bx--section-heading__title` — productive-heading-02
- `.bx--section-heading__action` — for "View archive" links

**Post List (Editorial Flow)**
- `.bx--post-list` — vertical stack with 16px gaps
- `.bx--post-list__item` — grid layout (8ch date + content)
- `.bx--post-list__date` — productive-body-01, tabular nums
- `.bx--post-list__title` — productive-body-02, semibold
- `.bx--post-list__meta` — reading time, secondary text
- Mobile: single column, date moves below title

**Standalone Link**
- `.bx--link` — base link with Carbon underline style
- `.bx--link--standalone` — no underline until hover
- `.bx--link--inline` — always underlined (for body copy)
- `.bx--link__icon` — 16px icon slot

**Footer**
- `.bx--footer` — top border, auto margin-top
- `.bx--footer__content` — flex layout, centered
- `.bx--footer__text` — productive-body-01, secondary color
- `.bx--footer__links` — horizontal link list

## What Still Uses Legacy/Primer Tokens

The following components still reference legacy aliases but will work correctly because we maintain backward-compatible alias mappings:

- Header navigation (`.bx--header`)
- Side navigation (`.bx--side-nav`)
- Search component (`.bx--search`)
- Dropdown (`.bx--dropdown`)
- Post card (`.post-card`)
- Archive components (`.archive-*`)

These will be migrated in subsequent phases.

## Files Modified

1. **`src/style.css`** — Added IBM Plex font import
2. **`src/styles/base.css`** — Complete Carbon token replacement
3. **`src/styles/layout.css`** — Added Carbon 2x Grid system
4. **`src/styles/components.css`** — Added Carbon editorial components

## Backward Compatibility

All legacy token references continue to work via aliases:

```css
/* Legacy → Carbon mapping */
--color-bg → --cds-background
--color-text → --cds-text-primary
--color-meta → --cds-text-secondary
--color-accent → --cds-link-primary
--color-border → --cds-border-strong
--color-code-bg → --cds-layer
--space-xs/s/m/l/xl → --cds-spacing-02/03/05/06/07
--font-sans → --cds-font-family-sans
--font-mono → --cds-font-family-mono
```

## Testing Checklist — Phase 1

- [x] Build succeeds without errors
- [ ] Visual regression test (home page hero)
- [ ] Visual regression test (post list)
- [ ] Dark mode toggle works
- [ ] Focus states visible with Carbon blue (#0f62fe / #78a9ff)
- [ ] Typography renders correctly (IBM Plex)
- [ ] Grid system works at all breakpoints

## Next Steps — Phase 2

Phase 2 will focus on **interactive components**:

1. **Breadcrumb** — Carbon small variant for archive/article pages
2. **Tags** — Read-only tags for article metadata
3. **Pagination Nav** — For archive page navigation
4. **Tiles** — Clickable tiles for archive view (optional)
5. **Search** — Full Carbon search component styling
6. **Dropdown** — Language selector Carbon styling

## Known Issues

None at this time. The migration maintains full backward compatibility.

## References

- [Carbon Design System v11 Docs](https://carbondesignsystem.com/)
- [Carbon 2x Grid](https://carbondesignsystem.com/elements/2x-grid/overview/)
- [Carbon Typography](https://carbondesignsystem.com/elements/typography/overview/)
- [Carbon Themes](https://carbondesignsystem.com/elements/themes/overview/)
- [Carbon Colors](https://carbondesignsystem.com/elements/color/overview/)
- [Figma — Carbon Components](https://www.figma.com/design/tVdGpdfznZUzo6LeGIKbte/-v11--Carbon-Design-System--Community-)

