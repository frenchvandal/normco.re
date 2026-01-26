/**
 * Post: A Deep Dive into My Lume Blog Architecture
 *
 * An exploration of the technical architecture behind my Lume-powered blog,
 * from plugin configurations to TypeScript templates and dynamic page
 * generation.
 */

/**
 * Post title.
 */
export const title = "A Deep Dive into My Lume Blog Architecture";

/**
 * Post description for SEO and excerpts.
 */
export const description =
  "An exploration of the technical architecture behind my Lume-powered blog, from plugin configurations to TypeScript templates and dynamic page generation.";

/**
 * Publication date.
 */
export const date = new Date("2026-01-23");

/**
 * Post author.
 */
export const author = "phiphi";

/**
 * Tags for categorization.
 */
export const tags = [
  "Lume",
  "Static Site Generation",
  "Deno",
  "Web Development",
  "Architecture",
];

/**
 * Markdown content for the post.
 */
const markdownContent = `
I built my blog with Lume, a modern static site generator powered by Deno.
Here's a look at the technical architecture and the decisions behind my
implementation.

<!--more-->

## Introduction to Lume

Lume is a static site generator built with Deno. Unlike traditional SSGs that
rely on Node.js, Lume leverages Deno's modern runtime for a fresh take on static
site generation. Its plugin system enables extensive customization while keeping
concerns cleanly separated.

## Project Structure and Configuration

My blog follows Lume's recommended structure with a few customizations:

\`\`\`
.
├── _config.ts          # Main site configuration
├── plugins.ts          # Plugin definitions and configurations
├── _cms.ts             # Lume CMS configuration
├── _cms-fields.ts      # CMS field helpers
├── mod.ts              # Exported site instance for module imports
├── deno.json           # Deno configuration and task definitions
├── src/                # Source files
│   ├── _archetypes/    # Lume content scaffolds
│   ├── _config/        # Configuration constants
│   ├── _data/          # Structured data files (i18n, etc.)
│   ├── _data.ts        # Global site data
│   ├── _utilities/     # Helper functions and utilities
│   ├── _includes/      # Layouts and CSS
│   │   ├── layouts/    # TypeScript layout templates
│   │   └── css/        # Modular CSS files (ITCSS layers)
│   ├── _components/    # Reusable TypeScript components
│   ├── js/             # Client-side JavaScript
│   ├── posts/          # Blog posts markdown files
│   ├── pages/          # Static pages
│   ├── 404.md          # Not-found page
│   ├── styles.css      # Main stylesheet entry point
│   ├── feed.xsl        # Feed XSL stylesheet
│   ├── favicon.png     # Site favicon
│   ├── index.page.ts   # Homepage template
│   ├── archive.page.ts         # Archive pagination generator
│   ├── archive-result.page.ts  # Tag/author page generator
│   └── feed-json-viewer.page.ts # Feed JSON viewer template
└── _site/              # Generated static site (output)
\`\`\`

### Core Configuration (\`_config.ts\`)

The main configuration file is minimalistic yet powerful:

\`\`\`typescript
import lume from "lume/mod.ts";
import plugins from "./plugins.ts";

const site = lume({
  src: "./src",
  location: new URL("https://normco.re"),
});

const getCommitSha = async (): Promise<string> => {
  try {
    const cmd = new Deno.Command("git", { args: ["rev-parse", "HEAD"] });
    const { code, stdout } = await cmd.output();
    if (code !== 0) {
      return "";
    }
    return new TextDecoder().decode(stdout).trim();
  } catch {
    return "";
  }
};

const commitSha = await getCommitSha();
site.data("commit", commitSha);

site.use(plugins());

site.ignore((path) => path === "/README.md" || path.endsWith("/README.md"));

export default site;
\`\`\`

This sets the source directory, defines the production URL, and injects the
current Git commit SHA into global data. Plugin management lives in a separate
file to keep things organized.

### Plugin Architecture (\`plugins.ts\`)

The plugin system is where Lume really shines. My \`plugins.ts\` file includes a
selection of plugins that enhance functionality without bloating the build:

- **Lightning CSS**: Fast CSS processing and minification
- **ESBuild**: JavaScript bundling and minification for production builds
- **PurgeCSS**: Removes unused CSS selectors
- **Source Maps**: Source map generation for easier debugging
- **Prism**: Syntax highlighting for code blocks
- **Date**: Enhanced date handling and formatting utilities
- **JSON-LD**: Structured data support for SEO
- **Metas**: SEO-friendly meta tag generation (Open Graph, Twitter Cards)
- **Pagefind**: Client-side full-text search functionality
- **Sitemap**: Automatic XML sitemap generation
- **Feed**: RSS and JSON feed generation
- **Reading Info**: Estimated reading time calculation
- **Table of Contents (TOC)**: Automatic TOC generation from headings
- **Footnotes**: Markdown footnote processing and formatting
- **Markdown Images**: Enhanced Markdown image handling
- **BasePath**: Base URL path handling for production deployment
- **ResolveUrls**: URL resolution and canonicalization
- **SlugifyUrls**: Clean URL generation (converts \`index.html\` to \`/\`)
- **Markdown Alerts**: Custom alert boxes via @mdit/plugin-alert

Each plugin is configured with specific options tailored to the site's
requirements. For example, the Pagefind configuration disables automatic UI
injection to allow for custom search interface implementation:

\`\`\`typescript
pagefind: {
  ui: false, // Disable auto UI injection for custom implementation
},
\`\`\`

Additionally, the build pipeline includes HTML post-processing that enhances
image loading performance:

- First image on each page: \`loading="eager"\` (improves Largest Contentful
  Paint)
- Subsequent images: \`loading="lazy"\` (defers loading for better initial
  performance)
- All images: \`decoding="async"\` (prevents blocking the main thread)

## Data Management and Front Matter

Lume's data cascade system is powerful. I use multiple levels of data
configuration:

1. **Global Data** (\`src/_data.ts\`): Site-wide information like title,
   description, and navigation
2. **Collection Defaults** (\`src/posts/_data.ts\`): Default values for all posts
3. **Individual Pages**: Per-page front matter

The global data file defines the site's core information:

\`\`\`typescript
interface SiteData {
  lang: string;
  home: {
    welcome: string;
  };
  menu_links: MenuLink[];
  extra_head: string[];
  metas: MetasConfig;
  jsonLd: Lume.Data["jsonLd"];
}
\`\`\`

This hierarchical approach ensures consistent metadata across the site while
maintaining flexibility for page-specific customizations.

## CMS Integration

In addition to the static build pipeline, the project includes a Lume CMS
configuration (\`_cms.ts\`) plus reusable field helpers (\`_cms-fields.ts\`). This
provides a structured editing experience for site settings, posts, and pages,
and it can be launched locally with \`deno task cms\`.

## Template Engine and Layouts

The site uses TypeScript functions with template literals for all templates and
layouts, providing strong type safety and IDE support. This leverages Lume's
support for TypeScript modules (\`.ts\` files) as templates.

The layout system follows a clear hierarchy in \`_includes/layouts/\`:

- \`base.ts\`: The foundational HTML structure with head elements and body
  scaffolding
- \`post.ts\`: Post-specific layout with article header, table of contents, and
  navigation
- \`page.ts\`: Static page layout for non-blog content
- \`archive.ts\`: Archive listing layout with pagination support
- \`archive-result.ts\`: Filtered views for tag and author archives

Each layout is an async function that receives \`Lume.Data\` and \`Lume.Helpers\`
parameters, returning a template string with the rendered HTML. For example:

\`\`\`typescript
export default async function (
  { title, content, metas }: Lume.Data,
  { url, date }: Lume.Helpers,
) {
  return \`<!doctype html>
    <html>
      <head><title>\${title}</title></head>
      <body>\${content}</body>
    </html>\`;
}
\`\`\`

The base layout handles critical aspects such as:

- Meta tag generation via component system (Open Graph, Twitter Cards)
- Theme switching with support for light/dark modes
- Canonical URL generation and feed links (RSS and JSON)
- Accessibility features (skip links, semantic markup, ARIA labels)
- Footer with current git commit SHA linked to GitHub
- Responsive navigation with dynamic menu links

The site uses reusable TypeScript components located in \`_components/\`:

- \`breadcrumbs.ts\`: Accessible breadcrumb navigation
- \`codeTabs.ts\`: Code snippet tabs wrapper
- \`modal.ts\`: Lightweight modal dialog markup
- \`pagination.ts\`: Provides previous/next navigation for archives
- \`postDetails.ts\`: Displays author, date, reading time, and tags
- \`postList.ts\`: Renders lists of blog posts
- \`tabs.ts\`: Tablist markup and behavior hooks

Components are called via the \`comp\` helper (e.g., \`await comp.postDetails()\`)
for clean, type-safe composition of reusable UI elements.

### Why TypeScript Over Template Engines?

Using TypeScript functions instead of traditional template engines like Vento
offers several advantages:

**Type Safety and IDE Support**: TypeScript catches errors at development time
and provides full IntelliSense, including autocomplete for variables, helpers,
and component props. This makes development faster and less error-prone.

**Familiar Syntax**: Developers already know JavaScript and TypeScript—template
literals are a core language feature, so there's no new syntax to learn.

**Easier Refactoring**: IDE refactoring tools understand TypeScript, making
large-scale changes safer when renaming properties or restructuring data.

**Component Composition**: The \`comp.*\` system provides clean reusability
without template-specific syntax for includes or partials.

**No Context Switching**: Writing templates in the same language as the build
configuration means less mental overhead.

Lume supports multiple template engines (Vento, Nunjucks, JSX), but TypeScript
functions provide a modern, type-safe alternative that integrates seamlessly
with Deno.

## Advanced Features and Customizations

### Dynamic Page Generation

The site implements dynamic page generation for archives and filtered views:

**Archive Pagination** (\`archive.page.ts\`):

- Generates paginated archive pages (\`/archive/\`, \`/archive/2/\`, etc.)
- Displays 10 posts per page (configurable via \`PAGINATION_SIZE\` constant)
- First page includes the search interface
- Automatically shown in the main navigation menu

**Tag and Author Pages** (\`archive-result.page.ts\`):

- Creates individual pages for each tag: \`/archive/[tag]/\`, \`/archive/[tag]/2/\`
- Creates individual pages for each author: \`/author/[author]/\`,
  \`/author/[author]/2/\`
- Dynamically generated at build time based on actual content
- Supports pagination for tags and authors with many posts

### CSS Architecture: ITCSS Methodology

The site's CSS follows the Inverted Triangle CSS (ITCSS) architecture,
organizing styles from generic to specific:

1. **Design Tokens**: CSS custom properties for colors, spacing, typography, and
   breakpoints
2. **Base Styles**: CSS resets, typography fundamentals, and global element
   styles
3. **Utilities**: Single-purpose utility classes for common patterns
4. **Components**: Reusable UI components (buttons, badges, cards, alerts)
5. **Layouts**: Page-specific and layout-related styles

This architecture is implemented through modular CSS files in \`_includes/css/\`,
imported via the main \`styles.css\` entry point. The approach provides excellent
maintainability and prevents specificity conflicts.

### Theme Switching System

The theme switching functionality combines client-side JavaScript and CSS for a
seamless experience. The JavaScript implementation in \`main.js\` handles:

- Initial theme detection (localStorage → system preference → light mode
  default)
- Smooth transitions between themes
- Persistence of user preference across sessions
- System theme change detection and synchronization

The CSS uses \`data-theme\` attributes on the document root to apply different
color schemes, supporting both light and dark modes with WCAG-compliant contrast
ratios.

### Image Enhancements and Accessibility

HTML post-processing adds accessibility attributes and performance enhancements
automatically:

- Automatic \`loading="lazy"\` for images below the fold
- \`loading="eager"\` for the first image to optimize Largest Contentful Paint
  (LCP)
- \`decoding="async"\` for non-blocking image decoding
- Empty \`alt=""\` attributes for decorative images when alt text is missing
- Markdown image handling via Lume markdown plugins

### Search Implementation

The search functionality leverages Pagefind, a client-side full-text search
library that indexes content at build time without requiring a backend server.
The integration provides:

- Automatic index generation during the build process
- Custom UI implementation matching the site's design system
- Sub-result display showing context around matched terms
- Accessible search interface with proper ARIA labels and keyboard navigation
- Filtering by tags and authors through search metadata

### Content Processing Pipeline

The content processing pipeline transforms markdown into optimized HTML:

1. **Markdown Parsing**: markdown-it with custom plugins (@mdit/plugin-alert for
   callouts)
2. **Syntax Highlighting**: Prism.js for multi-language code block highlighting
3. **Table of Contents Generation**: Automatic extraction and linking of
   headings
4. **Footnote Processing**: Markdown footnotes converted to accessible HTML
   structures
5. **Image Processing**: Lazy loading attributes, decoding hints, and
   accessibility enhancements
6. **Excerpt Extraction**: Automatic excerpt generation from content before
   \`<!--more-->\` marker
7. **HTML Enhancement**: Post-processing for accessibility, performance, and SEO

## Performance Optimizations

Several optimizations improve performance:

- **CSS Optimization**: Lightning CSS handles minification and modern CSS
  transformations
- **CSS Pruning**: PurgeCSS removes unused selectors after the build
- **JS Bundling**: ESBuild bundles and minifies JavaScript for production builds
- **Image Lazy Loading**: Strategic loading based on viewport position (eager
  for first image, lazy for others)
- **Clean URLs**: SlugifyUrls plugin converts \`index.html\` to clean \`/\` paths
- **Semantic HTML**: Proper heading hierarchy and landmark roles for better
  parsing
- **Feed Generation**: Pre-built RSS and JSON feeds for RSS readers

## Accessibility Considerations

Accessibility is baked into the implementation:

- Semantic HTML5 structure with proper landmarks (\`<nav>\`, \`<main>\`,
  \`<article>\`, \`<aside>\`)
- Logical heading hierarchy (single \`<h1>\` per page, proper nesting)
- Skip links for keyboard navigation to main content
- ARIA labels and roles for interactive elements (theme toggle, search)
- WCAG-compliant color contrast ratios in both light and dark themes
- Focus management for dynamic content and smooth scrolling
- Screen reader enhancements (visually hidden text for external link indicators)
- Keyboard navigation support for all interactive features

## Deployment and Build Process

The build process is streamlined with Deno:

\`\`\`bash
deno task build
\`\`\`

This generates the complete static site in the \`_site\` directory, ready for
deployment to any static hosting service (Netlify, Vercel, Cloudflare Pages,
etc.). The build process automatically handles:

- Asset optimization (CSS minification via Lightning CSS, JS
  bundling/minification via ESBuild)
- HTML generation from TypeScript templates and Markdown
- Search index generation (Pagefind)
- Sitemap creation (\`sitemap.xml\`)
- Feed generation (RSS feed at \`/feed.xml\` and JSON feed at \`/feed.json\`)
- Dynamic page generation (archive pagination, tag/author pages)
- URL resolution and slugification

## Conclusion

Building a blog with Lume combines the flexibility of static site generation
with modern web development practices. Deno's security model, first-class
TypeScript support, and Lume's plugin architecture create a solid foundation for
content-focused websites.

This architecture balances performance, accessibility, and maintainability. The
modular plugin system makes experimentation easy, while the data cascade ensures
consistency across the site.

For developers evaluating static site generators, Lume is worth considering. Its
design makes it suitable for everything from simple blogs to complex
documentation sites. Unlike opinionated frameworks that enforce specific
patterns, Lume provides sensible defaults while staying flexible enough to
accommodate different requirements and workflows.
`;

/**
 * Renders the post content.
 *
 * @param _data - Lume data object (unused).
 * @param helpers - Lume helpers including markdown renderer.
 * @returns The rendered HTML content.
 */
export default function (_data: Lume.Data, { md }: Lume.Helpers): string {
  return md(markdownContent);
}
