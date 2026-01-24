/**
 * JSON Feed Viewer Page
 * Standalone page for viewing JSON feed visually in the browser
 */
export const layout = false;
export const url = "/feed-json-viewer/";

export default function () {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>JSON Feed Viewer</title>
  <style>
    /* ==========================================================================
       Design Tokens - Identique au design system
       ========================================================================== */

    :root {
      /* Base colors */
      --color-base: #0a0c0f;
      --color-text: #29303d;
      --color-dim: #525f7a;
      --color-line: #e0e4eb;
      --color-background: #fff;
      --color-background-shade: #f6f7f9;

      /* Primary colors */
      --color-primary: #bf4040;
      --color-primary-highlight: #933;

      /* Semantic colors */
      --color-link: var(--color-base);
      --color-link-hover: var(--color-dim);

      /* Typography */
      --font-family-ui: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto,
        "Helvetica Neue", Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji",
        "Segoe UI Symbol";

      /* Font weights */
      --font-regular: 400;
      --font-bold: 600;

      /* Spacing */
      --spacing-xs: 0.25rem;
      --spacing-sm: 0.5rem;
      --spacing-md: 1rem;
      --spacing-lg: 1.5rem;
      --spacing-xl: 2rem;
      --spacing-2xl: 3rem;

      /* Layout */
      --content-max-width: 45rem;
      --content-padding-mobile: 2rem;

      /* Border radius */
      --border-radius-sm: 0.25rem;
      --border-radius-md: 0.375rem;

      /* Transitions */
      --transition-fast: 150ms ease-in-out;
      --transition-base: 250ms ease-in-out;
    }

    /* Dark Theme */
    @media (prefers-color-scheme: dark) {
      :root {
        --color-base: #fff;
        --color-text: #a3adc2;
        --color-dim: #7585a3;
        --color-line: #29303d;
        --color-background: #14181f;
        --color-background-shade: #1b1f28;
        --color-primary: #f45757;
        --color-primary-highlight: #f66f6f;
      }
    }

    /* ==========================================================================
       Reset & Base Styles
       ========================================================================== */

    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    body {
      font-family: var(--font-family-ui);
      font-size: 1.125rem;
      line-height: 1.6;
      color: var(--color-text);
      background-color: var(--color-background);
      padding: var(--spacing-xl) var(--content-padding-mobile);
      letter-spacing: -0.01em;
    }

    /* ==========================================================================
       Layout
       ========================================================================== */

    .container {
      max-width: var(--content-max-width);
      margin: 0 auto;
    }

    /* ==========================================================================
       Header
       ========================================================================== */

    .header {
      margin-bottom: var(--spacing-2xl);
      padding-bottom: var(--spacing-xl);
      border-bottom: 1px solid var(--color-line);
    }

    .site-title {
      font-size: clamp(1.75rem, 4vw, 2.5rem);
      font-weight: var(--font-bold);
      line-height: 1.2;
      letter-spacing: -0.02em;
      color: var(--color-base);
      margin-bottom: var(--spacing-sm);
    }

    .site-description {
      font-size: 1rem;
      color: var(--color-dim);
      margin-bottom: var(--spacing-lg);
    }

    .feed-info {
      background-color: var(--color-background-shade);
      padding: var(--spacing-lg);
      border-radius: var(--border-radius-md);
      border-left: 3px solid var(--color-primary);
    }

    .feed-info h2 {
      font-size: 1rem;
      font-weight: var(--font-bold);
      color: var(--color-base);
      margin-bottom: var(--spacing-sm);
    }

    .feed-info p {
      font-size: 0.875rem;
      color: var(--color-text);
      margin-bottom: var(--spacing-sm);
    }

    .feed-info p:last-child {
      margin-bottom: 0;
    }

    .feed-url {
      display: inline-block;
      font-family: monospace;
      font-size: 0.875rem;
      background-color: var(--color-background);
      padding: var(--spacing-xs) var(--spacing-sm);
      border-radius: var(--border-radius-sm);
      border: 1px solid var(--color-line);
      word-break: break-all;
      margin-top: var(--spacing-sm);
    }

    /* ==========================================================================
       Links
       ========================================================================== */

    a {
      color: var(--color-link);
      text-decoration: none;
      transition: color var(--transition-fast);
    }

    a:hover {
      color: var(--color-link-hover);
    }

    a:focus {
      outline: 2px solid var(--color-link);
      outline-offset: 2px;
    }

    /* ==========================================================================
       Article List
       ========================================================================== */

    .articles {
      list-style: none;
    }

    .article {
      margin-bottom: var(--spacing-2xl);
      padding-bottom: var(--spacing-2xl);
      border-bottom: 1px solid var(--color-line);
    }

    .article:last-child {
      border-bottom: none;
    }

    .article-title {
      font-size: clamp(1.5rem, 3vw, 2rem);
      font-weight: var(--font-bold);
      line-height: 1.2;
      letter-spacing: -0.02em;
      margin-bottom: var(--spacing-sm);
    }

    .article-title a {
      color: var(--color-base);
    }

    .article-title a:hover {
      color: var(--color-primary);
    }

    .article-meta {
      font-size: 0.875rem;
      color: var(--color-dim);
      margin-bottom: var(--spacing-lg);
      display: flex;
      gap: var(--spacing-md);
      flex-wrap: wrap;
      align-items: center;
    }

    .article-date {
      display: inline-flex;
      align-items: center;
    }

    .article-author {
      display: inline-flex;
      align-items: center;
    }

    .article-author::before {
      content: "•";
      margin-right: var(--spacing-sm);
    }

    .article-content {
      color: var(--color-text);
      line-height: 1.6;
    }

    .article-content p {
      margin-bottom: var(--spacing-md);
    }

    .article-link {
      display: inline-flex;
      align-items: center;
      margin-top: var(--spacing-lg);
      font-weight: var(--font-bold);
      color: var(--color-primary);
      font-size: 1rem;
    }

    .article-link:hover {
      color: var(--color-primary-highlight);
    }

    .article-link::after {
      content: "→";
      margin-left: var(--spacing-sm);
      transition: transform var(--transition-fast);
    }

    .article-link:hover::after {
      transform: translateX(4px);
    }

    /* ==========================================================================
       Loading & Error States
       ========================================================================== */

    .loading,
    .error {
      text-align: center;
      padding: var(--spacing-2xl);
      color: var(--color-dim);
    }

    .error {
      background-color: var(--color-background-shade);
      border-radius: var(--border-radius-md);
      color: var(--color-primary);
    }

    /* ==========================================================================
       Footer
       ========================================================================== */

    .footer {
      margin-top: var(--spacing-2xl);
      padding-top: var(--spacing-xl);
      border-top: 1px solid var(--color-line);
      text-align: center;
      font-size: 0.875rem;
      color: var(--color-dim);
    }

    /* ==========================================================================
       Responsive
       ========================================================================== */

    @media (min-width: 768px) {
      body {
        padding: var(--spacing-2xl) 8vw;
      }
    }

    @media (min-width: 1024px) {
      body {
        padding: var(--spacing-2xl) 15vw;
      }
    }
  </style>
</head>
<body>
  <div class="container">
    <div id="feed-container">
      <div class="loading">Loading JSON feed...</div>
    </div>
  </div>

  <script>
    // Fetch and display the JSON feed
    async function loadFeed() {
      const container = document.getElementById('feed-container');

      try {
        const response = await fetch('/feed.json');
        if (!response.ok) throw new Error('Unable to load feed');

        const feed = await response.json();

        // Build the HTML
        let html = \`
          <header class="header">
            <h1 class="site-title">\${escapeHtml(feed.title)}</h1>
            \${feed.description ? \`<p class="site-description">\${escapeHtml(feed.description)}</p>\` : ''}

            <div class="feed-info">
              <h2>📋 JSON Feed</h2>
              <p>This is a JSON feed. You can subscribe to this feed by copying the URL into your JSON Feed-compatible reader.</p>
              <p>Feed URL:</p>
              <code class="feed-url">\${escapeHtml(feed.feed_url || '/feed.json')}</code>
            </div>
          </header>

          <main>
            <ul class="articles">
        \`;

        // Add items
        if (feed.items && feed.items.length > 0) {
          feed.items.forEach(item => {
            html += \`
              <li class="article">
                <h2 class="article-title">
                  <a href="\${escapeHtml(item.url)}">\${escapeHtml(item.title)}</a>
                </h2>

                <div class="article-meta">
                  \${item.date_published ? \`
                    <time class="article-date" datetime="\${escapeHtml(item.date_published)}">
                      \${new Date(item.date_published).toISOString().split('T')[0]}
                    </time>
                  \` : ''}

                  \${item.authors && item.authors.length > 0 ? \`
                    <span class="article-author">\${escapeHtml(item.authors[0].name)}</span>
                  \` : ''}
                </div>

                \${item.content_html ? \`
                  <div class="article-content">
                    \${item.content_html}
                  </div>
                \` : item.summary ? \`
                  <div class="article-content">
                    <p>\${escapeHtml(item.summary)}</p>
                  </div>
                \` : ''}

                <a href="\${escapeHtml(item.url)}" class="article-link">
                  Read full article
                </a>
              </li>
            \`;
          });
        }

        html += \`
            </ul>
          </main>

          <footer class="footer">
            <p>Flux JSON Feed v\${feed.version || '1.0'}</p>
          </footer>
        \`;

        container.innerHTML = html;
      } catch (error) {
        container.innerHTML = \`
          <div class="error">
            <p>Error loading feed: \${escapeHtml(error.message)}</p>
          </div>
        \`;
      }
    }

    // Escape HTML to prevent XSS
    function escapeHtml(text) {
      const div = document.createElement('div');
      div.textContent = text;
      return div.innerHTML;
    }

    // Load feed when page loads
    loadFeed();
  </script>
</body>
</html>
`;
}
