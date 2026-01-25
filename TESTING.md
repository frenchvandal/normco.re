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
DENO_TLS_CA_STORE=system deno test
```

Run a focused subset:

```bash
DENO_TLS_CA_STORE=system deno test tests
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
        run: DENO_TLS_CA_STORE=system deno test
```
