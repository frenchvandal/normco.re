# PaperMod Migration Strategy

## Human / Claude / AI Agent Collaboration Framework

---

## 1. Objective

Achieve **95%+ visual and functional parity** with the Hugo PaperMod theme while
maintaining the Lume/Deno architecture and preserving intentional enhancements
(service worker, OG images, toast notifications, etc.).

**Target completion**: Iterative sprints until visual parity is validated.

---

## 2. Current State Assessment

| Aspect                | Status | Gap    |
| --------------------- | ------ | ------ |
| Functional components | ~90%   | Low    |
| Visual/CSS parity     | ~60%   | High   |
| Layout structure      | ~65%   | Medium |
| Page coverage         | ~30%   | High   |

**Pages audited**: Home page only **Pages remaining**: Single post, archive,
tags, search, static pages

---

## 3. Collaboration Model

### 3.1 Roles Definition

| Role               | Description                                                        |
| ------------------ | ------------------------------------------------------------------ |
| **Human (Phiphi)** | Project owner, decision maker, visual validator, environment setup |
| **Claude**         | Code implementation, analysis, documentation, testing              |
| **AI Agent**       | Automated tasks (screenshots, comparisons, CI checks)              |

### 3.2 RACI Matrix

**Legend**: R = Responsible, A = Accountable, C = Consulted, I = Informed

#### Phase 1: Setup & Reference Materials

| Task                                      | Human | Claude | AI Agent |
| ----------------------------------------- | ----- | ------ | -------- |
| Clone PaperMod repo to reference branch   | **R** | C      | —        |
| Run Hugo locally with PaperMod            | **R** | I      | —        |
| Capture reference screenshots (all pages) | **R** | C      | A        |
| Analyze PaperMod CSS source               | I     | **R**  | —        |
| Map PaperMod variables to Lume tokens     | I     | **R**  | —        |
| Document all PaperMod page types          | C     | **R**  | —        |

#### Phase 2: Implementation

| Task                                   | Human | Claude | AI Agent |
| -------------------------------------- | ----- | ------ | -------- |
| Implement CSS token changes            | I     | **R**  | —        |
| Refactor PostList component            | I     | **R**  | —        |
| Refactor PostDetails component         | I     | **R**  | —        |
| Update home page layout                | I     | **R**  | —        |
| Update navigation structure            | C     | **R**  | —        |
| Create new components (HomeInfo, etc.) | I     | **R**  | —        |
| Code review & approve changes          | **R** | C      | —        |
| Decide on intentional deviations       | **R** | C      | —        |

#### Phase 3: Validation

| Task                                   | Human | Claude | AI Agent |
| -------------------------------------- | ----- | ------ | -------- |
| Run Playwright visual regression tests | I     | **R**  | **A**    |
| Manual visual comparison               | **R** | C      | —        |
| Cross-browser testing                  | **R** | C      | A        |
| Mobile device testing                  | **R** | I      | —        |
| Approve final visual parity            | **R** | I      | —        |

#### Phase 4: Documentation & Cleanup

| Task                                      | Human | Claude | AI Agent |
| ----------------------------------------- | ----- | ------ | -------- |
| Update PAPERMOD.md with completion status | I     | **R**  | —        |
| Document intentional deviations           | C     | **R**  | —        |
| Clean up reference materials              | **R** | I      | —        |
| Final review and merge to main            | **R** | C      | —        |

---

## 4. What Claude Needs From Human

### 4.1 Essential (Blocking)

| Item                            | Why needed                           | Format                 |
| ------------------------------- | ------------------------------------ | ---------------------- |
| **PaperMod source code access** | Read CSS, templates, config          | Git branch or folder   |
| **Reference screenshots**       | Visual comparison for all page types | PNG files, labeled     |
| **Decision on deviations**      | Some differences may be intentional  | Yes/No list            |
| **Validation feedback**         | Confirm visual parity achieved       | Screenshots + comments |

### 4.2 Highly Recommended

| Item                          | Why needed                            | Format                     |
| ----------------------------- | ------------------------------------- | -------------------------- |
| **Hugo local server running** | Live HTML/CSS inspection              | URL (localhost:1313)       |
| **Playwright setup**          | Automated visual regression           | npm/deno package installed |
| **Browser DevTools exports**  | Computed styles for specific elements | JSON or text               |

### 4.3 Nice to Have

| Item                          | Why needed                    | Format                |
| ----------------------------- | ----------------------------- | --------------------- |
| **Figma/design specs**        | Pixel-perfect measurements    | Figma link or exports |
| **PaperMod config.yaml**      | Understand enabled features   | YAML file             |
| **Priority ranking of pages** | Focus on most important first | Ordered list          |

---

## 5. Proposed Workflow

### 5.1 Sprint Structure

Each sprint focuses on **one page type** until visual parity is achieved.

```
┌─────────────────────────────────────────────────────────────────────┐
│                         SPRINT CYCLE                                │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐     │
│  │  HUMAN   │    │  CLAUDE  │    │  HUMAN   │    │  CLAUDE  │     │
│  │ Provide  │───▶│ Analyze  │───▶│ Validate │───▶│  Adjust  │──┐  │
│  │ Reference│    │ & Code   │    │ & Review │    │  & Fix   │  │  │
│  └──────────┘    └──────────┘    └──────────┘    └──────────┘  │  │
│       │                                               │         │  │
│       │              ┌──────────┐                     │         │  │
│       │              │  HUMAN   │                     │         │  │
│       └─────────────▶│ Approve  │◀────────────────────┘         │  │
│                      │ & Merge  │                               │  │
│                      └──────────┘                               │  │
│                           │                                     │  │
│                           ▼                                     │  │
│                    Next Sprint ◀────────────────────────────────┘  │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

### 5.2 Sprint Order (Recommended)

| Sprint | Page Type       | Complexity | Dependencies         |
| ------ | --------------- | ---------- | -------------------- |
| 1      | **Home page**   | High       | CSS tokens, PostList |
| 2      | **Single post** | High       | PostDetails, TOC     |
| 3      | **Archive**     | Medium     | ArchiveList          |
| 4      | **Tags**        | Low        | Archive styles       |
| 5      | **Search**      | Low        | Pagefind styling     |
| 6      | **Navigation**  | Medium     | All pages affected   |

### 5.3 Communication Protocol

| Event                | Human action               | Claude action            |
| -------------------- | -------------------------- | ------------------------ |
| Sprint start         | Provide screenshot(s)      | Analyze & create tasks   |
| Implementation ready | —                          | Commit & notify          |
| Review needed        | Compare & provide feedback | —                        |
| Feedback received    | —                          | Adjust code              |
| Sprint complete      | Approve & confirm          | Update PAPERMOD.md       |
| Blocker encountered  | Provide missing resource   | Document blocker clearly |

---

## 6. Reference Materials Setup

### 6.1 Recommended Folder Structure

```
normco.re/
├── papermod-reference/              # NEW: Reference materials
│   ├── hugo-papermod/               # PaperMod theme source
│   │   ├── assets/
│   │   │   └── css/
│   │   │       ├── common/          # Main CSS files
│   │   │       └── core/            # Variables, reset
│   │   ├── layouts/
│   │   │   ├── _default/            # Base templates
│   │   │   ├── partials/            # Components
│   │   │   └── shortcodes/          # Shortcodes
│   │   └── exampleSite/
│   │       ├── config.yml           # Full config example
│   │       └── content/             # Demo content
│   │
│   └── screenshots/                 # Reference screenshots
│       ├── desktop/
│       │   ├── home-light.png
│       │   ├── home-dark.png
│       │   ├── post-light.png
│       │   ├── post-dark.png
│       │   ├── archive-light.png
│       │   ├── archive-dark.png
│       │   ├── tags-light.png
│       │   ├── tags-dark.png
│       │   └── search-light.png
│       └── mobile/
│           ├── home-light.png
│           ├── home-dark.png
│           └── ...
│
├── tests/
│   └── visual/                      # NEW: Playwright tests
│       ├── playwright.config.ts
│       ├── home.spec.ts
│       ├── post.spec.ts
│       └── snapshots/               # Generated snapshots
│
└── src/                             # Existing source code
```

### 6.2 Setup Commands (for Human)

```bash
# 1. Create reference branch and folder
git checkout -b papermod-reference
mkdir -p papermod-reference/hugo-papermod
mkdir -p papermod-reference/screenshots/{desktop,mobile}

# 2. Clone PaperMod theme (sparse checkout for efficiency)
cd papermod-reference
git clone --depth 1 https://github.com/adityatelange/hugo-PaperMod.git hugo-papermod

# 3. Get exampleSite content
cd hugo-papermod
git fetch origin exampleSite
git checkout origin/exampleSite -- exampleSite/

# 4. Run Hugo locally (requires Hugo installed)
cd exampleSite
hugo server -D --themesDir ../..

# 5. Capture screenshots (manual or with tool)
# Visit http://localhost:1313 and screenshot each page type
# Save to papermod-reference/screenshots/desktop/
```

### 6.3 Screenshot Checklist

For each screenshot, capture **both light and dark modes**:

- [ ] Home page (posts list mode)
- [ ] Home page (profile mode, if different config)
- [ ] Single post (with TOC visible)
- [ ] Single post (with cover image)
- [ ] Single post (footer: share buttons, related posts)
- [ ] Archive page
- [ ] Tags list page
- [ ] Single tag page
- [ ] Search page (with results)
- [ ] Search page (empty state)
- [ ] 404 page
- [ ] Mobile: Home page
- [ ] Mobile: Navigation menu open
- [ ] Mobile: Single post

---

## 7. Playwright Visual Testing Setup

### 7.1 Installation

```bash
# Using Deno
deno add npm:@playwright/test
npx playwright install chromium

# Or using npm
npm init -y
npm install -D @playwright/test
npx playwright install chromium
```

### 7.2 Basic Config (for Claude to create)

```typescript
// tests/visual/playwright.config.ts
import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./tests/visual",
  snapshotDir: "./tests/visual/snapshots",
  use: {
    baseURL: "http://localhost:3000", // Lume dev server
    screenshot: "only-on-failure",
  },
  projects: [
    {
      name: "desktop-light",
      use: { colorScheme: "light", viewport: { width: 1280, height: 720 } },
    },
    {
      name: "desktop-dark",
      use: { colorScheme: "dark", viewport: { width: 1280, height: 720 } },
    },
    {
      name: "mobile-light",
      use: { colorScheme: "light", viewport: { width: 375, height: 667 } },
    },
  ],
});
```

### 7.3 Example Test (for Claude to create)

```typescript
// tests/visual/home.spec.ts
import { expect, test } from "@playwright/test";

test("home page matches reference", async ({ page }) => {
  await page.goto("/");
  await expect(page).toHaveScreenshot("home.png", {
    maxDiffPixelRatio: 0.05, // 5% tolerance
  });
});
```

---

## 8. Success Criteria

### 8.1 Visual Parity Checklist

| Element              | Criteria                                      |
| -------------------- | --------------------------------------------- |
| Post card background | Distinct from page background in dark mode    |
| Post card layout     | Title → Description → Metadata (bottom)       |
| Metadata format      | "Date · X min · Author" (no "by", no "read")  |
| Home hero            | Bold title, markdown content, social icons    |
| Navigation structure | Theme toggle after logo, separator, lang flag |
| Archive timeline     | Year headers with vertical line               |
| Typography           | Bold titles (not italic)                      |
| Colors (dark mode)   | Match PaperMod RGB values ±5                  |
| Spacing              | Match PaperMod --gap (24px)                   |
| Border radius        | Match PaperMod --radius (8px)                 |

### 8.2 Acceptance Threshold

- **Visual diff**: < 5% pixel difference per page
- **Manual approval**: Human confirms "looks like PaperMod"
- **No regressions**: Existing functionality preserved

---

## 9. Risk Mitigation

| Risk                                 | Mitigation                                  |
| ------------------------------------ | ------------------------------------------- |
| Hugo templates too different from TS | Focus on CSS/visual, not template structure |
| PaperMod has Hugo-specific features  | Document as "not applicable" in Lume        |
| Scope creep (endless tweaking)       | Define "good enough" threshold per sprint   |
| Missing reference screenshots        | Use WebFetch on live PaperMod demo site     |
| Human availability bottleneck        | Batch validation sessions, async feedback   |

---

## 10. Quick Start Checklist

### For Human (do once)

- [ ] Create `papermod-reference/` folder structure
- [ ] Clone PaperMod repo with exampleSite
- [ ] Run Hugo locally OR provide live PaperMod URL
- [ ] Capture screenshots for all page types (light + dark)
- [ ] Commit reference materials to branch
- [ ] Notify Claude that setup is complete

### For Claude (ongoing)

- [ ] Read PaperMod CSS source and map to Lume tokens
- [ ] Create TASK list for each sprint
- [ ] Implement changes and commit
- [ ] Update PAPERMOD.md after each sprint
- [ ] Request validation from Human

---

## 11. Communication Templates

### Human → Claude: Starting a Sprint

```
Sprint [N]: [Page Type]

Reference screenshots attached:
- desktop-light.png
- desktop-dark.png
- (optional) mobile-light.png

Priority elements to match:
1. [specific element]
2. [specific element]

Intentional deviations allowed:
- [element]: [reason]
```

### Claude → Human: Sprint Complete

```
Sprint [N] complete: [Page Type]

Changes made:
- [file]: [description]
- [file]: [description]

Commits: [hash1], [hash2]

Ready for validation. Please compare:
- Current site: [localhost URL or screenshot]
- Reference: papermod-reference/screenshots/[file]

Questions/blockers:
- [if any]
```

### Human → Claude: Validation Feedback

```
Validation for Sprint [N]:

✅ Approved elements:
- [element]

❌ Needs adjustment:
- [element]: [specific issue]

📸 Updated screenshot attached (if needed)
```

---

## 12. Next Immediate Actions

### Human

1. **Create reference folder** and clone PaperMod repo
2. **Capture 10-15 reference screenshots** (see checklist in §6.3)
3. **Reply with**: "Setup complete, screenshots in
   `papermod-reference/screenshots/`"

### Claude

1. **Wait for setup confirmation**
2. **Read PaperMod CSS** from `papermod-reference/hugo-papermod/assets/css/`
3. **Start Sprint 1** (Home page) with detailed implementation plan

---

_Document version: 1.0_ _Last updated: January 28, 2026_ _Authors: Claude +
Phiphi (collaborative)_
