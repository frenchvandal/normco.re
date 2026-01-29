# Feature Comparison: Lume/Deno vs Hugo/PaperMod

> **Purpose**: Exhaustive feature mapping for migration validation. **Status**:
> Draft — Awaiting Human review and approval.

---

## Legend

| Symbol | Meaning                              |
| ------ | ------------------------------------ |
| ✅     | Feature exists and works             |
| ❌     | Feature does not exist               |
| ⚠️     | Partial implementation               |
| 🔄     | À migrer (1:1 migration possible)    |
| 🆕     | Keep (Lume-only feature to maintain) |
| 🗑️     | Remove (not needed)                  |
| 🔧     | Adapt (requires custom solution)     |
| ❓     | Needs Human decision                 |

---

## 1. Core SSG Features

| Feature                | Hugo                     | Lume                          | Migration     | Notes                            |
| ---------------------- | ------------------------ | ----------------------------- | ------------- | -------------------------------- |
| **Build system**       | Go-based, fast           | Deno-based                    | 🆕 Maintain   | Different stack, both performant |
| **Hot reload**         | `hugo server`            | `deno task serve`             | ✅ Equivalent | Both work                        |
| **Incremental builds** | ✅ Native                | ✅ Native                     | ✅ Equivalent |                                  |
| **Content formats**    | Markdown, HTML, Org      | Markdown, HTML, YAML, JSON    | ✅ Equivalent |                                  |
| **Front matter**       | YAML, TOML, JSON         | YAML, JSON                    | ✅ Equivalent | TOML not needed                  |
| **Data files**         | `data/` folder           | `_data.ts` + `_data/`         | ✅ Equivalent |                                  |
| **Taxonomies**         | Tags, categories, custom | Tags via search plugin        | ⚠️ Partial    | Custom taxonomies need work      |
| **Multilingual**       | Built-in i18n            | `multilanguage` plugin        | ✅ Equivalent |                                  |
| **RSS/Atom feeds**     | Built-in                 | `feed` plugin                 | ✅ Equivalent |                                  |
| **Sitemap**            | Built-in                 | `sitemap` plugin              | ✅ Equivalent |                                  |
| **Image processing**   | Built-in                 | `picture` + `transformImages` | ✅ Equivalent |                                  |
| **Asset bundling**     | Hugo Pipes               | `esbuild` + `lightningCss`    | ✅ Equivalent |                                  |
| **Minification**       | Built-in                 | `lightningCss` + `esbuild`    | ✅ Equivalent |                                  |

---

## 2. Templating System

| Feature                | Hugo                  | Lume                    | Migration     | Notes               |
| ---------------------- | --------------------- | ----------------------- | ------------- | ------------------- |
| **Template engine**    | Go templates          | TypeScript functions    | 🆕 Maintain   | TS more flexible    |
| **Layouts**            | `layouts/_default/`   | `_includes/layouts/`    | ✅ Equivalent |                     |
| **Partials**           | `layouts/partials/`   | `_components/`          | ✅ Equivalent |                     |
| **Shortcodes**         | `layouts/shortcodes/` | Components + MD plugins | 🔧 Adapt      | Use Lume components |
| **Base template**      | `baseof.html`         | `base.ts`               | ✅ Equivalent |                     |
| **Block inheritance**  | `{{ block }}`         | Function composition    | ✅ Equivalent |                     |
| **Template functions** | Hugo functions        | Lume helpers + JS       | ✅ Equivalent |                     |

---

## 3. PaperMod Theme Features

### 3.1 Home Page Modes

| Feature             | PaperMod                    | normco.re              | Migration   | Notes                      |
| ------------------- | --------------------------- | ---------------------- | ----------- | -------------------------- |
| **Home-Info mode**  | ✅ Title + content + social | ⚠️ Title + search only | 🔄 À migrer | Add content + social icons |
| **Profile mode**    | ✅ Centered avatar + bio    | ✅ Implemented         | ✅ Done     |                            |
| **Posts list mode** | ✅ Recent posts             | ✅ Implemented         | ⚠️ Style    | Card styling differs       |
| **Search on home**  | ❌ Not on home              | ✅ Present             | ❓ Decision | Keep or remove?            |

### 3.2 Navigation

| Feature                   | PaperMod               | normco.re        | Migration   | Notes                 |
| ------------------------- | ---------------------- | ---------------- | ----------- | --------------------- |
| **Logo/site title**       | ✅ Left                | ✅ Left          | ✅ Done     |                       |
| **Theme toggle position** | ✅ After logo          | ❌ Far right     | 🔄 À migrer | Move toggle           |
| **Separator `\|`**        | ✅ Between sections    | ❌ Missing       | 🔄 À migrer | Add separator         |
| **Language selector**     | ✅ Flag + code visible | ⚠️ Dropdown only | 🔄 À migrer | Change to flag format |
| **Menu items**            | ✅ Right side          | ✅ Right side    | ✅ Done     |                       |
| **External link icon**    | ✅ Arrow icon          | ❌ Missing       | 🔄 À migrer | Add ↗ icon            |
| **Search in nav**         | ✅ As menu item        | ❌ Cmd+K only    | ❓ Decision | Add nav link?         |
| **Breadcrumbs**           | ✅ Optional            | ✅ Implemented   | ✅ Done     |                       |
| **Mobile menu**           | ✅ Hamburger           | ✅ Implemented   | ✅ Done     |                       |

### 3.3 Post List / Entry Cards

| Feature                  | PaperMod                | normco.re                       | Migration   | Notes               |
| ------------------------ | ----------------------- | ------------------------------- | ----------- | ------------------- |
| **Card background**      | ✅ `--entry` color      | ❌ Same as page                 | 🔄 À migrer | Add distinct bg     |
| **Card border radius**   | ✅ 8px                  | ✅ Present                      | ⚠️ Verify   | Check value         |
| **Card padding**         | ✅ Generous             | ⚠️ Less                         | 🔄 À migrer | Increase padding    |
| **Card hover effect**    | ✅ Border + elevation   | ⚠️ Border only                  | 🔄 À migrer | Add elevation       |
| **Card active scale**    | ✅ scale(0.96)          | ✅ Implemented                  | ✅ Done     |                     |
| **Full card clickable**  | ✅ Overlay link         | ❌ Title + "Continue"           | 🔄 À migrer | Make card clickable |
| **Title position**       | ✅ Top                  | ✅ Top                          | ✅ Done     |                     |
| **Description position** | ✅ Middle               | ⚠️ After meta                   | 🔄 À migrer | Move before meta    |
| **Metadata position**    | ✅ Bottom               | ❌ Top (after title)            | 🔄 À migrer | Move to bottom      |
| **Metadata format**      | ✅ Date · Time · Author | ❌ by Author · Date · Time read | 🔄 À migrer | Change format       |
| **Tags on cards**        | ❌ Not shown            | ✅ Shown                        | 🔄 À migrer | Hide on home list   |
| **"Continue reading"**   | ❌ Not present          | ✅ Present                      | 🔄 À migrer | Remove              |
| **Cover image**          | ✅ Optional             | ✅ Implemented                  | ✅ Done     |                     |
| **Draft badge**          | ✅ Indicator            | ✅ Implemented                  | ✅ Done     |                     |

### 3.4 Single Post Page

| Feature               | PaperMod              | normco.re          | Migration     | Notes          |
| --------------------- | --------------------- | ------------------ | ------------- | -------------- |
| **Post title**        | ✅ Large, bold        | ✅ Implemented     | ✅ Done       |                |
| **Post description**  | ✅ Subtitle           | ✅ Implemented     | ✅ Done       |                |
| **Post metadata**     | ✅ Date, time, author | ✅ Implemented     | ⚠️ Format     | Check format   |
| **Tags display**      | ✅ After content      | ✅ In header       | ❓ Decision   | Keep position? |
| **Cover image**       | ✅ Full width option  | ✅ Implemented     | ✅ Done       |                |
| **Table of contents** | ✅ Sidebar/inline     | ✅ Implemented     | ✅ Done       |                |
| **TOC scroll spy**    | ✅ Highlights current | ✅ Implemented     | ✅ Done       |                |
| **Share buttons**     | ✅ Twitter, FB, etc.  | ✅ 5 platforms     | ✅ Done       |                |
| **Related posts**     | ✅ By tags            | ✅ Implemented     | ✅ Done       |                |
| **Prev/Next nav**     | ✅ At bottom          | ✅ Implemented     | ✅ Done       |                |
| **Reading time**      | ✅ Calculated         | ✅ Implemented     | ✅ Done       |                |
| **Word count**        | ✅ Optional           | ❌ Not shown       | 🗑️ Skip       | Not needed     |
| **Author info**       | ✅ Optional           | ✅ Implemented     | ✅ Done       |                |
| **Edit on GitHub**    | ✅ Optional           | ✅ Via SourceInfo  | ✅ Done       |                |
| **Comments**          | ✅ Disqus/Utterances  | ❌ Not implemented | ❓ Decision   | Add later?     |
| **Code copy button**  | ✅ On code blocks     | ✅ Implemented     | ✅ Done       |                |
| **Code highlighting** | ✅ Chroma             | ✅ Prism           | ✅ Equivalent |                |
| **Line numbers**      | ✅ Optional           | ✅ Via Prism       | ✅ Done       |                |

### 3.5 Archive Page

| Feature               | PaperMod         | normco.re      | Migration | Notes |
| --------------------- | ---------------- | -------------- | --------- | ----- |
| **Timeline layout**   | ✅ Vertical line | ✅ Implemented | ✅ Done   |       |
| **Year grouping**     | ✅ Year headers  | ✅ Implemented | ✅ Done   |       |
| **Year markers**      | ✅ Dots on line  | ✅ Implemented | ✅ Done   |       |
| **Post entries**      | ✅ Date + title  | ✅ Implemented | ✅ Done   |       |
| **Search on archive** | ✅ Optional      | ✅ Implemented | ✅ Done   |       |

### 3.6 Tags/Categories

| Feature             | PaperMod             | normco.re          | Migration     | Notes         |
| ------------------- | -------------------- | ------------------ | ------------- | ------------- |
| **Tags list page**  | ✅ `/tags/`          | ✅ In archive      | ✅ Equivalent |               |
| **Single tag page** | ✅ `/tags/xxx/`      | ✅ Implemented     | ✅ Done       |               |
| **Tag count**       | ✅ Number of posts   | ⚠️ Not shown       | 🔄 À migrer   | Add count     |
| **Categories**      | ✅ Separate taxonomy | ❌ Not implemented | 🗑️ Skip       | Use tags only |
| **Series**          | ✅ Post series       | ❌ Not implemented | 🗑️ Skip       | Not needed    |

### 3.7 Search

| Feature               | PaperMod           | normco.re         | Migration     | Notes           |
| --------------------- | ------------------ | ----------------- | ------------- | --------------- |
| **Search engine**     | Fuse.js (client)   | Pagefind (static) | 🆕 Maintain   | Pagefind better |
| **Search page**       | ✅ `/search/`      | ✅ Modal (Cmd+K)  | 🆕 Maintain   | Modal UX better |
| **Search in nav**     | ✅ Menu item       | ❌ Hidden         | ❓ Decision   | Add menu item?  |
| **Keyboard shortcut** | ❌ None            | ✅ Cmd+K          | 🆕 Maintain   | Enhancement     |
| **Search results**    | ✅ Title + excerpt | ✅ Via Pagefind   | ✅ Equivalent |                 |

### 3.8 Footer

| Feature          | PaperMod               | normco.re    | Migration   | Notes       |
| ---------------- | ---------------------- | ------------ | ----------- | ----------- |
| **Copyright**    | ✅ © Year + name       | ✅ © Year    | ✅ Done     |             |
| **Powered by**   | ✅ Hugo & PaperMod     | ❌ Not shown | 🗑️ Skip     | Not needed  |
| **Social icons** | ❌ In hero, not footer | ✅ In footer | 🆕 Maintain | Intentional |
| **Commit hash**  | ❌ Not present         | ✅ Shown     | 🆕 Maintain | Dev feature |

---

## 4. CSS/Styling

### 4.1 CSS Variables (Tokens)

| PaperMod Variable | Value (Dark)       | Lume Variable         | Status       | Migration   |
| ----------------- | ------------------ | --------------------- | ------------ | ----------- |
| `--theme`         | `rgb(29,30,32)`    | `--color-background`  | ✅ Mapped    | ✅ Done     |
| `--entry`         | `rgb(46,46,51)`    | —                     | ❌ Missing   | 🔄 À migrer |
| `--primary`       | `rgb(218,218,219)` | `--color-base`        | ✅ Mapped    | ✅ Done     |
| `--secondary`     | `rgb(155,156,157)` | `--color-dim`         | ✅ Mapped    | ✅ Done     |
| `--tertiary`      | `rgb(65,66,68)`    | `--color-line`        | ✅ Mapped    | ✅ Done     |
| `--content`       | `rgb(196,196,197)` | `--color-text`        | ✅ Mapped    | ✅ Done     |
| `--hljs-bg`       | `rgb(28,29,33)`    | `--code-background`   | ✅ Mapped    | ✅ Done     |
| `--code-bg`       | `rgb(34,35,39)`    | `--code-inline-bg`    | ⚠️ Check     | 🔄 Verify   |
| `--border`        | `rgb(51,51,51)`    | `--color-line`        | ⚠️ Different | 🔄 Verify   |
| `--gap`           | `24px`             | `--spacing-lg`        | ✅ Mapped    | ✅ Done     |
| `--radius`        | `8px`              | `--border-radius-lg`  | ✅ Mapped    | ✅ Done     |
| `--main-width`    | `720px`            | `--content-max-width` | ⚠️ 44rem     | 🔄 Verify   |
| `--header-height` | `60px`             | `--navbar-height`     | ⚠️ Check     | 🔄 Verify   |

### 4.2 CSS Variables (Light Mode)

| PaperMod Variable | Value (Light)      | Lume Variable        | Status       | Migration   |
| ----------------- | ------------------ | -------------------- | ------------ | ----------- |
| `--theme`         | `rgb(255,255,255)` | `--color-background` | ✅ Mapped    | ✅ Done     |
| `--entry`         | `rgb(255,255,255)` | —                    | ❌ Missing   | 🔄 À migrer |
| `--primary`       | `rgb(30,30,30)`    | `--color-base`       | ✅ Mapped    | ✅ Done     |
| `--secondary`     | `rgb(108,108,108)` | `--color-dim`        | ⚠️ Different | 🔄 Verify   |
| `--tertiary`      | `rgb(214,214,214)` | `--color-line`       | ⚠️ Different | 🔄 Verify   |
| `--content`       | `rgb(31,31,31)`    | `--color-text`       | ✅ Mapped    | ✅ Done     |
| `--border`        | `rgb(238,238,238)` | `--color-line`       | ⚠️ Different | 🔄 Verify   |

### 4.3 Typography

| Feature            | PaperMod        | normco.re       | Migration     | Notes         |
| ------------------ | --------------- | --------------- | ------------- | ------------- |
| **Font family**    | System stack    | System stack    | ✅ Equivalent |               |
| **Base font size** | 18px            | clamp-based     | ✅ Equivalent |               |
| **Line height**    | 1.6             | 1.5-1.7         | ⚠️ Check      | Verify values |
| **Heading scale**  | h1-h6 defined   | h1-h6 defined   | ✅ Equivalent |               |
| **Code font**      | Monospace stack | Monospace stack | ✅ Equivalent |               |

### 4.4 Animations

| Feature              | PaperMod        | normco.re      | Migration   | Notes           |
| -------------------- | --------------- | -------------- | ----------- | --------------- |
| **Theme transition** | ✅ Smooth       | ✅ Smooth      | ✅ Done     |                 |
| **Card hover**       | ✅ Border color | ⚠️ Partial     | 🔄 À migrer | Add full effect |
| **Card active**      | ✅ scale(0.96)  | ✅ Implemented | ✅ Done     |                 |
| **Reduced motion**   | ✅ Respected    | ✅ Respected   | ✅ Done     |                 |
| **Scroll-to-top**    | ✅ Fade in/out  | ✅ Implemented | ✅ Done     |                 |

---

## 5. JavaScript Features

| Feature                    | PaperMod          | normco.re          | Migration     | Notes |
| -------------------------- | ----------------- | ------------------ | ------------- | ----- |
| **Theme toggle**           | ✅ localStorage   | ✅ localStorage    | ✅ Done       |       |
| **Theme flash prevention** | ✅ Inline script  | ✅ Implemented     | ✅ Done       |       |
| **Scroll-to-top**          | ✅ Show on scroll | ✅ Throttled       | ✅ Done       |       |
| **Code copy**              | ✅ Copy button    | ✅ + fallback      | ✅ Done       |       |
| **TOC highlighting**       | ✅ Scroll spy     | ✅ Implemented     | ✅ Done       |       |
| **Search init**            | ✅ Fuse.js        | ✅ Pagefind        | 🆕 Maintain   |       |
| **Menu toggle**            | ✅ Mobile         | ✅ Implemented     | ✅ Done       |       |
| **External links**         | ❌ None           | ✅ aria-external   | 🆕 Maintain   |       |
| **Access keys**            | ❌ None           | ✅ h/a/s shortcuts | 🆕 Maintain   |       |
| **Service worker**         | ❌ None           | ✅ Offline support | 🆕 Maintain   |       |
| **Toast notifications**    | ❌ None           | ✅ Implemented     | 🆕 Maintain   |       |
| **Image lazy load**        | ✅ Native         | ✅ Enhanced        | ✅ Equivalent |       |

---

## 6. SEO & Meta

| Feature              | PaperMod             | normco.re         | Migration   | Notes       |
| -------------------- | -------------------- | ----------------- | ----------- | ----------- |
| **Meta description** | ✅ From front matter | ✅ metas plugin   | ✅ Done     |             |
| **Open Graph tags**  | ✅ Built-in          | ✅ metas plugin   | ✅ Done     |             |
| **Twitter cards**    | ✅ Built-in          | ✅ metas plugin   | ✅ Done     |             |
| **OG images**        | ❌ Manual            | ✅ Auto-generated | 🆕 Maintain | Enhancement |
| **Canonical URLs**   | ✅ Built-in          | ✅ Implemented    | ✅ Done     |             |
| **JSON-LD**          | ⚠️ Basic             | ✅ jsonLd plugin  | 🆕 Maintain |             |
| **Sitemap**          | ✅ Built-in          | ✅ sitemap plugin | ✅ Done     |             |
| **robots.txt**       | ✅ Built-in          | ⚠️ Need to add    | 🔄 À migrer |             |
| **hreflang**         | ✅ Built-in          | ✅ multilanguage  | ✅ Done     |             |

---

## 7. Content Features

| Feature                  | PaperMod       | normco.re           | Migration     | Notes         |
| ------------------------ | -------------- | ------------------- | ------------- | ------------- |
| **Markdown rendering**   | ✅ Goldmark    | ✅ markdown-it      | ✅ Equivalent |               |
| **Syntax highlighting**  | ✅ Chroma      | ✅ Prism            | ✅ Equivalent |               |
| **Math (KaTeX/MathJax)** | ✅ Optional    | ❌ Not implemented  | ❓ Decision   | Add if needed |
| **Mermaid diagrams**     | ✅ Optional    | ❌ Not implemented  | ❓ Decision   | Add if needed |
| **Emoji support**        | ✅ Native      | ✅ Native           | ✅ Done       |               |
| **Footnotes**            | ✅ Supported   | ✅ Supported        | ✅ Done       |               |
| **Tables**               | ✅ GFM         | ✅ GFM              | ✅ Done       |               |
| **Task lists**           | ✅ GFM         | ✅ GFM              | ✅ Done       |               |
| **Alerts/Admonitions**   | ❌ None        | ✅ Custom component | 🆕 Maintain   |               |
| **Code tabs**            | ❌ None        | ✅ Custom component | 🆕 Maintain   |               |
| **Collapsible sections** | ✅ `<details>` | ✅ Native HTML      | ✅ Done       |               |

---

## 8. Plugins Comparison

### 8.1 Active Lume Plugins

| Lume Plugin       | Hugo Equivalent | Purpose            | Migration     |
| ----------------- | --------------- | ------------------ | ------------- |
| `esbuild`         | Hugo Pipes      | JS bundling        | 🆕 Maintain   |
| `lightningCss`    | Hugo Pipes      | CSS processing     | 🆕 Maintain   |
| `purgecss`        | —               | CSS purification   | 🆕 Maintain   |
| `multilanguage`   | Built-in i18n   | Translations       | ✅ Equivalent |
| `prism`           | Chroma          | Syntax highlight   | ✅ Equivalent |
| `pagefind`        | Fuse.js         | Search             | 🆕 Better     |
| `ogImages`        | —               | OG image gen       | 🆕 Maintain   |
| `picture`         | Built-in        | Responsive images  | ✅ Equivalent |
| `transformImages` | Built-in        | Image optimization | ✅ Equivalent |
| `feed`            | Built-in        | RSS/JSON feeds     | ✅ Equivalent |
| `metas`           | Built-in        | SEO meta tags      | ✅ Equivalent |
| `jsonLd`          | —               | Structured data    | 🆕 Maintain   |
| `sitemap`         | Built-in        | Sitemap            | ✅ Equivalent |

### 8.2 Missing/Optional Features

| Feature    | Hugo/PaperMod     | Lume Plugin        | Migration   |
| ---------- | ----------------- | ------------------ | ----------- |
| robots.txt | Built-in          | Manual file        | 🔄 À migrer |
| KaTeX math | Optional          | `katex` plugin     | ❓ Decision |
| Mermaid    | Optional          | `mermaid` plugin   | ❓ Decision |
| Comments   | Disqus/Utterances | Manual integration | ❓ Decision |

---

## 9. Configuration

| Config               | Hugo             | Lume         | Migration     | Notes |
| -------------------- | ---------------- | ------------ | ------------- | ----- |
| **Site title**       | `config.yaml`    | `_data.ts`   | ✅ Done       |       |
| **Site description** | `config.yaml`    | `_data.ts`   | ✅ Done       |       |
| **Base URL**         | `config.yaml`    | `_config.ts` | ✅ Done       |       |
| **Language**         | `config.yaml`    | `_config.ts` | ✅ Done       |       |
| **Menu items**       | `config.yaml`    | `_data.ts`   | ✅ Done       |       |
| **Social links**     | `config.yaml`    | `_data.ts`   | ✅ Done       |       |
| **Theme params**     | `params` section | `_data.ts`   | ✅ Done       |       |
| **Per-page config**  | Front matter     | Front matter | ✅ Equivalent |       |

---

## 10. Summary Statistics

### Migration Status

| Category         | Total   | Done   | À migrer | Decision needed | Skip  |
| ---------------- | ------- | ------ | -------- | --------------- | ----- |
| **Core SSG**     | 14      | 14     | 0        | 0               | 0     |
| **Navigation**   | 11      | 5      | 5        | 1               | 0     |
| **Post Cards**   | 14      | 5      | 8        | 0               | 1     |
| **Single Post**  | 17      | 14     | 0        | 2               | 1     |
| **Archive/Tags** | 7       | 5      | 1        | 0               | 1     |
| **Search**       | 5       | 4      | 0        | 1               | 0     |
| **Footer**       | 4       | 2      | 0        | 0               | 2     |
| **CSS Tokens**   | 14      | 8      | 5        | 0               | 1     |
| **JavaScript**   | 13      | 13     | 0        | 0               | 0     |
| **SEO**          | 10      | 8      | 1        | 0               | 1     |
| **Content**      | 11      | 9      | 0        | 2               | 0     |
| **TOTAL**        | **120** | **87** | **20**   | **6**           | **7** |

### Priority Tasks (À migrer)

| Priority | Task                                  | Complexity |
| -------- | ------------------------------------- | ---------- |
| **P1**   | Add `--color-entry` CSS token         | Low        |
| **P1**   | Card background color                 | Low        |
| **P1**   | Card layout (description before meta) | Medium     |
| **P1**   | Metadata format + position            | Medium     |
| **P1**   | Remove tags from home cards           | Low        |
| **P1**   | Remove "Continue reading" link        | Low        |
| **P1**   | Full card clickable                   | Medium     |
| **P2**   | Theme toggle position                 | Low        |
| **P2**   | Nav separator                         | Low        |
| **P2**   | Language selector format              | Medium     |
| **P2**   | External link icon                    | Low        |
| **P2**   | Tag count on tag pages                | Low        |
| **P3**   | Verify CSS token values               | Low        |
| **P3**   | robots.txt                            | Low        |

### Decisions Needed (Human Input Required)

| Question                           | Options                | Default                 |
| ---------------------------------- | ---------------------- | ----------------------- |
| Keep search bar on home?           | Yes / No               | Remove (PaperMod style) |
| Add search link to nav?            | Yes / No               | Yes                     |
| Add comments (Utterances)?         | Yes / No / Later       | Later                   |
| Add KaTeX math support?            | Yes / No               | No                      |
| Add Mermaid diagrams?              | Yes / No               | No                      |
| Keep tags position in post header? | Header / After content | Header                  |

---

## 11. Lume-Only Features (Keep)

These features exist in normco.re but not in PaperMod. **Recommendation:
Maintain.**

| Feature                 | Benefit           | Risk if removed  |
| ----------------------- | ----------------- | ---------------- |
| Service Worker          | Offline support   | UX degradation   |
| Toast notifications     | User feedback     | Less feedback    |
| OG Images auto-gen      | No manual work    | Manual OG images |
| JSON feed               | API-friendly      | RSS only         |
| Access keys             | Power users       | Minor            |
| External link marking   | Accessibility     | Minor            |
| Alert/Admonition blocks | Content richness  | Loss of feature  |
| Code tabs component     | Better code demos | Loss of feature  |
| High contrast mode      | Accessibility     | A11y regression  |
| Commit hash in footer   | Dev transparency  | Minor            |

---

## 12. Approval Checklist

Please review and mark your decisions:

### Visual Migration

- [ ] **Approve P1 tasks** (card styling, metadata, layout)
- [ ] **Approve P2 tasks** (navigation changes)
- [ ] **Approve P3 tasks** (verification, robots.txt)

### Feature Decisions

- [ ] Search bar on home: **Keep / Remove**
- [ ] Search link in nav: **Add / Skip**
- [ ] Comments integration: **Now / Later / Never**
- [ ] KaTeX math: **Add / Skip**
- [ ] Mermaid diagrams: **Add / Skip**
- [ ] Tags position: **Header / After content**

### Lume-Only Features

- [ ] **Confirm all "Keep" items should be maintained**
- [ ] **Any items to remove?**

---

_Document version: 1.0_ _Created: January 28, 2026_ _Status: Awaiting Human
review_
