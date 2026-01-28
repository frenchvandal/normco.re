# CLAUDE_PAPERMOD.md — Session Context for PaperMod Migration

> **Purpose**: This file provides quick context for Claude at the start of each
> session. Update it progressively after each work session.

---

## Quick Context (Read First)

**Project**: Migration of Hugo PaperMod theme to Lume/Deno SSG

**Goal**: Achieve 95%+ visual parity with
[PaperMod Demo](https://adityatelange.github.io/hugo-PaperMod/)

**Stack**: Deno + Lume + TypeScript + CSS (no SCSS, no JSX except OG images)

**Branch**: `dev` for all PaperMod work (never `master`)

**Key docs**:

- `PAPERMOD.md` — Detailed audit, task list, progress tracking
- `MIGRATION_STRATEGY.md` — RACI matrix, workflow, collaboration framework
- `CLAUDE.md` — General project guidelines (read once per project)

---

## Current State

> **Last updated**: January 28, 2026 — Session: Initial audit

| Metric        | Score | Notes                          |
| ------------- | ----- | ------------------------------ |
| Visual parity | ~60%  | Post cards, home hero missing  |
| Functional    | ~90%  | Components work, styling wrong |
| Pages audited | 1/6   | Home only                      |
| Sprint        | 0     | Setup phase                    |

### What's Done

- [x] Initial visual audit of home page
- [x] PAPERMOD.md updated with 25+ specific tasks
- [x] MIGRATION_STRATEGY.md created with RACI
- [x] Task IDs assigned (TASK-CARD-_, TASK-HOME-_, etc.)

### What's Blocked

| Blocker                     | Waiting on    | Impact             |
| --------------------------- | ------------- | ------------------ |
| PaperMod source code access | Human setup   | Cannot analyze CSS |
| Reference screenshots       | Human capture | Cannot validate    |

### Current Sprint

**Sprint**: 0 (Setup) **Focus**: Waiting for reference materials **Next**:
Sprint 1 — Home page implementation

---

## Reference Materials Status

| Resource              | Status     | Location                            |
| --------------------- | ---------- | ----------------------------------- |
| PaperMod repo clone   | ❌ Missing | `papermod-reference/hugo-papermod/` |
| Reference screenshots | ❌ Missing | `papermod-reference/screenshots/`   |
| PaperMod CSS source   | ❌ Missing | `hugo-papermod/assets/css/`         |
| Hugo local server     | ❌ Not run | `localhost:1313`                    |
| Playwright tests      | ❌ Not set | `tests/visual/`                     |

---

## Key Decisions Log

> Record all Human decisions here to avoid re-asking.

| Date       | Decision                                | Rationale               |
| ---------- | --------------------------------------- | ----------------------- |
| 2026-01-28 | Footer keeps commit hash + social icons | Intentional enhancement |
| —          | —                                       | —                       |

---

## Intentional Deviations from PaperMod

> Features we keep different on purpose.

| Element             | PaperMod           | normco.re            | Reason             |
| ------------------- | ------------------ | -------------------- | ------------------ |
| Footer              | Simple © + credits | © + commit + socials | Dev transparency   |
| Search              | Fuse.js            | Pagefind             | Better performance |
| Service Worker      | None               | Yes                  | Offline support    |
| OG Images           | Manual             | Auto-generated       | Automation         |
| Toast notifications | None               | Yes                  | UX feedback        |

---

## File Mapping (PaperMod → Lume)

> Quick reference for where things live.

| PaperMod (Hugo)                    | Lume equivalent                              |
| ---------------------------------- | -------------------------------------------- |
| `assets/css/core/theme-vars.css`   | `src/_includes/css/01-tokens/tokens.css`     |
| `assets/css/common/post-entry.css` | `src/_includes/css/05-layouts/post-list.css` |
| `assets/css/common/header.css`     | `src/_includes/css/05-layouts/navbar.css`    |
| `layouts/partials/post_meta.html`  | `src/_components/PostDetails.ts`             |
| `layouts/partials/entry.html`      | `src/_components/PostList.ts`                |
| `layouts/index.html`               | `src/index.page.ts`                          |
| `layouts/_default/single.html`     | `src/_includes/layouts/post.ts`              |
| `layouts/_default/archives.html`   | `src/_includes/layouts/archive.ts`           |

---

## CSS Token Mapping

> PaperMod CSS variables → Lume equivalents

| PaperMod      | Value (dark)       | Lume                 | Status    |
| ------------- | ------------------ | -------------------- | --------- |
| `--theme`     | `rgb(29,30,32)`    | `--color-background` | ✅ Mapped |
| `--entry`     | `rgb(46,46,51)`    | `--color-entry`      | ❌ Add    |
| `--primary`   | `rgb(218,218,219)` | `--color-base`       | ✅ Mapped |
| `--secondary` | `rgb(155,156,157)` | `--color-dim`        | ✅ Mapped |
| `--tertiary`  | `rgb(65,66,68)`    | `--color-line`       | ✅ Mapped |
| `--content`   | `rgb(196,196,197)` | `--color-text`       | ✅ Mapped |
| `--border`    | `rgb(51,51,51)`    | `--color-line`       | ⚠️ Check  |
| `--gap`       | `24px`             | `--spacing-lg`       | ✅ Mapped |
| `--radius`    | `8px`              | `--border-radius-lg` | ✅ Mapped |

---

## Active Tasks (Current Sprint)

> Copy from PAPERMOD.md, keep only active sprint tasks here.

**Sprint 0 — Setup** (Current)

- [ ] Human: Clone PaperMod repo
- [ ] Human: Capture reference screenshots
- [ ] Human: Confirm setup complete

**Sprint 1 — Home Page** (Next)

- [ ] TASK-TOKEN-01: Add `--color-entry` variable
- [ ] TASK-CARD-01 to 08: Post card styling
- [ ] TASK-HOME-01 to 04: Hero section
- [ ] TASK-META-01 to 05: Metadata format

---

## Session Handoff Notes

> Write notes here at end of session for next Claude instance.

### Session: January 28, 2026 (Initial)

**What was done**:

- Created comprehensive visual audit in PAPERMOD.md
- Created MIGRATION_STRATEGY.md with RACI
- Created this context file (CLAUDE_PAPERMOD.md)
- Identified 25+ specific tasks with IDs

**What's next**:

- Wait for Human to set up reference materials
- Once ready, start Sprint 1 (Home page)
- First implementation: Add `--color-entry` CSS token

**Open questions for Human**:

1. Should the search bar stay on home page? (PaperMod doesn't have it)
2. Should tags be hidden from post cards on home? (PaperMod hides them)
3. Priority: Visual parity or keep current UX enhancements?

**Gotchas to remember**:

- Deno must be installed first (`curl -fsSL https://deno.land/install.sh | sh`)
- Set `DENO_TLS_CA_STORE=system` before all deno commands
- Branch for PaperMod work is `dev`, not `master`

---

## Commands Cheatsheet

```bash
# Format & lint
export PATH="/root/.deno/bin:$PATH"
DENO_TLS_CA_STORE=system deno fmt
DENO_TLS_CA_STORE=system deno lint

# Build & serve
DENO_TLS_CA_STORE=system deno task build
DENO_TLS_CA_STORE=system deno task serve

# Git workflow
git checkout dev
git pull origin dev
# ... make changes ...
git add <files>
git commit -m "feat: description"
git push origin dev
```

---

## How to Use This File

### At Session Start (Claude)

1. Read this file first for quick context
2. Check "Current State" section for progress
3. Check "What's Blocked" for any blockers
4. Check "Session Handoff Notes" for last session's notes
5. Ask Human if anything changed since last session

### At Session End (Claude)

1. Update "Current State" section with new progress
2. Update "What's Blocked" if blockers changed
3. Update "Active Tasks" with completed/new tasks
4. Write "Session Handoff Notes" for next Claude
5. Commit this file with session update

### After Each Sprint (Human + Claude)

1. Move completed tasks to PAPERMOD.md "What's Done"
2. Update scores in "Current State"
3. Add any new decisions to "Key Decisions Log"
4. Update "Reference Materials Status" if changed

---

## Quick Links

- **PaperMod Demo**: https://adityatelange.github.io/hugo-PaperMod/
- **PaperMod Repo**: https://github.com/adityatelange/hugo-PaperMod
- **PaperMod Wiki**: https://github.com/adityatelange/hugo-PaperMod/wiki
- **Lume Docs**: https://lume.land/
- **Project Repo**: https://github.com/frenchvandal/normco.re

---

_File version: 1.0_ _Created: January 28, 2026_ _Last session: January 28, 2026_
