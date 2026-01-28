# Testing

## Prerequisites

- Deno installed (see `.tool-versions` for the expected version).
- Set `DENO_TLS_CA_STORE=system` for every Deno command.

## Local commands

Format code before linting:

```bash
DENO_TLS_CA_STORE=system deno fmt
```

Run the linter:

```bash
DENO_TLS_CA_STORE=system deno lint
```

Run all tests:

```bash
DENO_TLS_CA_STORE=system deno test --allow-read
```

Run a focused subset:

```bash
DENO_TLS_CA_STORE=system deno test --allow-read src
DENO_TLS_CA_STORE=system deno test --allow-read tests
```

Update snapshots:

```bash
DENO_TLS_CA_STORE=system deno test --allow-read --allow-write -- --update
```

## CI example (GitHub Actions)

```yaml
name: Tests

on:
  pull_request:
  push:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: denoland/setup-deno@v1
        with:
          deno-version-file: .tool-versions
      - name: Format
        run: DENO_TLS_CA_STORE=system deno fmt
      - name: Lint
        run: DENO_TLS_CA_STORE=system deno lint
      - name: Test
        run: DENO_TLS_CA_STORE=system deno test --allow-read
```

## Test layout

- Unit tests are co-located with the code they validate (for example
  `src/_components/Component_test.ts` or `src/js/features/feature_test.ts`).
- Integration tests and fixtures live in `tests/` (for example
  `tests/integration/` and `tests/fixtures/`).

## Component tests

The following components have unit tests:

| Component   | Test file                             |
| ----------- | ------------------------------------- |
| Breadcrumbs | `src/_components/Breadcrumbs_test.ts` |
| CodeTabs    | `src/_components/CodeTabs_test.ts`    |
| Modal       | `src/_components/Modal_test.ts`       |
| Pagination  | `src/_components/Pagination_test.ts`  |
| PostDetails | `src/_components/PostDetails_test.ts` |
| PostList    | `src/_components/PostList_test.ts`    |
| SourceInfo  | `src/_components/SourceInfo_test.ts`  |
| Tabs        | `src/_components/Tabs_test.ts`        |

## Feature tests

Client-side feature tests are located in `src/js/features/` alongside their
implementations. Tests use BDD-style `describe`/`it` blocks with DOM mocking via
`tests/fixtures/dom.ts`.

## Documentation tests

Code examples in JSDoc comments are automatically tested:

```bash
DENO_TLS_CA_STORE=system deno test --doc src/
```
