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
    <html lang="en" data-color-mode="light" data-light-theme="light" data-dark-theme="dark">
      <head>
        <meta charset="utf-8"/>
        <meta name="viewport" content="width=device-width, initial-scale=1"/>
        <meta name="color-scheme" content="light dark"/>
        <title>
          <xsl:value-of select="/rss/channel/title"/>
          <xsl:text> — Feed</xsl:text>
        </title>
        <script>(()=>{const r=document.documentElement,m=matchMedia("(prefers-color-scheme: dark)");let v=null;try{v=localStorage.getItem("color-mode")??localStorage.getItem("color-scheme")}catch{v=null}const t=v==="light"||v==="dark"?v:m.matches?"dark":"light";r.setAttribute("data-light-theme","light");r.setAttribute("data-dark-theme","dark");r.setAttribute("data-color-mode",t);r.setAttribute("data-color-scheme",t)})()</script>
        <link rel="stylesheet" href="/style.css"/>
      </head>
      <body>
        <div class="site-wrapper">
          <header class="site-header">
            <div class="site-header-inner">
              <div class="site-header-start">
                <a href="/" class="site-name">normco.re</a>
                <cds-header class="site-carbon-header" aria-label="Main navigation">
                  <cds-header-menu-button button-label-active="Open navigation menu" button-label-inactive="Open navigation menu"></cds-header-menu-button>
                  <cds-side-nav class="site-carbon-side-nav" aria-label="Main navigation">
                    <cds-side-nav-items>
                      <cds-side-nav-link href="/">Home</cds-side-nav-link>
                      <cds-side-nav-link href="/posts/">Writing</cds-side-nav-link>
                      <cds-side-nav-link href="/about/">About</cds-side-nav-link>
                    </cds-side-nav-items>
                  </cds-side-nav>
                  <cds-header-nav menu-bar-label="Main navigation">
                    <cds-header-nav-item href="/">Home</cds-header-nav-item>
                    <cds-header-nav-item href="/posts/">Writing</cds-header-nav-item>
                    <cds-header-nav-item href="/about/">About</cds-header-nav-item>
                  </cds-header-nav>
                </cds-header>
              </div>
              <div class="site-header-end">
                <cds-header-global-action class="site-search-action" aria-label="Search" button-label-active="Search" button-label-inactive="Search" panel-id="feed-search-panel">
                  <svg slot="icon" width="20" height="20" viewBox="0 0 32 32" fill="currentColor" aria-hidden="true" focusable="false">
                    <path d="M29,27.5859l-7.5521-7.5521a11.0177,11.0177,0,1,0-1.4141,1.4141L27.5859,29ZM4,13a9,9,0,1,1,9,9A9.01,9.01,0,0,1,4,13Z"/>
                  </svg>
                </cds-header-global-action>
                <cds-header-panel id="feed-search-panel" class="site-search-panel" aria-label="Search" data-search-panel="">
                  <div id="feed-search" class="site-search-root"></div>
                </cds-header-panel>
                <div class="language-switcher">
                  <details class="language-menu">
                    <summary class="language-menu-trigger" aria-label="Select language" title="Language">
                      <svg class="language-menu-trigger-icon language-menu-trigger-icon--watson" width="16" height="16" viewBox="0 0 32 32" fill="currentColor" aria-hidden="true" focusable="false">
                        <path d="M16,28h-3c-3.9,0-7-3.1-7-7v-4h2v4c0,2.8,2.2,5,5,5h3V28z"/>
                        <path d="M28,30h2.2l-4.6-11h-2.2l-4.6,11H21l0.8-2h5.3L28,30z M22.7,26l1.8-4.4l1.8,4.4H22.7z"/>
                        <path d="M28,15h-2v-4c0-2.8-2.2-5-5-5h-4V4h4c3.9,0,7,3.1,7,7V15z"/>
                        <path d="M14,5V3H9V1H7v2H2v2h8.2C10,5.9,9.4,7.5,8,9C7.4,8.3,6.9,7.6,6.6,7H4.3c0.4,1,1.1,2.2,2.1,3.3C5.6,11,4.4,11.6,3,12.1 L3.7,14c1.8-0.7,3.2-1.5,4.3-2.3c1.1,0.9,2.5,1.7,4.3,2.3l0.7-1.9c-1.4-0.5-2.6-1.2-3.5-1.8c1.9-2,2.5-4.1,2.7-5.3H14z"/>
                      </svg>
                      <span class="sr-only">Language</span>
                    </summary>
                    <ul class="language-menu-list" aria-label="Language">
                      <li class="language-menu-item-wrapper">
                        <a href="/" class="language-menu-item">
                          <span class="language-menu-check-icon" aria-hidden="true"></span>
                          <span>English</span>
                        </a>
                      </li>
                      <li class="language-menu-item-wrapper">
                        <a href="/fr/" class="language-menu-item">
                          <span class="language-menu-check-icon" aria-hidden="true"></span>
                          <span>Français</span>
                        </a>
                      </li>
                      <li class="language-menu-item-wrapper">
                        <a href="/zh-hans/" class="language-menu-item">
                          <span class="language-menu-check-icon" aria-hidden="true"></span>
                          <span>简体中文</span>
                        </a>
                      </li>
                      <li class="language-menu-item-wrapper">
                        <a href="/zh-hant/" class="language-menu-item">
                          <span class="language-menu-check-icon" aria-hidden="true"></span>
                          <span>繁體中文</span>
                        </a>
                      </li>
                    </ul>
                  </details>
                </div>
                <button type="button" id="theme-toggle" class="theme-toggle" aria-label="Toggle color theme" aria-pressed="false" data-label-switch-light="Switch to light theme" data-label-switch-dark="Switch to dark theme">
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
            <section class="feed-page" aria-labelledby="feed-title">
              <header class="pagehead feed-pagehead">
                <p class="pagehead-eyebrow">Syndication</p>
                <h1 id="feed-title" class="archive-page-title">
                  <xsl:value-of select="/rss/channel/title"/>
                </h1>
                <p class="pagehead-lead">
                  <xsl:value-of select="/rss/channel/description"/>
                </p>

                <div class="subhead feed-subhead">
                  <nav class="feed-page-actions" aria-label="Machine-readable URLs">
                    <div class="feed-copy-control" data-copy-control="" data-copy-state="idle" data-copy-label="Feed XML">
                      <a href="https://normco.re/feed.xml" class="feed-copy-link" aria-label="Open feed XML URL">
                        <span class="feed-copy-link-title">Feed XML</span>
                        <span class="feed-copy-link-url">https://normco.re/feed.xml</span>
                      </a>
                      <button type="button" class="feed-copy-trigger" data-copy-button="" data-copy-path="https://normco.re/feed.xml" data-copy-title="Copy feed XML URL" title="Copy feed XML URL" aria-label="Copy feed XML URL">
                        <svg class="octicon-svg feed-copy-icon feed-copy-icon--copy" width="16" height="16" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true" focusable="false">
                          <path d="M0 6.75C0 5.784.784 5 1.75 5h1.5a.75.75 0 0 1 0 1.5h-1.5a.25.25 0 0 0-.25.25v7.5c0 .138.112.25.25.25h7.5a.25.25 0 0 0 .25-.25v-1.5a.75.75 0 0 1 1.5 0v1.5A1.75 1.75 0 0 1 9.25 16h-7.5A1.75 1.75 0 0 1 0 14.25Z"/>
                          <path d="M5 1.75C5 .784 5.784 0 6.75 0h7.5C15.216 0 16 .784 16 1.75v7.5A1.75 1.75 0 0 1 14.25 11h-7.5A1.75 1.75 0 0 1 5 9.25Zm1.75-.25a.25.25 0 0 0-.25.25v7.5c0 .138.112.25.25.25h7.5a.25.25 0 0 0 .25-.25v-7.5a.25.25 0 0 0-.25-.25Z"/>
                        </svg>
                        <svg class="octicon-svg feed-copy-icon feed-copy-icon--success" width="16" height="16" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true" focusable="false">
                          <path d="M13.78 4.22a.75.75 0 0 1 0 1.06l-7.25 7.25a.75.75 0 0 1-1.06 0L2.22 9.28a.751.751 0 0 1 .018-1.042.751.751 0 0 1 1.042-.018L6 10.94l6.72-6.72a.75.75 0 0 1 1.06 0Z"/>
                        </svg>
                      </button>
                      <span class="sr-only" data-copy-status="" aria-live="polite"></span>
                    </div>
                    <div class="feed-copy-control" data-copy-control="" data-copy-state="idle" data-copy-label="JSON Feed">
                      <a href="https://normco.re/feed.json" class="feed-copy-link" aria-label="Open JSON Feed URL">
                        <span class="feed-copy-link-title">JSON Feed</span>
                        <span class="feed-copy-link-url">https://normco.re/feed.json</span>
                      </a>
                      <button type="button" class="feed-copy-trigger" data-copy-button="" data-copy-path="https://normco.re/feed.json" data-copy-title="Copy JSON Feed URL" title="Copy JSON Feed URL" aria-label="Copy JSON Feed URL">
                        <svg class="octicon-svg feed-copy-icon feed-copy-icon--copy" width="16" height="16" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true" focusable="false">
                          <path d="M0 6.75C0 5.784.784 5 1.75 5h1.5a.75.75 0 0 1 0 1.5h-1.5a.25.25 0 0 0-.25.25v7.5c0 .138.112.25.25.25h7.5a.25.25 0 0 0 .25-.25v-1.5a.75.75 0 0 1 1.5 0v1.5A1.75 1.75 0 0 1 9.25 16h-7.5A1.75 1.75 0 0 1 0 14.25Z"/>
                          <path d="M5 1.75C5 .784 5.784 0 6.75 0h7.5C15.216 0 16 .784 16 1.75v7.5A1.75 1.75 0 0 1 14.25 11h-7.5A1.75 1.75 0 0 1 5 9.25Zm1.75-.25a.25.25 0 0 0-.25.25v7.5c0 .138.112.25.25.25h7.5a.25.25 0 0 0 .25-.25v-7.5a.25.25 0 0 0-.25-.25Z"/>
                        </svg>
                        <svg class="octicon-svg feed-copy-icon feed-copy-icon--success" width="16" height="16" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true" focusable="false">
                          <path d="M13.78 4.22a.75.75 0 0 1 0 1.06l-7.25 7.25a.75.75 0 0 1-1.06 0L2.22 9.28a.751.751 0 0 1 .018-1.042.751.751 0 0 1 1.042-.018L6 10.94l6.72-6.72a.75.75 0 0 1 1.06 0Z"/>
                        </svg>
                      </button>
                      <span class="sr-only" data-copy-status="" aria-live="polite"></span>
                    </div>
                  </nav>
                </div>

                <p class="feed-page-count">
                  <xsl:value-of select="count(/rss/channel/item)"/>
                  <xsl:text> entries in this feed</xsl:text>
                </p>
              </header>

              <section class="archive-activity feed-activity" aria-label="Feed entries">
                <div class="archive-activity-main">
                  <section class="archive-year" aria-labelledby="feed-entries-title">
                    <header class="archive-year-header">
                      <h2 id="feed-entries-title" class="archive-year-heading">Latest entries</h2>
                      <p class="archive-year-summary">Sorted by publication date</p>
                    </header>
                    <ol class="archive-list feed-entry-list">
                      <xsl:for-each select="/rss/channel/item">
                        <li class="archive-item feed-entry-item">
                          <time class="archive-date feed-entry-date">
                            <xsl:attribute name="datetime">
                              <xsl:value-of select="pubDate"/>
                            </xsl:attribute>
                            <xsl:value-of select="substring(pubDate, 6, 11)"/>
                          </time>
                          <a class="archive-title feed-entry-link">
                            <xsl:attribute name="href">
                              <xsl:value-of select="link"/>
                            </xsl:attribute>
                            <xsl:value-of select="title"/>
                          </a>
                          <span class="archive-reading-time feed-entry-type">RSS</span>
                        </li>
                      </xsl:for-each>
                    </ol>
                  </section>
                </div>
              </section>
            </section>
          </main>

          <footer class="site-footer">
            <div class="site-footer-inner">
              <span>&#169; <script>document.write(new Date().getFullYear())</script> Phiphi</span>
              <nav class="site-footer-nav" aria-label="Site links">
                <a href="https://github.com/frenchvandal/normco.re" class="feed-link" target="_blank" rel="noopener noreferrer" aria-label="Open GitHub repository">
                  <svg class="octicon-svg feed-link-icon" width="16" height="16" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true" focusable="false">
                    <path d="M6.766 11.695C4.703 11.437 3.25 9.904 3.25 7.92c0-.806.281-1.677.75-2.258-.203-.532-.172-1.662.062-2.129.626-.081 1.469.258 1.969.726.594-.194 1.219-.291 1.985-.291.765 0 1.39.097 1.953.274.484-.451 1.343-.79 1.969-.709.218.435.25 1.564.046 2.113.5.613.766 1.436.766 2.274 0 1.984-1.453 3.485-3.547 3.759.531.355.891 1.129.891 2.016v1.678c0 .484.39.758.859.564C13.781 14.824 16 11.905 16 8.291 16 3.726 12.406 0 7.984 0 3.562 0 0 3.726 0 8.291c0 3.581 2.203 6.55 5.172 7.663A.595.595 0 0 0 6 15.389v-1.291c-.219.097-.5.162-.75.162-1.031 0-1.641-.581-2.078-1.662-.172-.435-.36-.693-.719-.742-.187-.016-.25-.097-.25-.193 0-.194.313-.339.625-.339.453 0 .844.29 1.25.887.313.468.641.678 1.031.678.391 0 .641-.146 1-.516.266-.275.469-.517.657-.678Z"/>
                  </svg>
                </a>
                <a href="/feed.xml" class="feed-link" aria-label="Open RSS feed">
                  <svg class="octicon-svg feed-link-icon" width="16" height="16" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true" focusable="false">
                    <path d="M2.002 2.725a.75.75 0 0 1 .797-.699C8.79 2.42 13.58 7.21 13.974 13.201a.75.75 0 0 1-1.497.098 10.502 10.502 0 0 0-9.776-9.776.747.747 0 0 1-.7-.798ZM2.84 7.05h-.002a7.002 7.002 0 0 1 6.113 6.111.75.75 0 0 1-1.49.178 5.503 5.503 0 0 0-4.8-4.8.75.75 0 0 1 .179-1.489ZM2 13a1 1 0 1 1 2 0 1 1 0 0 1-2 0Z"/>
                  </svg>
                </a>
              </nav>
            </div>
          </footer>
        </div>
        <script src="/scripts/carbon.js" type="module"/>
        <script src="/scripts/disclosure-controls.js"/>
        <script src="/scripts/theme-toggle.js"/>
        <script src="/scripts/pagefind-lazy-init.js"/>
        <script src="/scripts/feed-copy.js"/>
      </body>
    </html>
  </xsl:template>

</xsl:stylesheet>
