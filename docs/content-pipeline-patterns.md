# Content Pipeline Patterns

This note documents two build-time coding patterns recently introduced into the
site:

1. small local Lume plugins for repository-specific rules
2. build-time validation and derived editorial data

The goal is not to add more runtime behavior. The goal is to keep site rules
close to the build, typed, testable, and easy to extend.

## Why this exists

The repository already had a strong `_config` pipeline, but some content rules
were still implicit:

- post metadata expectations lived partly in tests and partly in convention
- internal post-to-post relationships were not captured as structured data
- `_config/processors.ts` carried more site-specific responsibility than it had
  to

The new plugins move those concerns into focused modules under `plugins/`.

## New Plugins

### `plugins/content_invariants.ts`

This plugin validates editorial invariants for Markdown post sources during
`site.preprocess([".md"])`.

It currently enforces:

- every post locale has a non-empty `id`
- every post locale has a non-empty `title`
- every post locale has a non-empty `description`
- every post locale has a non-empty `url`
- every post locale has a non-empty `lang`
- every post locale has a parseable `date`
- each localized post URL matches the expected locale prefix
- localized siblings share the same `id`
- each post slug directory includes `en`, `fr`, `zh-hans`, and `zh-hant`
- no duplicate post ids across different slug directories
- no duplicate URLs across post pages

Why this is useful:

- failures happen during build, not after deployment
- the repository contract is enforced from live Lume page data, not only from
  fixture tests
- adding a new invariant is now a small, local change

### `plugins/post_link_graph.ts`

This plugin derives internal post relationships during
`site.preprocess([".md"])`.

It scans post Markdown content for:

- Markdown links like `[label](/posts/slug/)`
- relative Markdown links like `[label](../other-post/)`
- inline HTML anchors like `<a href="/posts/slug/">`

It then populates:

- `page.data.outboundInternalLinks`
- `page.data.backlinks`

Only internal links that resolve to another post page are kept. External links,
mailto links, self-links, and duplicates are ignored.

Why this is useful:

- editorial structure becomes build-time data
- post relationships can be rendered without any runtime search step
- future features like “related notes”, “linked essays”, or graph exports can
  reuse the same derived data

## Registration Order

The plugins are registered from `_config/processors.ts`.

The relevant order is:

1. existing HTML preprocessors apply language aliases and stable post ids
2. `registerPostLinkGraph(site)` derives post backlinks from Markdown sources
3. `registerContentInvariants(site)` validates the content contract

That order is intentional:

- derived data runs before validation in case future invariants depend on it
- validation runs after the core page data normalization already present in the
  repo

## Rendering Integration

`src/_includes/layouts/post-view.tsx` now reads `data.backlinks` and renders a
new rail card when backlinks exist.

Important detail:

- if no post links to another post, the card does not render

So the new behavior is additive and dormant until editorial content uses
internal post links.

## Tests

The new patterns are covered by:

- `plugins/content_invariants_test.ts`
- `plugins/post_link_graph_test.ts`
- `src/_includes/layouts/_post_test.ts`

These tests intentionally focus on repository behavior instead of Lume internals
so the rules stay stable even if the build stack evolves.

## How to extend this cleanly

When adding new site-specific content rules, prefer one of these routes:

1. Add another small plugin under `plugins/` if the rule is build-time and
   reusable.
2. Extend `content_invariants.ts` if the rule is a hard contract and should fail
   the build.
3. Extend `post_link_graph.ts` if the rule derives relationships from source
   content.

Good candidates for future extension:

- validating hero image metadata for posts
- exporting the link graph as JSON for tooling
- deriving related-post clusters from shared links and tags
- adding note/wiki backlinks if those content types land later

## What not to do

Avoid pushing new repository-specific behavior directly into large anonymous
callbacks inside `_config.ts` or `_config/processors.ts` unless the logic is
truly one-off.

The point of these changes is to keep the build pipeline understandable:

- one module
- one responsibility
- one test file
- one documented reason to exist
