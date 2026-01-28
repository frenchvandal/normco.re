---
title: Markdown Syntax Guide
description: A comprehensive guide to Markdown formatting supported on this site.
date: 2026-01-24
author: phiphi
tags:
  - Markdown
  - Guide
  - Documentation
id: markdown-syntax
lang: en
---

This article offers a sample of basic Markdown syntax that can be used in
content files, as well as custom features supported by this site.

<!--more-->

## Headings

The following HTML `<h1>`—`<h6>` elements represent six levels of section
headings. `<h1>` is the highest section level while `<h6>` is the lowest.

# H1

## H2

### H3

#### H4

##### H5

###### H6

## Paragraph

Xerum, currentibus sunt sunt est conculta officiis ipsam faccus. Ratibusda
molupta dolupta exernat inctasit laborum, voluptas quibus, corem paribus
officiis.

Nam fuga. Non nimus mollit magnis exerci dolupta inctum fugitam facia cum id
offictotam, tet as a nectiis maxim am.

## Blockquotes

The blockquote element represents content that is quoted from another source,
optionally with a citation which must be within a `footer` or `cite` element.

### Blockquote without attribution

> Tiam, ad mint andae modi consequi laborum, odis ipsam veliam, qui fuga. Minima
> consequatur non verum officiis doloria tempora. Sit autetur labore officia
> rectem qui numquam dolor.

### Blockquote with attribution

> Don't communicate by sharing memory, share memory by communicating.
>
> — <cite>Rob Pike[^1]</cite>

[^1]: The above quote is excerpted from Rob Pike's
    [talk](https://www.youtube.com/watch?v=PAAkCSZUG1c) during Gopherfest,
    November 18, 2015.

## Tables

Tables aren't part of the core Markdown spec, but they are supported.

| Name  | Age | City    |
| ----- | --- | ------- |
| Alice | 28  | Paris   |
| Bob   | 34  | London  |
| Carol | 25  | Chengdu |

### Aligned columns

| Left   | Center | Right |
| :----- | :----: | ----: |
| Cell 1 | Cell 2 |  $100 |
| Cell 3 | Cell 4 |  $200 |
| Cell 5 | Cell 6 |  $300 |

## Code Blocks

### Inline code

Use backticks for `inline code`.

### Block code with syntax highlighting

```javascript
const greeting = "Hello, World!";
console.log(greeting);
```

See the [Code Syntax Highlighting](/posts/code-syntax/) post for more examples.

## Lists

### Ordered List

1. First item
2. Second item
3. Third item

### Unordered List

- List item
- Another item
- And another item

### Nested list

- Fruit
  - Apple
  - Orange
  - Banana
- Dairy
  - Milk
  - Cheese

### Task list

- [x] Write the press release
- [ ] Update the website
- [ ] Contact the media

## Horizontal Rule

Use three or more hyphens, asterisks, or underscores:

---

## Links

[An example link](https://example.com)

[Link with title](https://example.com "Example Site")

<https://normco.re>

## Images

![Placeholder](https://via.placeholder.com/600x400/1a1a2e/ffffff?text=Sample+Image)

## Emphasis

_This text is italicized_

**This text is bold**

_**This text is bold and italic**_

~~This text is strikethrough~~

## Abbreviations

The HTML specification is maintained by the W3C.

*[HTML]: HyperText Markup Language *[W3C]: World Wide Web Consortium

## Alerts / Admonitions

> [!NOTE]
> Useful information that users should know, even when skimming content.

> [!TIP]
> Helpful advice for doing things better or more easily.

> [!IMPORTANT]
> Key information users need to know to achieve their goal.

> [!WARNING]
> Urgent info that needs immediate user attention to avoid problems.

> [!CAUTION]
> Advises about risks or negative outcomes of certain actions.

## Summary

This guide covers most of the Markdown features you'll need for writing content.
For code-specific examples, check out the
[Code Syntax Highlighting](/posts/code-syntax/) post.
