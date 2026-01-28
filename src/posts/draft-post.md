---
title: Work in Progress
description: This is a draft post to demonstrate the draft indicator feature.
date: 2026-01-28
author: phiphi
tags:
  - Draft
  - Demo
draft: true
---

This post is marked as a draft and will display a draft badge indicator.

<!--more-->

## Why Draft Mode?

Draft mode allows you to work on content without publishing it to the live site.
Posts with `draft: true` in the front matter will:

- Display a "Draft" badge next to the title
- Still be visible in the development environment for preview
- Be excluded from production builds (depending on configuration)

## Front Matter Example

```yaml
---
title: My Draft Post
description: A post I'm still working on
date: 2026-01-28
draft: true
---
```

## When to Use Drafts

- Writing long-form content over multiple sessions
- Preparing posts for future publication
- Testing layout changes with real content
- Collaborative editing before final review

This post will show the draft badge in both list and single views!
