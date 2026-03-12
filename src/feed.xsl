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
      <body data-a11y-link-underlines="true">
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
                  <div id="feed-search" class="site-search-root" data-search-root=""></div>
                </cds-header-panel>
                <cds-header-global-action class="site-language-action" aria-label="Select language" button-label-active="Language" button-label-inactive="Language" panel-id="feed-language-panel">
                  <svg slot="icon" class="site-language-action-icon site-language-action-icon--watson" width="16" height="16" viewBox="0 0 32 32" fill="currentColor" aria-hidden="true" focusable="false">
                    <path d="M16,28h-3c-3.9,0-7-3.1-7-7v-4h2v4c0,2.8,2.2,5,5,5h3V28z"/>
                    <path d="M28,30h2.2l-4.6-11h-2.2l-4.6,11H21l0.8-2h5.3L28,30z M22.7,26l1.8-4.4l1.8,4.4H22.7z"/>
                    <path d="M28,15h-2v-4c0-2.8-2.2-5-5-5h-4V4h4c3.9,0,7,3.1,7,7V15z"/>
                    <path d="M14,5V3H9V1H7v2H2v2h8.2C10,5.9,9.4,7.5,8,9C7.4,8.3,6.9,7.6,6.6,7H4.3c0.4,1,1.1,2.2,2.1,3.3C5.6,11,4.4,11.6,3,12.1 L3.7,14c1.8-0.7,3.2-1.5,4.3-2.3c1.1,0.9,2.5,1.7,4.3,2.3l0.7-1.9c-1.4-0.5-2.6-1.2-3.5-1.8c1.9-2,2.5-4.1,2.7-5.3H14z"/>
                  </svg>
                </cds-header-global-action>
                <cds-header-panel id="feed-language-panel" class="site-language-panel" aria-label="Select language" data-language-panel="">
                  <cds-switcher class="site-language-switcher" aria-label="Language">
                    <cds-switcher-item href="/" selected="">English</cds-switcher-item>
                    <cds-switcher-item href="/fr/">Français</cds-switcher-item>
                    <cds-switcher-item href="/zh-hans/">简体中文</cds-switcher-item>
                    <cds-switcher-item href="/zh-hant/">繁體中文</cds-switcher-item>
                  </cds-switcher>
                </cds-header-panel>
                <cds-button id="theme-toggle" class="site-theme-action" kind="ghost" size="lg" tooltip-text="Toggle color theme" aria-label="Toggle color theme" aria-pressed="false" data-label-switch-light="Switch to light theme" data-label-switch-dark="Switch to dark theme">
                  <svg slot="icon" class="theme-icon theme-icon--sun" width="16" height="16" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true" focusable="false">
                    <path d="M7.5 1H8.5V3.5H7.5z"/>
                    <path d="M10.8 3.4H13.3V4.4H10.8z" transform="rotate(-45 12.041 3.923)"/>
                    <path d="M12.5 7.5H15V8.5H12.5z"/>
                    <path d="M11.6 10.8H12.6V13.3H11.6z" transform="rotate(-45 12.075 12.04)"/>
                    <path d="M7.5 12.5H8.5V15H7.5z"/>
                    <path d="M2.7 11.6H5.2V12.6H2.7z" transform="rotate(-45 3.96 12.078)"/>
                    <path d="M1 7.5H3.5V8.5H1z"/>
                    <path d="M3.4 2.7H4.4V5.2H3.4z" transform="rotate(-45 3.925 3.961)"/>
                    <path d="M8,6c1.1,0,2,0.9,2,2s-0.9,2-2,2S6,9.1,6,8S6.9,6,8,6 M8,5C6.3,5,5,6.3,5,8s1.3,3,3,3s3-1.3,3-3S9.7,5,8,5z"/>
                  </svg>
                  <svg slot="icon" class="theme-icon theme-icon--moon" width="16" height="16" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true" focusable="false">
                    <path d="M7.2,2.3c-1,4.4,1.7,8.7,6.1,9.8c0.1,0,0.1,0,0.2,0c-1.1,1.2-2.7,1.8-4.3,1.8c-0.1,0-0.2,0-0.2,0C5.6,13.8,3,11,3.2,7.7 C3.2,5.3,4.8,3.1,7.2,2.3"/>
                    <path d="M8,1L8,1C4.1,1.6,1.5,5.3,2.1,9.1c0.6,3.3,3.4,5.8,6.8,5.9c0.1,0,0.2,0,0.3,0c2.3,0,4.4-1.1,5.8-3 c0.2-0.2,0.1-0.6-0.1-0.7c-0.1-0.1-0.2-0.1-0.3-0.1c-3.9-0.3-6.7-3.8-6.4-7.6C8.3,3,8.4,2.4,8.6,1.8c0.1-0.3,0-0.6-0.3-0.7 C8.1,1,8.1,1,8,1z"/>
                  </svg>
                </cds-button>
              </div>
            </div>
          </header>

          <main class="site-main" id="main-content" data-pagefind-ignore="">
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
                <cds-link href="https://github.com/frenchvandal/normco.re" class="site-footer-action-link" size="sm" target="_blank" rel="noopener noreferrer" aria-label="Open GitHub repository">GitHub</cds-link>
                <cds-link href="/feed.xml" class="site-footer-action-link" size="sm" aria-label="Open RSS feed">RSS</cds-link>
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
