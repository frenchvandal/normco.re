# UI Component Usage Guide

This guide explains how to use the design system components in Lume templates
and content. The focus is on the components currently implemented in this
codebase and the APIs that are already wired up in `main.js`.

---

## Table of Contents

1. [Tabs](#tabs)
2. [Toast Notifications](#toast-notifications)
3. [Modal](#modal)
4. [Post List](#post-list)
5. [Post Details](#post-details)
6. [Pagination](#pagination)
7. [Meta Tags](#meta-tags)
8. [Form Components](#form-components)
9. [Navigation Components](#navigation-components)
10. [Tooltip](#tooltip)
11. [Skeleton Loaders](#skeleton-loaders)

---

## Tabs

### Lume Usage

```typescript
// In a .page.ts file
export default function (data: Lume.Data) {
  const { comp } = data;

  return `
    <h1>Tabs Example</h1>

    ${
    comp.tabs({
      tabs: [
        {
          label: "Overview",
          content: "<p>Project overview</p>",
        },
        {
          label: "Settings",
          content: "<p>Configuration options</p>",
        },
        {
          label: "Advanced",
          content: "<p>Advanced controls</p>",
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
${comp.tabs({ tabs: [...], variant: "pills" })}

// Boxed variant
${comp.tabs({ tabs: [...], variant: "boxed" })}

// Vertical tabs
${comp.tabs({ tabs: [...], vertical: true })}
```

### Icons and Badges

```typescript
${comp.tabs({
  tabs: [
    {
      label: "Inbox",
      content: "<p>Messages</p>",
      icon: '<svg aria-hidden="true">...</svg>',
      badge: "5",
    },
    {
      label: "Archive",
      content: "<p>Archived items</p>",
      disabled: true,
    },
  ],
})}
```

### Keyboard Navigation

- **Arrow Left/Right**: Move between tabs
- **Home**: Jump to the first tab
- **End**: Jump to the last tab

Tabs are auto-initialized by `main.js` via the `TabsManager`.

---

## Toast Notifications

The toast manager is registered globally as `window.toast` when `main.js` runs.
The base layout already includes the toast container.

### Quick API

```javascript
toast.success("Post published!");
toast.error("Save failed");
toast.warning("Unstable connection");
toast.info("Syncing in the background...", 3000);
```

### Advanced API

```javascript
toast.show({
  message: "Processing your request",
  title: "Working",
  variant: "info",
  duration: 5000, // 0 = no auto-dismiss
  closeable: true,
});

// Close all toasts
toast.dismissAll();
```

### Usage Examples

```javascript
form.addEventListener("submit", async (event) => {
  event.preventDefault();

  try {
    await saveData(formData);
    toast.success("Saved successfully", 3000);
  } catch (error) {
    toast.error("Unable to save the form");
  }
});
```

---

## Modal

Modals are rendered with `comp.modal` and controlled with the global helpers
`openModal`, `closeModal`, and `toggleModal`.

### Lume Usage

```typescript
export default function (data: Lume.Data) {
  const { comp } = data;

  return `
    <button onclick="openModal('confirm-delete')">
      Delete item
    </button>

    ${
    comp.modal({
      id: "confirm-delete",
      title: "Confirm deletion",
      content: `
          <p>Are you sure you want to delete this item?</p>
          <p>This action cannot be undone.</p>
        `,
      footer: `
          <button class="button" onclick="closeModal('confirm-delete')">
            Cancel
          </button>
          <button class="button button--primary">
            Delete
          </button>
        `,
      size: "default",
      closeable: true,
    })
  }
  `;
}
```

### Modal Sizes

- `small`
- `default`
- `large`
- `fullscreen`

### Notes

- Modals are initialized automatically by `main.js`.
- Focus trapping, ESC to close, and backdrop click handling are built in.

---

## Post List

Render a list of posts with metadata. This component expects an array of post
pages and the current page URL to set the active link.

```typescript
export default async function (data: Lume.Data) {
  const { comp, search, url } = data;
  const posts = search.pages("type=post", "date=desc");

  return `
    <section>
      <h1>Latest posts</h1>
      ${await comp.postList({ postslist: posts, url })}
    </section>
  `;
}
```

---

## Post Details

Use this component when you need to show author, date, reading time, and tags
outside of the post list.

```typescript
export default async function (data: Lume.Data) {
  const { comp } = data;

  const details = await comp.postDetails({
    author: data.author,
    date: data.date,
    tags: data.tags,
    readingInfo: data.readingInfo,
  });

  return `
    <article>
      <h1>${data.title}</h1>
      ${details}
    </article>
  `;
}
```

---

## Pagination

Pagination uses the built-in `pagination` object from Lume when a page is
configured with pagination data.

```typescript
export default function (data: Lume.Data) {
  const { comp, pagination, i18n } = data;

  return `
    <section>
      ${comp.pagination({ pagination, i18n })}
    </section>
  `;
}
```

---

## Meta Tags

The meta tags component should be called inside the document `<head>` so each
page has consistent SEO, Open Graph, and JSON-LD data.

```typescript
export default function (data: Lume.Data) {
  const { comp } = data;

  return `
    <head>
      ${comp.metaTags(data)}
    </head>
  `;
}
```

---

## Form Components

Form components are CSS-only, so no JS setup is required. Use the class names
shown below for consistent styling.

```html
<label class="input">
  <span class="input__label">Email</span>
  <input class="input__field" type="email" placeholder="you@example.com" />
</label>

<label class="select">
  <span class="select__label">Plan</span>
  <select class="select__field">
    <option>Starter</option>
    <option>Pro</option>
  </select>
</label>

<label class="checkbox">
  <input class="checkbox__input" type="checkbox" />
  <span class="checkbox__box" aria-hidden="true"></span>
  <span class="checkbox__label">Subscribe to updates</span>
</label>

<label class="switch">
  <input class="switch__input" type="checkbox" />
  <span class="switch__track" aria-hidden="true"></span>
  <span class="switch__label">Enable notifications</span>
</label>
```

---

## Navigation Components

### Breadcrumbs

```html
<nav class="breadcrumbs" aria-label="Breadcrumb">
  <ol class="breadcrumbs__list">
    <li class="breadcrumbs__item">
      <a class="breadcrumbs__link" href="/">Home</a>
      <span class="breadcrumbs__separator" aria-hidden="true">/</span>
    </li>
    <li class="breadcrumbs__item">
      <a class="breadcrumbs__link" href="/posts/">Posts</a>
      <span class="breadcrumbs__separator" aria-hidden="true">/</span>
    </li>
    <li class="breadcrumbs__item">
      <span class="breadcrumbs__current">CSS Architecture</span>
    </li>
  </ol>
</nav>
```

Breadcrumbs are styled via CSS. If you need an interactive ellipsis menu, you
can toggle the `data-state="open"` attribute on `.breadcrumbs__ellipsis-menu`
with a small script.

---

## Tooltip

Tooltips are also CSS-first. Wrap the trigger in `.tooltip-wrapper` and use a
`tooltip` element with a positioning class.

```html
<span class="tooltip-wrapper">
  <button class="button" type="button">Hover me</button>
  <span class="tooltip tooltip--top" role="tooltip">
    Helpful hint text
  </span>
</span>
```

Add `tooltip--bottom`, `tooltip--left`, or `tooltip--right` to change placement,
and optional variants like `tooltip--light`, `tooltip--success`,
`tooltip--warning`, or `tooltip--error`.

---

## Skeleton Loaders

Skeleton loaders are CSS-only. Apply the base class plus a size variant.

```html
<div class="skeleton skeleton--heading"></div>
<div class="skeleton skeleton--text"></div>
<div class="skeleton skeleton--text skeleton--text-sm"></div>
<div class="skeleton skeleton--rect"></div>
```

Use these placeholders while content is loading to keep layout stability.
