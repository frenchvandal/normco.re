<?xml version="1.0" encoding="UTF-8"?>
<!--
  sitemap.xsl — Sitemap browser stylesheet.
  Transforms /sitemap.xml into a styled HTML page using the site design system.
  Applied client-side by the browser via the <?xml-stylesheet?> PI.
-->
<xsl:stylesheet version="1.0"
  xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
  xmlns:sm="http://www.sitemaps.org/schemas/sitemap/0.9">

  <xsl:output method="html" encoding="UTF-8"/>

  <xsl:template match="/">
    <html lang="en">
      <head>
        <meta charset="utf-8"/>
        <meta name="viewport" content="width=device-width, initial-scale=1"/>
        <title>Sitemap — normco.re</title>
        <script>(()=>{const t=localStorage.getItem("color-scheme");if(t==="light"||t==="dark")document.documentElement.setAttribute("data-color-scheme",t)})()</script>
        <link rel="stylesheet" href="/style.css"/>
      </head>
      <body>
        <div class="site-wrapper">
          <header class="site-header">
            <div class="site-header-inner">
              <a href="/" class="site-name">normco.re</a>
              <div class="site-header-end">
                <nav class="site-nav" aria-label="Main navigation">
                  <a href="/posts/">Writing</a>
                  <a href="/about/">About</a>
                </nav>
                <button type="button" id="theme-toggle" class="theme-toggle" aria-label="Toggle color theme">
                  <svg class="theme-icon" width="18" height="18" viewBox="0 0 20 20" fill="none" aria-hidden="true" focusable="false">
                    <circle cx="10" cy="10" r="7.5" stroke="currentColor" stroke-width="1.5"/>
                    <path d="M10 2.5A7.5 7.5 0 0 1 10 17.5Z" fill="currentColor"/>
                  </svg>
                </button>
              </div>
            </div>
          </header>

          <main class="site-main" id="main-content">
            <section class="feed-page">
              <header class="feed-page-header">
                <h1 class="feed-page-title">Sitemap</h1>
                <p class="feed-page-hint">
                  <xsl:value-of select="count(/sm:urlset/sm:url)"/>
                  <xsl:text> URLs indexed on normco.re</xsl:text>
                </p>
              </header>

              <ol class="feed-entry-list">
                <xsl:for-each select="/sm:urlset/sm:url">
                  <xsl:sort select="sm:loc"/>
                  <li class="feed-entry">
                    <article>
                      <h2 class="feed-entry-title">
                        <a class="feed-entry-link">
                          <xsl:attribute name="href">
                            <xsl:value-of select="sm:loc"/>
                          </xsl:attribute>
                          <xsl:value-of select="sm:loc"/>
                        </a>
                      </h2>
                      <xsl:if test="sm:lastmod">
                        <p class="feed-entry-meta">
                          Last modified:
                          <time>
                            <xsl:attribute name="datetime">
                              <xsl:value-of select="sm:lastmod"/>
                            </xsl:attribute>
                            <xsl:value-of select="substring(sm:lastmod, 1, 10)"/>
                          </time>
                        </p>
                      </xsl:if>
                    </article>
                  </li>
                </xsl:for-each>
              </ol>
            </section>
          </main>

          <footer class="site-footer">
            <div class="site-footer-inner">
              <span>&#169; normco.re</span>
              <nav class="site-footer-nav" aria-label="Feeds">
                <a href="/feed.xml">RSS</a>
                <a href="/feed.json">JSON Feed</a>
              </nav>
            </div>
          </footer>
        </div>
        <script src="/theme-toggle.js"/>
      </body>
    </html>
  </xsl:template>

</xsl:stylesheet>
