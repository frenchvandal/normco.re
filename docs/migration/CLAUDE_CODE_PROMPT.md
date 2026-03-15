# Claude Code / Codex Migration Prompt

Repository: frenchvandal/normco.re

Goal: Align the repository with IBM Carbon Design System v11 while keeping a
lightweight static architecture (Deno + Lume + TSX).

Authoritative references: https://carbondesignsystem.com/components/
https://carbondesignsystem.com/guidelines/
https://carbondesignsystem.com/guidelines/tokens/overview/

Tasks:

1. Scan CSS for non-token values
   - detect px spacing
   - detect hex colors
   - replace with Carbon tokens

2. Apply token mapping from CARBON_TOKEN_MAP.json

3. Refactor UI shell components Files: src/_components/Header.tsx
   src/_includes/base.tsx

   Ensure: role="dialog" where appropriate aria-labelledby focus trap Escape
   closes dialogs

4. Normalize breadcrumb markup Reference:
   https://carbondesignsystem.com/components/breadcrumb/usage/

5. Remove pointer cursor on non-interactive tags Reference:
   https://carbondesignsystem.com/components/tag/usage/

6. Implement unified disclosure controller

Create module: src/scripts/ui-disclosure.ts

Responsibilities: toggle state aria-expanded sync focus trapping overlay control

7. Run accessibility audit

Check: aria-expanded aria-controls aria-current

Reference: https://carbondesignsystem.com/guidelines/accessibility/overview/

Output:

- updated CSS
- updated TSX components
- migration diff
