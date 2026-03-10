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
    <html lang="en" data-color-mode="light" data-light-theme="light" data-dark-theme="dark">
      <head>
        <meta charset="utf-8"/>
        <meta name="viewport" content="width=device-width, initial-scale=1"/>
        <title>Sitemap — normco.re</title>
        <script>(()=>{const r=document.documentElement,m=matchMedia("(prefers-color-scheme: dark)");let v=null;try{v=localStorage.getItem("color-mode")??localStorage.getItem("color-scheme")}catch{v=null}const t=v==="light"||v==="dark"?v:m.matches?"dark":"light";r.setAttribute("data-light-theme","light");r.setAttribute("data-dark-theme","dark");r.setAttribute("data-color-mode",t);r.setAttribute("data-color-scheme",t)})()</script>
        <link rel="stylesheet" href="/style.css"/>
      </head>
      <body>
        <div class="site-wrapper">
          <header class="site-header">
            <div class="site-header-inner">
              <a href="/" class="site-name">normco.re</a>
              <div class="site-header-end">
                <nav class="site-nav" aria-label="Main navigation">
                  <ul class="site-nav-list">
                    <li class="site-nav-item"><a href="/posts/" class="site-nav-link">Writing</a></li>
                    <li class="site-nav-item"><a href="/about/" class="site-nav-link">About</a></li>
                  </ul>
                </nav>
                <button type="button" id="theme-toggle" class="theme-toggle" aria-label="Toggle color theme" aria-pressed="false">
                  <svg class="theme-icon theme-icon--sun octicon-svg" width="16" height="16" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true" focusable="false">
                    <path d="M8 12a4 4 0 1 1 0-8 4 4 0 0 1 0 8Zm0-1.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Zm5.657-8.157a.75.75 0 0 1 0 1.061l-1.061 1.06a.749.749 0 0 1-1.275-.326.749.749 0 0 1 .215-.734l1.06-1.06a.75.75 0 0 1 1.06 0Zm-9.193 9.193a.75.75 0 0 1 0 1.06l-1.06 1.061a.75.75 0 1 1-1.061-1.06l1.06-1.061a.75.75 0 0 1 1.061 0ZM8 0a.75.75 0 0 1 .75.75v1.5a.75.75 0 0 1-1.5 0V.75A.75.75 0 0 1 8 0ZM3 8a.75.75 0 0 1-.75.75H.75a.75.75 0 0 1 0-1.5h1.5A.75.75 0 0 1 3 8Zm13 0a.75.75 0 0 1-.75.75h-1.5a.75.75 0 0 1 0-1.5h1.5A.75.75 0 0 1 16 8Zm-8 5a.75.75 0 0 1 .75.75v1.5a.75.75 0 0 1-1.5 0v-1.5A.75.75 0 0 1 8 13Zm3.536-1.464a.75.75 0 0 1 1.06 0l1.061 1.06a.75.75 0 0 1-1.06 1.061l-1.061-1.06a.75.75 0 0 1 0-1.061ZM2.343 2.343a.75.75 0 0 1 1.061 0l1.06 1.061a.751.751 0 0 1-.018 1.042.751.751 0 0 1-1.042.018l-1.06-1.06a.75.75 0 0 1 0-1.06Z"/>
                  </svg>
                  <svg class="theme-icon theme-icon--moon octicon-svg" width="16" height="16" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true" focusable="false">
                    <path d="M9.598 1.591a.749.749 0 0 1 .785-.175 7.001 7.001 0 1 1-8.967 8.967.75.75 0 0 1 .961-.96 5.5 5.5 0 0 0 7.046-7.046.75.75 0 0 1 .175-.786Zm1.616 1.945a7 7 0 0 1-7.678 7.678 5.499 5.499 0 1 0 7.678-7.678Z"/>
                  </svg>
                </button>
              </div>
            </div>
          </header>

          <main class="site-main" id="main-content">
            <section class="feed-page">
              <header class="pagehead feed-page-header">
                <p class="pagehead-eyebrow">Index</p>
                <h1 class="feed-page-title">Sitemap</h1>
                <div class="feed-page-meta">
                  <p class="feed-page-hint">
                    Machine-readable URL index for crawlers and tooling.
                  </p>
                  <nav class="feed-page-actions" aria-label="Feed formats">
                    <a href="/feed.xml" class="feed-page-button feed-page-button--primary">RSS XML</a>
                    <a href="/feed.json" class="feed-page-button">JSON Feed</a>
                  </nav>
                </div>
                <p class="feed-page-count">
                  <xsl:value-of select="count(/sm:urlset/sm:url)"/>
                  <xsl:text> URLs indexed on normco.re</xsl:text>
                </p>
              </header>

              <ol class="feed-entry-list">
                <xsl:for-each select="/sm:urlset/sm:url">
                  <xsl:sort select="sm:loc"/>
                  <li class="feed-entry">
                    <article class="feed-entry-card">
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
                          <span class="feed-entry-meta-label">Last modified</span>
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
                <a href="/feed.xml" class="feed-link">RSS</a>
                <a href="/feed.json" class="feed-link">JSON Feed</a>
              </nav>
            </div>
          </footer>
        </div>
        <script src="/scripts/theme-toggle.js"/>
      </body>
    </html>
  </xsl:template>

</xsl:stylesheet>
