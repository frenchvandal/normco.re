# Carbon Design System v11 — Counter‑Audit Prompt

Repository: `frenchvandal/normco.re`\
Branch: `claude/review-migration-prompt-TKxCY`

---

# Mission

Perform a **complete counter‑audit of the Carbon Design System migration**.

The existing documentation and migration audit in the repository contains errors
because parts of the analysis relied on:

- Carbon **v10 assumptions**
- approximated token values
- repository implementation choices presented as Carbon rules

You must **re‑audit everything from scratch using Carbon Design System v11
only**.

Do not preserve earlier conclusions simply because they exist in the repository.

Every claim must be re‑validated against Carbon v11 sources.

---

# Sources of truth

Use the following sources in strict priority order.

## 1. Carbon Design System v11 official documentation

https://carbondesignsystem.com/

Consult the official documentation for:

- design tokens
- color system
- themes
- typography
- layout grid
- breakpoints
- components
- UI shell
- accessibility rules
- icons and pictograms

Do not rely on any Carbon v10 knowledge.

---

## 2. Local Carbon token export (Figma)

The canonical token source inside the repository is:

`design-tokens/carbon.json`

All token values used in the code must be traceable to this file.

If a token cannot be traced to this export or to Carbon documentation, it must
be considered suspicious.

---

## 3. Repository implementation

Repository code is **implementation evidence**, not normative truth.

Relevant implementation files include:

```
src/styles/tokens-carbon.css
src/styles/base.css
src/style.css
src/utils/carbon-tokens.ts
src/styles/components/*
```

Use them to detect mismatches with Carbon v11.

---

# Non‑authoritative documentation

The following files may contain outdated or incorrect statements and must be
critically audited:

```
docs/*
CARBON_MIGRATION_PLAN.md
CLAUDE.md
AGENTS.md
ARCHITECTURE.md
```

Do not assume any claim in those files is correct.

---

# Audit methodology

Follow these phases strictly.

---

# Phase 1 — Error ledger

Before proposing fixes, build a **complete error ledger**.

Format:

| file | section | claim | issue type | correct Carbon v11 reference | action |
| ---- | ------- | ----- | ---------- | ---------------------------- | ------ |

Issue types may include:

- Carbon v10 assumption
- incorrect token value
- incorrect component mapping
- documentation invention
- unverifiable statement
- repository preference presented as Carbon rule

---

# Phase 2 — Token verification

Audit the entire token system.

Cross‑check:

```
design-tokens/carbon.json
src/styles/tokens-carbon.css
src/utils/carbon-tokens.ts
```

Verify:

- neutral color scale
- semantic tokens
- support colors
- inverse tokens
- focus colors
- link colors
- dark theme tokens

If color conversions exist (hex → oklch), document the conversion method.

---

# Phase 3 — Theme verification

Audit theme definitions.

Verify documentation and implementation for:

- White theme
- Gray 10
- Gray 90
- Gray 100

Ensure documentation does not confuse:

- theme names
- page background
- layer tokens

---

# Phase 4 — State behaviour

Verify interaction states:

- hover
- active
- selected
- selected-hover
- selected-active
- disabled
- inverse states

Simplified implementations must be justified by Carbon v11 documentation.

---

# Phase 5 — Typography

Audit typography guidance.

Check alignment with Carbon v11 for:

- productive vs expressive type
- body tokens
- heading tokens
- code tokens
- line heights
- font weights

---

# Phase 6 — Layout grid

Audit layout assumptions.

Verify:

- breakpoints
- columns
- gutters
- margins
- responsive behaviour

If the repository intentionally simplifies Carbon grid rules, document this
clearly as a **repository deviation**.

---

# Phase 7 — Component mapping

Audit mappings between site components and Carbon components.

Check mappings for:

- header / UI shell header
- navigation
- side navigation
- dropdown
- language selector
- breadcrumb
- pagination
- tag
- tile
- code snippet

Classify each mapping as:

- exact Carbon component
- adapted Carbon pattern
- custom component using Carbon tokens

---

# Phase 8 — Documentation integrity

Audit all Carbon‑related documentation.

Identify:

- Carbon v10 references
- incorrect token claims
- invented Carbon rules
- outdated token sources
- repository preferences presented as Carbon rules

---

# Phase 9 — Source‑of‑truth correction

Ensure documentation clearly states the real sources of truth:

1. Carbon Design System v11 documentation
2. `design-tokens/carbon.json`
3. repository implementation

Remove references to obsolete token exports.

---

# Phase 10 — Automated token validation tool

Create or update a **token validation tool** that verifies repository tokens
against the Carbon token export.

Existing script:

```
/tool/carbon_repo_scanner.ts
```

Either:

- extend this script
- or replace it with a new validator

The tool must:

1. parse `design-tokens/carbon.json`
2. scan CSS and TypeScript files
3. detect tokens used in:

```
src/styles/*
src/utils/*
```

4. report:

- tokens used but missing in Carbon export
- tokens whose value diverges from Carbon
- unused tokens
- tokens manually approximated

Output format:

```
tools/carbon_token_validation_report.md
```

The tool must run via:

```
deno task carbon:validate
```

---

# Required deliverables

## Counter‑audit report

Create:

```
docs/CARBON_V11_COUNTER_AUDIT.md
```

Contents:

- executive summary
- error ledger
- token validation
- theme validation
- documentation issues
- implementation issues
- repository deviations

---

## Updated prompt

Rewrite:

```
CLAUDE_CODE_PROMPT.md
```

so future agents repeat this counter‑audit methodology.

---

## Documentation corrections

Update documentation where needed:

```
docs/*
CARBON_MIGRATION_PLAN.md
CLAUDE.md
AGENTS.md
ARCHITECTURE.md
```

Important rule:

`CLAUDE.md` and `AGENTS.md` must remain byte‑identical.

---

## Final summary

Provide a final report describing:

- incorrect statements removed
- corrected tokens
- documentation updates
- implementation fixes
- repository deviations from Carbon

---

# Quality requirements

The counter‑audit must be:

- evidence‑based
- aligned strictly with Carbon v11
- traceable to token sources
- explicit about repository deviations
- skeptical of previous AI‑generated conclusions

Do not perform a superficial rewrite.

Perform a true counter‑audit.
