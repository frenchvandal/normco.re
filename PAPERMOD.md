# The PaperMod project → Lume Migration Feasibility (Hugo → Lume)

This document assesses the feasibility, cost, and feature impact of migrating
the Hugo PaperMod theme to the current Lume-based site. It outlines what is
feasible, what is risky or infeasible, which PaperMod features are likely to be
lost under Lume, and which existing Lume site features could be lost by adopting
PaperMod.

## MUST-DO

- All merge requests and commits related to the PaperMod project must be done in
  the `dev` branch, never the `master` branch, unless explicitly stated
  otherwise by the human user.
- No `deno test --coverage` required for tasks related to the PaperMod project.

## Reference documentation for Hugo and PaperMod

- https://github.com/adityatelange/hugo-PaperMod
- https://adityatelange.github.io/hugo-PaperMod/
- https://github.com/adityatelange/hugo-PaperMod/wiki
- https://gohugo.io

## Reference documentation for Deno and Lume

- https://docs.deno.com/runtime/
- https://lume.land/docs/overview/about-lume/

## Scope & assumptions

- Target: Port PaperMod’s **visual system and UX** to Lume (not Hugo itself).
- Preserve the current content model (Markdown posts + Lume pages).
- Avoid new dependencies unless strictly required.
- Do not modify generated output in `_site/`.
- Keep a `licence.css` file in Lume and add `Copyright (c) 2026 frenchvandal`.

## High-level feasibility

**Verdict:** Feasible with moderate effort. PaperMod is primarily a theme (HTML,
CSS, JS, and Hugo templates). Lume can reproduce most of the UX and layout
patterns using custom layouts and components. The main risks lie in
Hugo-specific features (image processing, shortcodes, taxonomies) that require
Lume equivalents.

## Estimated cost (rough order of magnitude)

> These are rough estimates for a first functional parity pass. They do not
> include visual polish or refinements beyond PaperMod’s baseline.

| Workstream                               | Effort   | Notes                                        |
| ---------------------------------------- | -------- | -------------------------------------------- |
| Core layout + typography + spacing       | 3–5 days | Port base HTML/SCSS structure and tokens.    |
| Navigation, header, footer, social icons | 1–2 days | Lume components + data mapping.              |
| Post templates (list + single)           | 2–4 days | Includes cover, metadata, TOC, reading time. |
| Search UI integration                    | 1–2 days | Map PaperMod search UI to Pagefind.          |
| Theme switch (dark/light)                | 1–2 days | CSS vars + JS toggle + persistence.          |
| Taxonomies (tags, categories, series)    | 2–4 days | Lume data + archive pages.                   |
| Shortcodes & Hugo-only features          | 2–5 days | Identify and reimplement manually.           |
| QA + polish                              | 2–4 days | Cross-browser, responsive, accessibility.    |

**Total:** ~14–28 days for a realistic parity port, depending on how many of
PaperMod’s optional features are required.

## Feasible feature mapping (PaperMod → Lume)

| PaperMod feature             | Feasibility in Lume         | Notes / approach                               |
| ---------------------------- | --------------------------- | ---------------------------------------------- |
| Light/dark theme + toggle    | ✅ Feasible                 | Use CSS variables + localStorage toggle in JS. |
| Responsive layout            | ✅ Feasible                 | SCSS/CSS port.                                 |
| Search (PaperMod)            | ✅ Feasible (UI), ⚠️ parity | Replace with Pagefind UI + index.              |
| Table of contents            | ✅ Feasible                 | Use existing TOC Markdown plugin.              |
| Reading time                 | ✅ Feasible                 | Already provided by Lume reading_info plugin.  |
| Syntax highlighting          | ✅ Feasible                 | Already provided by Prism plugin.              |
| Social icons                 | ✅ Feasible                 | Map from Lume data to icons.                   |
| Breadcrumbs                  | ✅ Feasible                 | Build from URL path or data.                   |
| Post cover image             | ✅ Feasible                 | Use front matter + layout logic.               |
| Archive/tag pages            | ✅ Feasible                 | Use Lume pagination + data collections.        |
| Share buttons                | ✅ Feasible                 | Simple link templates; no dependency needed.   |
| RSS/JSON feeds               | ✅ Feasible                 | Already configured in Lume feed plugin.        |
| Multi-language (i18n)        | ⚠️ Possible but heavier     | Requires content structure + routing strategy. |
| Related posts                | ✅ Feasible                 | Compute by tags or dates via Lume data.        |
| Author profile widget        | ✅ Feasible                 | Data-driven component.                         |
| Comments (Disqus/Utterances) | ✅ Feasible                 | Embed script in template.                      |
| SEO meta templates           | ✅ Feasible                 | Lume metas/json-ld already in use.             |

## Infeasible or high-friction features (Hugo-specific)

These features are **not impossible**, but they are **expensive** to port
cleanly and may require custom tooling outside the current repository
constraints.

- **Hugo image processing pipeline** (resizing, image resources, `.Resources`) →
  Lume does not provide Hugo’s built-in image pipeline out of the box. A custom
  build step or external tooling would be required.
- **Hugo shortcodes** for complex or theme-specific blocks → Lume would require
  custom Markdown processing or dedicated components per shortcode.
- **Hugo-specific taxonomy behavior** (for example, built-in ordering and URL
  structure defaults) → Lume can replicate this, but not automatically.
- **Hugo Pipes asset pipeline** (SCSS pipelines, bundling) → Lume has its own
  plugin-based pipeline; direct one-to-one parity is unlikely.

## PaperMod features likely to be lost under Lume

The following features commonly available in PaperMod **will be lost or
reduced** without additional custom work:

- **Hugo image processing features** (automatic resizing, WebP conversion,
  responsive srcsets) unless custom build steps are added.
- **Theme shortcodes** that rely on Hugo’s template execution (for example,
  custom blocks, galleries, figure helpers) unless manually reimplemented.
- **Exact Hugo taxonomy URL semantics** unless a matching routing layer is
  built.
- **Hugo’s `.Summary` and `.TableOfContents` behavior** if the current Lume
  Markdown pipeline does not fully mirror them.

## Current Lume features likely to be lost when adopting PaperMod

The following capabilities exist in the current Lume site and **may be lost**
when moving toward PaperMod unless explicitly rebuilt:

- **Service worker and offline support** (custom `sw.page.ts` and offline page).
- **Pagefind search integration** (UI and indexing; PaperMod uses a different
  search flow).
- **Existing archive and tag routes** tied to the current layout structure and
  data pipelines.
- **Custom JSON/LD and SEO structures** tuned for the current layout.
- **Custom Lume layouts and components** (bespoke content blocks or patterns not
  present in PaperMod).

## Suggested approach if you proceed

1. **Audit the content model** (front matter fields, existing layouts).
2. **Port PaperMod styles** into SCSS using CSS variables for theming.
3. **Rebuild the layout hierarchy** using Lume `_includes/` and `_components/`.
4. **Map PaperMod UI elements** (search, TOC, reading time, metadata) to
   existing Lume plugins.
5. **Identify missing Hugo features** and decide whether to replace, simplify,
   or drop them.
6. **Run QA on a content snapshot** to validate typography, spacing, and layout
   fidelity.

## Accepted trade-offs

1. i18n migration can be delayed; i18n will be removed from the PaperMod-based
   Lume site, as it is not currently used in production (to be handled in a
   separate project).
2. Search will rely on Pagefind UI with PaperMod-like styling.

## Recommendation

PaperMod can be ported to Lume with good parity, but it is not a drop-in
migration. The highest-cost areas are Hugo’s image pipeline and shortcodes. If
the primary goal is to refresh the visual system, selectively adopting
PaperMod’s typography, spacing, and component styling on top of the current Lume
stack will be less risky than attempting full feature parity.
