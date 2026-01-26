<?xml version="1.0" encoding="utf-8"?>
<xsl:stylesheet version="3.0"
  xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
  xmlns:atom="http://www.w3.org/2005/Atom">

  <xsl:output method="html" version="1.0" encoding="UTF-8" indent="yes"/>

  <xsl:template match="/">
    <html lang="en">
      <head>
        <meta charset="UTF-8"/>
        <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
        <title>
          <xsl:value-of select="/rss/channel/title"/> - RSS Feed
        </title>
        <script>
          <![CDATA[
            // Detect and apply theme preference (synced with main site)
            (function() {
              const storedTheme = localStorage.getItem('theme');
              const hasStoredTheme = storedTheme === 'dark' || storedTheme === 'light';

              if (hasStoredTheme) {
                document.documentElement.setAttribute('data-theme', storedTheme);
              } else {
                document.documentElement.removeAttribute('data-theme');
              }
            })();
          ]]>
        </script>
        <style><![CDATA[
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
            --color-primary: #005cc5;
            --color-primary-highlight: #3388ff;

            /* Semantic colors */
            --color-link: var(--color-primary);
            --color-link-hover: var(--color-primary-highlight);

            /* Typography */
            --font-family-ui: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto,
              "Helvetica Neue", Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji",
              "Segoe UI Symbol";
            --font-family-code: "SFMono-Regular", Consolas, "Roboto Mono", Monaco, "Courier New", monospace;

            /* Font scales */
            --font-display: clamp(2.5rem, 8vw, 4rem); /* Large titles */
            --font-title: clamp(1.75rem, 4vw, 2.5rem); /* Titles */
            --font-body: 1.125rem; /* Body text */
            --font-small: 0.875rem; /* Small text */
            --font-ui: 1rem; /* UI elements */

            /* Font weights */
            --font-regular: 400;
            --font-bold: 600;

            /* Spacing */
            --spacing-xs: 0.25rem; /* 4px */
            --spacing-sm: 0.5rem; /* 8px */
            --spacing-md: 1rem; /* 16px */
            --spacing-lg: 1.5rem; /* 24px */
            --spacing-xl: 2rem; /* 32px */
            --spacing-2xl: 3rem; /* 48px */
            --spacing-3xl: 4rem; /* 64px */

            /* Row gaps (vertical spacing) */
            --row-gap-xsmall: 1rem;
            --row-gap-small: 2.5rem;
            --row-gap-medium: 5rem;
            --row-gap-large: 7.5rem;

            /* Layout */
            --content-max-width: 45rem;
            --content-padding-mobile: 2rem;

            /* Border radius */
            --border-radius-sm: 0.25rem;
            --border-radius-md: 0.375rem;
            --border-radius-lg: 0.5rem;

            /* Transitions */
            --transition-fast: 150ms ease-in-out;
            --transition-base: 250ms ease-in-out;
            --transition-slow: 350ms ease-in-out;

            /* Breakpoints */
            --breakpoint-mobile: 480px;
            --breakpoint-tablet: 768px;
            --breakpoint-desktop: 1024px;
            --breakpoint-wide: 1440px;
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
              --color-primary: #79c0ff;
              --color-primary-highlight: #58a6ff;
            }
          }

          /* Explicit dark theme override */
          [data-theme="dark"] {
            --color-base: #fff;
            --color-text: #a3adc2;
            --color-dim: #7585a3;
            --color-line: #29303d;
            --color-background: #14181f;
            --color-background-shade: #1b1f28;
            --color-primary: #79c0ff;
            --color-primary-highlight: #58a6ff;
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
            font-size: var(--font-body);
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
            font-size: var(--font-title);
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

          .feed-url-wrapper {
            display: flex;
            align-items: center;
            gap: var(--spacing-sm);
            margin-top: var(--spacing-sm);
            flex-wrap: wrap;
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
          }

          /* ==========================================================================
             Copy Button
             ========================================================================== */

          .copy-btn {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            gap: var(--spacing-xs);
            padding: var(--spacing-xs) var(--spacing-sm);
            font-family: var(--font-family-ui);
            font-size: 0.875rem;
            font-weight: var(--font-bold);
            color: var(--color-text);
            background-color: var(--color-background);
            border: 1px solid var(--color-line);
            border-radius: var(--border-radius-sm);
            cursor: pointer;
            transition: background-color var(--transition-fast), border-color var(--transition-fast);
            white-space: nowrap;
          }

          .copy-btn:hover {
            background-color: var(--color-background-shade);
            border-color: var(--color-dim);
          }

          .copy-btn:focus-visible {
            outline: 2px solid var(--color-primary);
            outline-offset: 2px;
          }

          .copy-btn:active {
            transform: scale(0.98);
          }

          .copy-btn svg {
            width: 1em;
            height: 1em;
            flex-shrink: 0;
          }

          /* ==========================================================================
             Toast Notification
             ========================================================================== */

          .toast-container {
            position: fixed;
            bottom: var(--spacing-lg);
            left: 50%;
            transform: translateX(-50%);
            z-index: 1000;
            pointer-events: none;
          }

          .toast {
            display: flex;
            align-items: center;
            gap: var(--spacing-sm);
            padding: var(--spacing-sm) var(--spacing-md);
            background-color: var(--color-background-shade);
            border: 1px solid var(--color-line);
            border-radius: var(--border-radius-md);
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
            font-size: 0.875rem;
            color: var(--color-text);
            opacity: 0;
            transform: translateY(1rem);
            transition: opacity var(--transition-base), transform var(--transition-base);
            pointer-events: auto;
          }

          .toast--visible {
            opacity: 1;
            transform: translateY(0);
          }

          .toast--success {
            border-left: 3px solid #10b981;
          }

          .toast svg {
            width: 1.25em;
            height: 1.25em;
            color: #10b981;
            flex-shrink: 0;
          }

          @media (prefers-reduced-motion: reduce) {
            .toast {
              transition: opacity 0.01ms;
              transform: none;
            }
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
            outline: 2px solid var(--color-primary);
            outline-offset: 2px;
          }

          /* Accessibility - Focus visible styles */
          :focus-visible {
            outline: 2px solid var(--color-primary);
            outline-offset: 2px;
            border-radius: var(--border-radius-sm);
          }

          /* Reduced motion support */
          @media (prefers-reduced-motion: reduce) {
            * {
              animation-duration: 0.01ms !important;
              animation-iteration-count: 1 !important;
              transition-duration: 0.01ms !important;
            }
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
            font-size: var(--font-title);
            font-weight: var(--font-bold);
            line-height: 1.2;
            letter-spacing: -0.02em;
            margin-bottom: var(--spacing-sm);
          }

          .article-title a {
            color: var(--color-base);
          }

          .article-title a:hover {
            color: var(--color-primary-highlight);
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
             Utility Classes - Following Design System Patterns
             ========================================================================== */

          .u-text-dim {
            color: var(--color-dim);
          }

          .u-text-center {
            text-align: center;
          }

          .u-flex-row {
            display: flex;
            flex-direction: row;
            flex-wrap: wrap;
            gap: var(--spacing-md);
          }

          .u-flex-column {
            display: flex;
            flex-direction: column;
            gap: var(--spacing-md);
          }

          .u-gap-sm {
            gap: var(--spacing-sm);
          }

          .u-gap-md {
            gap: var(--spacing-md);
          }

          .u-gap-lg {
            gap: var(--spacing-lg);
          }

          .u-mb-md {
            margin-bottom: var(--spacing-md);
          }

          .u-mb-lg {
            margin-bottom: var(--spacing-lg);
          }

          .u-p-lg {
            padding: var(--spacing-lg);
          }

          .u-link-underline {
            text-decoration: underline;
          }

          .u-link-underline:hover {
            text-decoration: none;
          }

          /* ==========================================================================
             Badge
             ========================================================================== */

          .badge {
            display: inline-block;
            padding: var(--spacing-xs) var(--spacing-sm);
            background-color: var(--color-background-shade);
            color: var(--color-text);
            border-radius: var(--border-radius-sm);
            font-size: 0.75rem;
            font-weight: var(--font-bold);
            text-transform: uppercase;
            letter-spacing: 0.05em;
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
             Responsive Design - Following Design System Mobile-First Approach
             ========================================================================== */

          @media (max-width: 768px) {
            body {
              padding: var(--spacing-xl) var(--content-padding-mobile);
            }

            .header {
              margin-bottom: var(--spacing-xl);
            }
          }

          @media (min-width: 769px) {
            body {
              padding: var(--spacing-2xl) 8vw;
            }
          }

          @media (min-width: 1025px) {
            body {
              padding: var(--spacing-2xl) 15vw;
            }
          }
        ]]></style>
      </head>
      <body>
        <div class="container">
          <!-- Header -->
          <header class="header">
            <h1 class="site-title">
              <xsl:value-of select="/rss/channel/title"/>
            </h1>
            <p class="site-description">
              <xsl:value-of select="/rss/channel/description"/>
            </p>

            <div class="feed-info">
              <h2>📡 RSS Feed</h2>
              <p>This is an RSS feed. Subscribe by copying the URL into your favorite reader (Feedly, Inoreader, NewsBlur, NetNewsWire, Reeder, etc.).</p>
              <p>Feed URL:</p>
              <div class="feed-url-wrapper">
                <code class="feed-url" id="feed-url">
                  <xsl:value-of select="/rss/channel/atom:link[@rel='self']/@href"/>
                </code>
                <button type="button" class="copy-btn" id="copy-btn" aria-label="Copy feed URL to clipboard">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                    <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
                    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
                  </svg>
                  Copy
                </button>
              </div>
            </div>
          </header>

          <!-- Articles -->
          <main>
            <ul class="articles">
              <xsl:for-each select="/rss/channel/item">
                <li class="article">
                  <h2 class="article-title">
                    <a href="{link}">
                      <xsl:value-of select="title"/>
                    </a>
                  </h2>

                  <div class="article-meta">
                    <xsl:if test="pubDate">
                      <time class="article-date" datetime="{pubDate}">
                        <xsl:value-of select="substring(pubDate, 1, 16)"/>
                      </time>
                    </xsl:if>

                    <xsl:if test="author">
                      <span class="article-author">
                        <xsl:value-of select="author"/>
                      </span>
                    </xsl:if>
                  </div>

                  <xsl:if test="description">
                    <div class="article-content">
                      <xsl:value-of select="description" disable-output-escaping="yes"/>
                    </div>
                  </xsl:if>

                  <a href="{link}" class="article-link">
                    Read the full article
                  </a>
                </li>
              </xsl:for-each>
            </ul>
          </main>

          <!-- Footer -->
          <footer class="footer">
            <p>
              RSS Feed
              <xsl:if test="/rss/channel/lastBuildDate">
                - Last updated on
                <time datetime="{/rss/channel/lastBuildDate}">
                  <xsl:value-of select="substring(/rss/channel/lastBuildDate, 1, 16)"/>
                </time>
              </xsl:if>
            </p>
          </footer>
        </div>

        <!-- Toast container -->
        <div class="toast-container" id="toast-container">
          <div class="toast toast--success" id="toast" role="status" aria-live="polite">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <path d="M20 6L9 17l-5-5"/>
            </svg>
            <span>Feed URL copied to clipboard</span>
          </div>
        </div>

        <script>
          <![CDATA[
            // Copy feed URL to clipboard
            (function() {
              const copyBtn = document.getElementById('copy-btn');
              const feedUrl = document.getElementById('feed-url');
              const toast = document.getElementById('toast');
              let toastTimeout = null;

              if (copyBtn && feedUrl && toast) {
                copyBtn.addEventListener('click', async function() {
                  const url = feedUrl.textContent.trim();

                  try {
                    await navigator.clipboard.writeText(url);
                    showToast();
                  } catch (err) {
                    // Fallback for older browsers
                    const textArea = document.createElement('textarea');
                    textArea.value = url;
                    textArea.style.position = 'fixed';
                    textArea.style.left = '-9999px';
                    document.body.appendChild(textArea);
                    textArea.select();
                    try {
                      document.execCommand('copy');
                      showToast();
                    } catch (e) {
                      console.error('Copy failed:', e);
                    }
                    document.body.removeChild(textArea);
                  }
                });
              }

              function showToast() {
                // Clear any existing timeout
                if (toastTimeout) {
                  clearTimeout(toastTimeout);
                }

                // Show toast
                toast.classList.add('toast--visible');

                // Hide after 3 seconds
                toastTimeout = setTimeout(function() {
                  toast.classList.remove('toast--visible');
                }, 3000);
              }
            })();
          ]]>
        </script>
      </body>
    </html>
  </xsl:template>

</xsl:stylesheet>
