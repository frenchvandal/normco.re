---
title: Rich Content
description: Examples of embedded content and media in Markdown posts.
date: 2026-01-27
author: phiphi
tags:
  - Markdown
  - Media
  - Demo
id: rich-content
lang: en
---

This post demonstrates various types of rich content that can be embedded in
Markdown posts on this site.

<!--more-->

## Images

### Basic Image

Standard Markdown image syntax:

![Placeholder image](https://via.placeholder.com/800x400/1a1a2e/ffffff?text=Sample+Image)

### Image with Caption

Using HTML figure element for captioned images:

<figure>
  <img src="https://via.placeholder.com/800x400/2d3748/ffffff?text=Captioned+Image" alt="A sample captioned image">
  <figcaption>This is a caption describing the image above.</figcaption>
</figure>

### Responsive Images

Images automatically scale to fit the container width while maintaining aspect
ratio.

## Video Embeds

### YouTube

Embed YouTube videos using an iframe:

<div class="video-container">
  <iframe
    width="560"
    height="315"
    src="https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ"
    title="YouTube video player"
    frameborder="0"
    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
    allowfullscreen>
  </iframe>
</div>

> [!NOTE]
> We use `youtube-nocookie.com` for privacy-enhanced mode, which doesn't store
> information about visitors unless they play the video.

### Vimeo

Vimeo videos can be embedded similarly:

<div class="video-container">
  <iframe
    src="https://player.vimeo.com/video/32001208"
    width="640"
    height="360"
    frameborder="0"
    allow="autoplay; fullscreen; picture-in-picture"
    allowfullscreen>
  </iframe>
</div>

## Audio

HTML5 audio player for audio content:

<audio controls>
  <source src="https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3" type="audio/mpeg">
  Your browser does not support the audio element.
</audio>

## Interactive Elements

### Details/Summary (Collapsible Sections)

<details>
  <summary>Click to expand</summary>

This content is hidden by default and revealed when clicking the summary.

You can include any Markdown content here:

- Lists
- **Bold text**
- `Code snippets`
- Even code blocks:

```javascript
console.log("Hello from a collapsible section!");
```

</details>

### Multiple Collapsible Sections

<details>
  <summary>Section 1: Getting Started</summary>

To get started, install the dependencies:

```bash
npm install
```

Then run the development server:

```bash
npm run dev
```

</details>

<details>
  <summary>Section 2: Configuration</summary>

Edit the `config.json` file to customize settings:

```json
{
  "theme": "dark",
  "language": "en"
}
```

</details>

<details>
  <summary>Section 3: Deployment</summary>

Build and deploy with:

```bash
npm run build
npm run deploy
```

</details>

## Diagrams with ASCII Art

For simple diagrams, ASCII art works well in code blocks:

```text
+------------------+     +------------------+     +------------------+
|                  |     |                  |     |                  |
|      Client      +---->+      Server      +---->+     Database     |
|                  |     |                  |     |                  |
+------------------+     +------------------+     +------------------+

        Request              Processing              Storage
```

```text
+-----------+
|   Start   |
+-----+-----+
      |
      v
+-----+-----+
|   Input   |
+-----+-----+
      |
      v
+-----+-----+
|  Process  |
+-----+-----+
      |
      v
+-----+-----+
|  Output   |
+-----+-----+
      |
      v
+-----+-----+
|    End    |
+-----------+
```

## Quotes and Citations

### Pull Quote

<blockquote class="pull-quote">
  <p>The best way to predict the future is to invent it.</p>
  <cite>— Alan Kay</cite>
</blockquote>

### Extended Quote

> Simplicity is the ultimate sophistication. When you first start off trying to
> solve a problem, the first solutions you come up with are very complex, and
> most people stop there. But if you keep going, and live with the problem and
> peel more layers of the onion off, you can often times arrive at some very
> elegant and simple solutions.
>
> — Steve Jobs

## Tables with Complex Content

| Feature   | Status                         | Notes                    |
| --------- | ------------------------------ | ------------------------ |
| Dark mode | :white_check_mark: Implemented | Toggle in header         |
| Search    | :white_check_mark: Implemented | Press `Ctrl+K` to open   |
| i18n      | :white_check_mark: Implemented | English, French, Chinese |
| Comments  | :construction: Planned         | Using Giscus             |
| Analytics | :x: Not planned                | Privacy-first approach   |

## External Embeds

### GitHub Gist

You can embed GitHub Gists for sharing code snippets:

<script src="https://gist.github.com/octocat/6cad326836d38bd3a7ae.js"></script>

> [!TIP]
> GitHub Gists are great for sharing longer code examples that you want to
> maintain separately from your blog post.

### CodePen

For front-end demos, CodePen embeds work well:

<p class="codepen" data-height="300" data-default-tab="css,result" data-slug-hash="BamYvYp" data-user="chriscoyier" style="height: 300px; box-sizing: border-box; display: flex; align-items: center; justify-content: center; border: 2px solid; margin: 1em 0; padding: 1em;">
  <span>See the <a href="https://codepen.io/chriscoyier/pen/BamYvYp">CSS Grid example</a> by Chris Coyier on CodePen.</span>
</p>
<script async src="https://cpwebassets.codepen.io/assets/embed/ei.js"></script>

## Keyboard Shortcuts

Document keyboard shortcuts using the `<kbd>` element:

| Action  | Windows/Linux                | macOS                       |
| ------- | ---------------------------- | --------------------------- |
| Save    | <kbd>Ctrl</kbd>+<kbd>S</kbd> | <kbd>Cmd</kbd>+<kbd>S</kbd> |
| Find    | <kbd>Ctrl</kbd>+<kbd>F</kbd> | <kbd>Cmd</kbd>+<kbd>F</kbd> |
| Search  | <kbd>Ctrl</kbd>+<kbd>K</kbd> | <kbd>Cmd</kbd>+<kbd>K</kbd> |
| New tab | <kbd>Ctrl</kbd>+<kbd>T</kbd> | <kbd>Cmd</kbd>+<kbd>T</kbd> |

## Summary

Rich content enhances the reading experience and helps explain complex concepts.
Use these elements thoughtfully to add value without overwhelming readers.

For code-specific content, see the
[Code Syntax Highlighting](/posts/code-syntax/) post. For basic Markdown, check
the [Markdown Syntax Guide](/posts/markdown-syntax/).
