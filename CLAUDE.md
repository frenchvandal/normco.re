# CLAUDE.md

This repository contains a static site built with Deno, Lume, TSX layouts and
pages, Markdown posts, and Sass.

## Content Model

- Pages, layouts, and shared UI components remain in TSX.
- Blog posts live in `src/posts/<slug>/`.
- Shared post metadata lives in `src/posts/<slug>/_data.yml`.
- Localized post bodies live in `src/posts/<slug>/{en,fr,zh-hans,zh-hant}.md`.

## Design-System Guidance

The UI is built on a local Primer-inspired token system defined in
`src/styles/primer/_theme-tokens.scss`.

- `--ph-*` custom properties are the source of truth for color, type, spacing,
  layout, radius, motion, and focus decisions.
- `src/style.scss` composes the site from five layers only: reset, tokens, base,
  layout, and utilities.
- The visual language is a Swiss-Primer hybrid: monochrome surfaces, one blue
  accent family, strict spacing discipline, and minimal decoration.
- No exported Figma token file or historical migration document should be
  treated as authoritative.

## Development Rules

### Deno Utilities

When touching build scripts or repository utilities:

- Prefer Deno’s built-in primitives for low-level work such as `Deno.Command`,
  `Deno.readTextFile`, `Deno.writeTextFile`, `Deno.readDir`, `Deno.stat`,
  `Deno.errors.NotFound`, and `import.meta.main`.
- Prefer Deno std helpers over ad-hoc implementations for common higher-level
  tasks such as CLI parsing, recursive filesystem traversal, HTML escaping,
  Markdown frontmatter parsing, and targeted test stubs.
- For repo-local files read by scripts, resolve from `import.meta.url` or
  `import.meta.dirname` instead of assuming the current working directory.

### Tokens

Do not introduce new hard-coded UI values when an existing local token already
exists.

Avoid examples such as:

- `color: #000`
- `margin: 17px`

Prefer:

- `var(--ph-*)` custom properties already exposed by the theme layer

If a needed token is not yet exposed locally, add it intentionally in
`src/styles/primer/_theme-tokens.scss` rather than inventing a parallel local
token source.

### Accessibility

Interactive controls should preserve clear, valid semantics.

- Disclosure controls should use `aria-expanded` and `aria-controls`.
- Navigation should use `aria-current` where appropriate.
- Dialog-like surfaces should use `role="dialog"`, an accessible label, and a
  focus trap when the interaction is truly modal.
- Visible focus states are required.
- Important dynamic feedback should be announced through an explicit live region
  when needed.

### TypeScript Tests And Faker

Use `faker` in TypeScript tests when fixture values are incidental to the
behavior under test and hand-written literals would add noise, repetition, or
accidental coupling to arbitrary values.

Recommended cases:

- Realistic but deterministic placeholder data such as names, titles, slugs,
  URLs, emails, IDs, labels, body text, numeric ranges, booleans, arrays, and
  dates.
- Fixture factories that need multiple variants of the same shape without
  repeating hard-coded strings.
- Tests that benefit from domain-shaped values from Faker modules such as
  `person`, `internet`, `location`, `company`, `lorem`, `number`, `string`,
  `helpers`, and `date`.

Prefer explicit literals instead of Faker when the exact value is the point of
the test, for example:

- Boundary conditions and regression inputs.
- Stable protocol or contract values.
- User-facing copy, localized strings, enum members, and route constants.
- Specific dates or years that are part of the assertion itself.

Required practices:

- Import Faker via the import map alias: `import { faker } from "@faker-js/faker";`
- Seed Faker in each test or shared test helper before generating values:
  `faker.seed(1234)`.
- Keep seeds stable and local to the file or helper so failures are
  reproducible.
- Constrain generators to the range the test actually needs instead of using
  broad random values by default.
- Do not let randomness decide which branch is under test; use explicit
  overrides for required edge cases.

Date-specific rules:

- For relative date helpers such as `faker.date.past()`, `faker.date.future()`,
  `faker.date.anytime()`, `faker.date.recent()`, and `faker.date.soon()`, also
  fix the reference date with `faker.setDefaultRefDate(...)` or pass `refDate`
  explicitly. A seed alone is not enough because these helpers otherwise depend
  on the current clock.
- When a test exposes the same date in multiple forms, derive every related
  field from one generated `Date` instance instead of making independent Faker
  calls. For example, generate one `Date`, then format its ISO string and human
  label from that value.

Reference:

- https://fakerjs.dev/api/

## Recommended Validation

For a meaningful change, run:

```sh
deno task check
deno task test
deno task build
```

Run `deno task validate-contracts` when your changes affect feeds or generated
JSON outputs.

For Android app work under `apps/android`, also run:

```sh
cd apps/android
export JAVA_HOME=$(/usr/libexec/java_home -v 17)
./gradlew quality assembleDebug
```

## Android App Guidance

When touching `apps/android`:

- Treat Material Design 3 as the Android design-system source of truth for the
  native app, just as Carbon is the source of truth for the web stack.
- Before changing Android UI patterns, review the relevant official Material and
  Android Compose component guidance first.
- Do not invent parallel Android tokens, components, or interaction patterns
  when Material 3 already provides a suitable primitive.
- Diverge from Material only when the product has a clear reason, and keep the
  deviation intentional and documented.
- Primary Android design-system references:
  - https://m3.material.io/
  - https://developer.android.com/develop/ui/compose/designsystems/material3
  - https://developer.android.com/develop/ui/compose/components

- Follow the current Android guidance from Google as the primary reference:
  - https://developer.android.com/topic/architecture/recommendations
  - https://developer.android.com/topic/architecture/data-layer/offline-first
  - https://developer.android.com/develop/ui/compose/navigation
  - https://developer.android.com/develop/ui/compose/designsystems/material3
- Keep the Android app on Kotlin, Jetpack Compose, and Material 3. Do not
  introduce XML view stacks or hybrid UI patterns unless the existing app
  already requires them.
- Prefer the current canonical Android stack for this app: Hilt for DI, Kotlin
  Flow/StateFlow for observable state, Room as the local source of truth when
  persistence lands, WorkManager for background sync, Paging 3 for long article
  lists, and Coil for remote images in Compose.
- Keep business logic out of composables. UI state should be produced by
  `ViewModel` classes and exposed as immutable `StateFlow`, then collected in
  Compose with `collectAsStateWithLifecycle()`.
- Use Hilt rather than hand-rolled factories or service locators for Android app
  wiring. Prefer constructor injection, `@HiltViewModel`, and
  `@AndroidEntryPoint` boundaries.
- Treat repositories as the data boundary. UI code should not parse raw JSON,
  hit URLs directly, or depend on site HTML or feed routes.
- Keep mobile clients bound to the JSON contracts in `contracts/` and the
  generated `/api/...` outputs, not to rendered pages.
- Favor offline-first reads. Once storage lands, the UI should observe local
  data and let repositories coordinate remote refresh into `Room`.
- Prefer `DataStore` for app preferences and lightweight settings.
- For Compose lists, provide stable item keys and `contentType` where useful,
  keep formatting/parsing work out of hot recomposition paths, and use
  `remember` or `derivedStateOf` only when they clearly reduce repeat work.
- Use Material 3 patterns that fit Android surfaces: dynamic color when
  appropriate, `Scaffold`, `NavigationBar` or adaptive navigation, and clear
  accessibility semantics for interactive elements.
- Prefer official Android testing primitives for Compose UI, and add screenshot
  or baseline profile work when performance and visual stability become part of
  the slice.
- Preserve Android package and namespace stability deliberately. Once public IDs
  are shipped, avoid casual renames.

### Android Naming

Use Android naming that matches the current app shape under
`apps/android/app/src/main/java/re/phiphi/android/`.

- Keep packages all-lowercase and feature-oriented, for example: `feature.home`,
  `feature.post`, `data.posts`, `ui.navigation`.
- Keep one primary class or top-level type per file, and keep the file name
  identical to the main class or composable container name.
- Use PascalCase for Kotlin types and composables, and reserve a small `Phiphi`
  prefix only for app-level shell types such as `PhiphiApplication`,
  `PhiphiApp`, `PhiphiTheme`, and `PhiphiNavHost`.
- Name screen composables with the `...Screen` suffix and route-entry
  composables with the `...Route` suffix.
- Name presentation models with explicit suffixes such as `...UiState`,
  `...UiModel`, and `...ViewModel`.
- Name repository interfaces and implementations explicitly, for example
  `PostsRepository`, `AssetPostsRepository`, and later `OfflinePostsRepository`
  or `NetworkPostsRepository` if multiple data sources appear.
- Name DI files by what they provide or bind, for example `PostsDataModule`, not
  generic names such as `AppModule` unless the module is truly app-wide.
- Keep transport, persistence, and domain models distinct when they diverge:
  prefer suffixes like `...Dto`, `...Entity`, and unsuffixed domain models only
  when the type is the app-facing canonical model.
- Keep JSON schema names and Android property names aligned semantically, but
  adapt them at the boundary with `@SerialName(...)` instead of leaking wire
  naming into the rest of the app.
- Use snake_case Android resource names with a feature prefix when helpful, as
  in `home_title`, `home_retry`, and `nav_settings`.
- Use `UPPER_SNAKE_CASE` for constants, especially route patterns, asset paths,
  and stable keys.
- Remove stale legacy prefixes during renames. Do not leave mixed `Normco` and
  `Phiphi` naming in the same Android slice.

## Component References

- Header: https://carbondesignsystem.com/components/ui-shell-header/usage/
- Side navigation: https://carbondesignsystem.com/components/side-nav/usage/
- Breadcrumb: https://carbondesignsystem.com/components/breadcrumb/usage/
- Tag: https://carbondesignsystem.com/components/tag/usage/
- Search: https://carbondesignsystem.com/components/search/usage/
