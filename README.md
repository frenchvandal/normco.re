# normco.re - Personal Blog & Portfolio

This is the source code for [normco.re](https://normco.re), a personal blog and
portfolio built with [Lume](https://lume.land), a modern static site generator
powered by Deno. The site features a custom design system with advanced
functionality and a carefully crafted architecture.

## Features

- **Modern Architecture**: Built with TypeScript templates for type safety and
  enhanced developer experience
- **Custom Design System**: ITCSS (Inverted Triangle CSS) methodology with
  design tokens, base styles, utilities, components, and layouts
- **Advanced Content Processing**: Markdown with syntax highlighting, table of
  contents, footnotes, and custom alerts
- **SEO Optimized**: Automatic meta tag generation, sitemaps, and structured
  data
- **Performance Optimized**: Lightning CSS and Terser minification, clean URLs,
  and lazy-loaded images
- **Accessibility Focused**: Semantic HTML, proper ARIA attributes, and
  WCAG-compliant color contrast
- **Dark/Light Themes**: Automatic theme detection with manual override option
- **Built-in Search**: Full-text search powered by Pagefind
- **Responsive Design**: Mobile-first approach with responsive layouts
- **Content Features**: Reading time estimation, tag-based archives, author
  pages, and pagination
- **CMS Ready**: Lume CMS configuration for global settings, pages, and posts

## Project Structure

```
.
├── _cms.ts                 # Lume CMS configuration
├── _cms-fields.ts          # CMS field helpers
├── _config.ts              # Main site configuration
├── plugins.ts              # Plugin definitions and configurations
├── mod.ts                  # Exported site instance for module imports
├── deno.json               # Deno configuration and task definitions
├── src/                    # Source files
│   ├── _archetypes/        # Lume content scaffolds
│   ├── _config/            # Configuration constants
│   ├── _data/              # Structured data files (i18n, etc.)
│   ├── _data.ts            # Global site data
│   ├── _utilities/         # Helper functions and utilities
│   ├── _includes/          # Layouts and CSS
│   │   ├── layouts/        # TypeScript layout templates
│   │   └── css/            # Modular CSS files (ITCSS layers)
│   ├── _components/        # Reusable TypeScript components
│   ├── js/                 # Client-side JavaScript
│   ├── pages/              # Static pages
│   ├── posts/              # Blog posts markdown files
│   ├── archive.page.ts     # Archive pagination generator
│   ├── archive-result.page.ts  # Tag/author page generator
│   ├── feed-json-viewer.page.ts # Feed JSON viewer template
│   ├── index.page.ts       # Homepage template
│   ├── styles.css          # Main stylesheet entry point
│   └── 404.md              # Not found page content
└── _site/                  # Generated static site (output)
```

## Setup and Development

To run this project locally:

1. Install [Deno](https://deno.land/)
2. Clone this repository
3. Run the development server:

```bash
deno task serve
```

Or build the static site:

```bash
deno task build
```

Or launch the local CMS UI:

```bash
deno task cms
```

## Content Archetypes

This project includes Lume archetypes to quickly scaffold new content. The
archetypes live in `src/_archetypes/` and can be invoked with
`deno task lume new`:

```bash
# Create a new blog post
deno task lume new post "My new post"

# Create a new static page
deno task lume new page "About"
```

## Architecture Highlights

### TypeScript Templates

Instead of traditional template engines, this site uses TypeScript functions
with template literals, providing excellent type safety and IDE support.

### ITCSS Methodology

CSS follows the Inverted Triangle CSS architecture:

1. **Design Tokens**: CSS custom properties for consistent design values
2. **Base Styles**: Reset and foundational typography
3. **Utilities**: Single-purpose helper classes
4. **Components**: Reusable UI elements
5. **Layouts**: Page-specific arrangements

### Plugin Ecosystem

Leverages Lume's plugin system for:

- Lightning CSS processing and minification
- Syntax highlighting with Prism
- SEO metadata generation
- Client-side search with Pagefind
- Markdown image handling and lazy-loading enhancements
- Feed generation (RSS/JSON)
- And more

## License

This project is licensed under the terms specified in the LICENSE file.
