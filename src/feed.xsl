<?xml version="1.0" encoding="UTF-8"?>
<!--
  feed.xsl — RSS 2.0 feed browser stylesheet.
  Transforms /feed.xml into a styled HTML page using the site design system.
  Applied client-side by the browser via the <?xml-stylesheet?> PI.
-->
<xsl:stylesheet version="1.0"
  xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
  xmlns:atom="http://www.w3.org/2005/Atom"
  xmlns:content="http://purl.org/rss/1.0/modules/content/">

  <xsl:output method="html" encoding="UTF-8"/>

  <xsl:template match="/">
    <html lang="en">
      <head>
        <meta charset="utf-8"/>
        <meta name="viewport" content="width=device-width, initial-scale=1"/>
        <title>
          <xsl:value-of select="/rss/channel/title"/>
          <xsl:text> — Feed</xsl:text>
        </title>
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
                <h1 class="feed-page-title">
                  <xsl:value-of select="/rss/channel/title"/>
                </h1>
                <p class="feed-page-description">
                  <xsl:value-of select="/rss/channel/description"/>
                </p>
                <p class="feed-page-hint">
                  This is an RSS feed. Subscribe by copying this URL into your feed reader.
                </p>
              </header>

              <ol class="feed-entry-list">
                <xsl:for-each select="/rss/channel/item">
                  <li class="feed-entry">
                    <article>
                      <h2 class="feed-entry-title">
                        <a class="feed-entry-link">
                          <xsl:attribute name="href">
                            <xsl:value-of select="link"/>
                          </xsl:attribute>
                          <xsl:value-of select="title"/>
                        </a>
                      </h2>
                      <p class="feed-entry-meta">
                        <time>
                          <xsl:attribute name="datetime">
                            <xsl:value-of select="pubDate"/>
                          </xsl:attribute>
                          <xsl:value-of select="pubDate"/>
                        </time>
                      </p>
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
