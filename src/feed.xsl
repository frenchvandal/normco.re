<?xml version="1.0" encoding="UTF-8"?>
<!--
  feed.xsl — RSS 2.0 and Atom 1.0 feed browser stylesheet.
  Transforms /feed.xml and /atom.xml into styled HTML using the site design system.
  Applied client-side by the browser via the <?xml-stylesheet?> PI.

  IMPORTANT: This file replicates the site header, footer, and page structure
  from Header.tsx, Footer.tsx, and base.tsx. When the site layout or CSS
  classes change, this file MUST be updated to match. See CLAUDE.md §7.6.
-->
<xsl:stylesheet version="1.0"
  xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
  xmlns:atom="http://www.w3.org/2005/Atom"
  xmlns:content="http://purl.org/rss/1.0/modules/content/">

  <xsl:output method="html" encoding="UTF-8"/>

  <xsl:template match="/">
    <xsl:variable name="is-atom" select="count(/atom:feed) &gt; 0"/>
    <xsl:variable name="feed-title">
      <xsl:choose>
        <xsl:when test="$is-atom">
          <xsl:value-of select="/atom:feed/atom:title"/>
        </xsl:when>
        <xsl:otherwise>
          <xsl:value-of select="/rss/channel/title"/>
        </xsl:otherwise>
      </xsl:choose>
    </xsl:variable>
    <xsl:variable name="feed-description">
      <xsl:choose>
        <xsl:when test="$is-atom">
          <xsl:value-of select="/atom:feed/atom:subtitle"/>
        </xsl:when>
        <xsl:otherwise>
          <xsl:value-of select="/rss/channel/description"/>
        </xsl:otherwise>
      </xsl:choose>
    </xsl:variable>
    <xsl:variable name="page-language">
      <xsl:choose>
        <xsl:when test="$is-atom">
          <xsl:value-of select="/atom:feed/@xml:lang"/>
        </xsl:when>
        <xsl:otherwise>
          <xsl:value-of select="/rss/channel/language"/>
        </xsl:otherwise>
      </xsl:choose>
    </xsl:variable>
    <xsl:variable name="self-href">
      <xsl:choose>
        <xsl:when test="$is-atom">
          <xsl:value-of select="/atom:feed/atom:link[@rel='self'][1]/@href"/>
        </xsl:when>
        <xsl:otherwise>
          <xsl:value-of select="/rss/channel/atom:link[@rel='self'][1]/@href"/>
        </xsl:otherwise>
      </xsl:choose>
    </xsl:variable>
    <xsl:variable name="feed-prefix">
      <xsl:choose>
        <xsl:when test="contains($self-href, '/atom.xml')">
          <xsl:value-of select="substring-before($self-href, '/atom.xml')"/>
        </xsl:when>
        <xsl:otherwise>
          <xsl:value-of select="substring-before($self-href, '/feed.xml')"/>
        </xsl:otherwise>
      </xsl:choose>
    </xsl:variable>
    <xsl:variable name="home-href">
      <xsl:choose>
        <xsl:when test="$is-atom">
          <xsl:value-of select="/atom:feed/atom:link[@rel='alternate'][1]/@href"/>
        </xsl:when>
        <xsl:otherwise>
          <xsl:value-of select="/rss/channel/link"/>
        </xsl:otherwise>
      </xsl:choose>
    </xsl:variable>
    <xsl:variable name="posts-href">
      <xsl:value-of select="concat($feed-prefix, '/posts/')"/>
    </xsl:variable>
    <xsl:variable name="about-href">
      <xsl:value-of select="concat($feed-prefix, '/about/')"/>
    </xsl:variable>
    <xsl:variable name="rss-href">
      <xsl:value-of select="concat($feed-prefix, '/feed.xml')"/>
    </xsl:variable>
    <xsl:variable name="atom-href">
      <xsl:value-of select="concat($feed-prefix, '/atom.xml')"/>
    </xsl:variable>
    <xsl:variable name="json-href">
      <xsl:value-of select="concat($feed-prefix, '/feed.json')"/>
    </xsl:variable>
    <xsl:variable name="feed-format-label">
      <xsl:choose>
        <xsl:when test="$is-atom">Atom</xsl:when>
        <xsl:otherwise>RSS</xsl:otherwise>
      </xsl:choose>
    </xsl:variable>
    <html data-color-mode="light" data-light-theme="light" data-dark-theme="dark">
      <xsl:attribute name="lang">
        <xsl:value-of select="$page-language"/>
      </xsl:attribute>
      <head>
        <meta charset="utf-8"/>
        <meta name="viewport" content="width=device-width, initial-scale=1"/>
        <meta name="color-scheme" content="light dark"/>
        <title>
          <xsl:value-of select="$feed-title"/>
          <xsl:text> — Feed</xsl:text>
        </title>
        <script>(()=>{const r=document.documentElement,m=matchMedia("(prefers-color-scheme: dark)");let v=null;try{const s=localStorage.getItem("color-mode");if(s==="light"||s==="dark"||s==="system")v=s;else{const l=localStorage.getItem("color-scheme");v=l==="light"||l==="dark"?l:null}}catch{v=null}const p=v??"system",t=p==="light"||p==="dark"?p:m.matches?"dark":"light";r.setAttribute("data-light-theme","light");r.setAttribute("data-dark-theme","dark");r.setAttribute("data-color-mode",t);r.setAttribute("data-theme-preference",p);r.setAttribute("data-color-scheme",t)})()</script>
        <link rel="stylesheet" href="/style.css"/>
      </head>
      <body data-a11y-link-underlines="true">
        <a class="skip-link" href="#main-content">Skip to content</a>
        <div class="site-wrapper">
          <!-- Carbon UI Shell Header (mirrors Header.tsx structure) -->
          <header class="cds--header">
            <div class="cds--header__wrapper">
              <div class="cds--header__left">
                <button type="button" class="cds--header__action cds--header__menu-toggle" aria-label="Open navigation menu" aria-expanded="false" aria-controls="site-side-nav">
                  <svg class="cds--header__menu-icon" width="20" height="20" viewBox="0 0 32 32" fill="currentColor" aria-hidden="true" focusable="false">
                    <path d="M4 6H28V8H4zM4 15H28V17H4zM4 24H28V26H4z"/>
                  </svg>
                </button>
                <a class="cds--header__name">
                  <xsl:attribute name="href">
                    <xsl:value-of select="$home-href"/>
                  </xsl:attribute>
                  <span class="cds--header__name--prefix">normco</span>.re
                </a>
                <nav class="cds--header__nav" aria-label="Main navigation">
                  <a class="cds--header__menu-item">
                    <xsl:attribute name="href">
                      <xsl:value-of select="$home-href"/>
                    </xsl:attribute>
                    <xsl:text>Home</xsl:text>
                  </a>
                  <a class="cds--header__menu-item">
                    <xsl:attribute name="href">
                      <xsl:value-of select="$posts-href"/>
                    </xsl:attribute>
                    <xsl:text>Writing</xsl:text>
                  </a>
                  <a class="cds--header__menu-item">
                    <xsl:attribute name="href">
                      <xsl:value-of select="$about-href"/>
                    </xsl:attribute>
                    <xsl:text>About</xsl:text>
                  </a>
                </nav>
              </div>
              <div class="cds--header__global">
                <!-- Search action -->
                <button type="button" class="cds--header__action" aria-label="Search" aria-expanded="false" aria-controls="site-search-panel">
                  <svg class="cds--header__action-icon" width="20" height="20" viewBox="0 0 32 32" fill="currentColor" aria-hidden="true" focusable="false">
                    <path d="M29,27.5859l-7.5521-7.5521a11.0177,11.0177,0,1,0-1.4141,1.4141L27.5859,29ZM4,13a9,9,0,1,1,9,9A9.01,9.01,0,0,1,4,13Z"/>
                  </svg>
                </button>
                <!-- Language selector action -->
                <button type="button" class="cds--header__action cds--header__language-toggle" aria-label="Select language" aria-expanded="false" aria-controls="site-language-panel" aria-haspopup="menu">
                  <svg class="cds--header__action-icon" width="20" height="20" viewBox="0 0 32 32" fill="currentColor" aria-hidden="true" focusable="false">
                    <path d="M27.85 29H30L24 14H21.65l-6 15H17.8l1.6-4h6.85zM20.2 23l2.62-6.56L25.45 23zM18 7V5H11V2H9V5H2V7H12.74a14.71 14.71 0 0 1-3.19 6.18A13.5 13.5 0 0 1 7.26 9H5.16a16.47 16.47 0 0 0 3 5.58A16.84 16.84 0 0 1 3 18l.75 1.86A18.47 18.47 0 0 0 9.53 16a16.92 16.92 0 0 0 5.76 3.84L16 18a14.48 14.48 0 0 1-5.12-3.37A17.64 17.64 0 0 0 14.8 7z"/>
                  </svg>
                </button>
                <!-- Theme toggle action -->
                <button id="theme-toggle" type="button" class="cds--header__action" aria-label="Toggle color theme" data-label-switch-light="Switch to light theme" data-label-switch-dark="Switch to dark theme" data-label-follow-system="Follow system theme">
                  <svg class="cds--header__action-icon theme-icon theme-icon--sun" width="20" height="20" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true" focusable="false">
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
                  <svg class="cds--header__action-icon theme-icon theme-icon--moon" width="20" height="20" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true" focusable="false">
                    <path d="M7.2,2.3c-1,4.4,1.7,8.7,6.1,9.8c0.1,0,0.1,0,0.2,0c-1.1,1.2-2.7,1.8-4.3,1.8c-0.1,0-0.2,0-0.2,0C5.6,13.8,3,11,3.2,7.7 C3.2,5.3,4.8,3.1,7.2,2.3"/>
                    <path d="M8,1L8,1C4.1,1.6,1.5,5.3,2.1,9.1c0.6,3.3,3.4,5.8,6.8,5.9c0.1,0,0.2,0,0.3,0c2.3,0,4.4-1.1,5.8-3 c0.2-0.2,0.1-0.6-0.1-0.7c-0.1-0.1-0.2-0.1-0.3-0.1c-3.9-0.3-6.7-3.8-6.4-7.6C8.3,3,8.4,2.4,8.6,1.8c0.1-0.3,0-0.6-0.3-0.7 C8.1,1,8.1,1,8,1z"/>
                  </svg>
                  <svg class="cds--header__action-icon theme-icon theme-icon--system" width="20" height="20" viewBox="0 0 32 32" fill="currentColor" aria-hidden="true" focusable="false">
                    <path d="M28,4H4A2,2,0,0,0,2,6V22a2,2,0,0,0,2,2h8v4H8v2H24V28H20V24h8a2,2,0,0,0,2-2V6A2,2,0,0,0,28,4ZM18,28H14V24h4Zm10-6H4V6H28Z"/>
                  </svg>
                </button>
              </div>
            </div>
          </header>

          <!-- Language selector menu (mirrors Header.tsx language menu) -->
          <section id="site-language-panel" class="cds--header__panel cds--header__language-panel" aria-label="Language" data-language-panel="" hidden="">
            <div class="cds--header__panel-content cds--header__language-menu" role="menu" aria-label="Language" data-language-menu="">
              <a href="/" class="cds--header__language-option" data-language-option="en" hreflang="en" lang="en" role="menuitemradio" aria-checked="true" tabindex="0">
                <span class="cds--header__language-label">English</span>
                <span class="cds--header__language-check" aria-hidden="true">
                  <svg class="cds--header__language-check-icon" width="16" height="16" viewBox="0 0 32 32" fill="currentColor" focusable="false">
                    <path d="M13 24 4 15 5.414 13.586 13 21.171 26.586 7.586 28 9 13 24z"/>
                  </svg>
                </span>
              </a>
              <a href="/fr/" class="cds--header__language-option" data-language-option="fr" hreflang="fr" lang="fr" role="menuitemradio" aria-checked="false" tabindex="-1">
                <span class="cds--header__language-label">Français</span>
                <span class="cds--header__language-check" aria-hidden="true">
                  <svg class="cds--header__language-check-icon" width="16" height="16" viewBox="0 0 32 32" fill="currentColor" focusable="false">
                    <path d="M13 24 4 15 5.414 13.586 13 21.171 26.586 7.586 28 9 13 24z"/>
                  </svg>
                </span>
              </a>
              <a href="/zh-hans/" class="cds--header__language-option" data-language-option="zhHans" hreflang="zh-Hans" lang="zh-Hans" role="menuitemradio" aria-checked="false" tabindex="-1">
                <span class="cds--header__language-label">简体中文</span>
                <span class="cds--header__language-check" aria-hidden="true">
                  <svg class="cds--header__language-check-icon" width="16" height="16" viewBox="0 0 32 32" fill="currentColor" focusable="false">
                    <path d="M13 24 4 15 5.414 13.586 13 21.171 26.586 7.586 28 9 13 24z"/>
                  </svg>
                </span>
              </a>
              <a href="/zh-hant/" class="cds--header__language-option" data-language-option="zhHant" hreflang="zh-Hant" lang="zh-Hant" role="menuitemradio" aria-checked="false" tabindex="-1">
                <span class="cds--header__language-label">繁體中文</span>
                <span class="cds--header__language-check" aria-hidden="true">
                  <svg class="cds--header__language-check-icon" width="16" height="16" viewBox="0 0 32 32" fill="currentColor" focusable="false">
                    <path d="M13 24 4 15 5.414 13.586 13 21.171 26.586 7.586 28 9 13 24z"/>
                  </svg>
                </span>
              </a>
            </div>
          </section>

          <!-- Search panel (mirrors Header.tsx search panel) -->
          <div id="site-search-panel" class="cds--header__panel cds--header__search-panel" role="search" aria-label="Search" hidden="" data-search-panel="">
            <div class="cds--header__panel-content">
              <div id="search" class="cds--header__search-root" data-search-root=""></div>
            </div>
          </div>

          <aside id="site-side-nav" class="cds--side-nav" aria-label="Main navigation" hidden="">
            <nav class="cds--side-nav__navigation">
              <ul class="cds--side-nav__items">
                <li class="cds--side-nav__item">
                  <a class="cds--side-nav__link">
                    <xsl:attribute name="href">
                      <xsl:value-of select="$home-href"/>
                    </xsl:attribute>
                    <span class="cds--side-nav__link-text">Home</span>
                  </a>
                </li>
                <li class="cds--side-nav__item">
                  <a class="cds--side-nav__link">
                    <xsl:attribute name="href">
                      <xsl:value-of select="$posts-href"/>
                    </xsl:attribute>
                    <span class="cds--side-nav__link-text">Writing</span>
                  </a>
                </li>
                <li class="cds--side-nav__item">
                  <a class="cds--side-nav__link">
                    <xsl:attribute name="href">
                      <xsl:value-of select="$about-href"/>
                    </xsl:attribute>
                    <span class="cds--side-nav__link-text">About</span>
                  </a>
                </li>
              </ul>
            </nav>
          </aside>

          <div class="cds--side-nav__overlay" aria-hidden="true"></div>

          <main class="site-main" id="main-content" data-pagefind-ignore="">
            <section class="feed-page site-page-shell site-page-shell--editorial" aria-labelledby="feed-title">
              <header class="pagehead feed-pagehead">
                <p class="pagehead-eyebrow">Syndication</p>
                <h1 id="feed-title" class="archive-page-title">
                  <xsl:value-of select="$feed-title"/>
                </h1>
                <p class="pagehead-lead">
                  <xsl:value-of select="$feed-description"/>
                </p>

                <div class="subhead feed-subhead">
                  <nav class="feed-page-actions" aria-label="Machine-readable URLs">
                    <div class="feed-copy-control" data-copy-control="" data-copy-state="idle" data-copy-label="RSS Feed">
                      <a class="feed-copy-link" aria-label="Open RSS feed URL">
                        <xsl:attribute name="href">
                          <xsl:value-of select="$rss-href"/>
                        </xsl:attribute>
                        <span class="feed-copy-link-title">RSS Feed</span>
                        <span class="feed-copy-link-url"><xsl:value-of select="$rss-href"/></span>
                      </a>
                      <button type="button" class="feed-copy-trigger" data-copy-button="" data-copy-path="{$rss-href}" data-copy-title="Copy RSS feed URL" title="Copy RSS feed URL" aria-label="Copy RSS feed URL">
                        <svg class="icon-svg feed-copy-icon feed-copy-icon--copy" width="16" height="16" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true" focusable="false">
                          <path d="M0 6.75C0 5.784.784 5 1.75 5h1.5a.75.75 0 0 1 0 1.5h-1.5a.25.25 0 0 0-.25.25v7.5c0 .138.112.25.25.25h7.5a.25.25 0 0 0 .25-.25v-1.5a.75.75 0 0 1 1.5 0v1.5A1.75 1.75 0 0 1 9.25 16h-7.5A1.75 1.75 0 0 1 0 14.25Z"/>
                          <path d="M5 1.75C5 .784 5.784 0 6.75 0h7.5C15.216 0 16 .784 16 1.75v7.5A1.75 1.75 0 0 1 14.25 11h-7.5A1.75 1.75 0 0 1 5 9.25Zm1.75-.25a.25.25 0 0 0-.25.25v7.5c0 .138.112.25.25.25h7.5a.25.25 0 0 0 .25-.25v-7.5a.25.25 0 0 0-.25-.25Z"/>
                        </svg>
                        <svg class="icon-svg feed-copy-icon feed-copy-icon--success" width="16" height="16" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true" focusable="false">
                          <path d="M13.78 4.22a.75.75 0 0 1 0 1.06l-7.25 7.25a.75.75 0 0 1-1.06 0L2.22 9.28a.751.751 0 0 1 .018-1.042.751.751 0 0 1 1.042-.018L6 10.94l6.72-6.72a.75.75 0 0 1 1.06 0Z"/>
                        </svg>
                      </button>
                      <span class="sr-only" data-copy-status="" aria-live="polite"></span>
                    </div>
                    <div class="feed-copy-control" data-copy-control="" data-copy-state="idle" data-copy-label="Atom Feed">
                      <a class="feed-copy-link" aria-label="Open Atom feed URL">
                        <xsl:attribute name="href">
                          <xsl:value-of select="$atom-href"/>
                        </xsl:attribute>
                        <span class="feed-copy-link-title">Atom Feed</span>
                        <span class="feed-copy-link-url"><xsl:value-of select="$atom-href"/></span>
                      </a>
                      <button type="button" class="feed-copy-trigger" data-copy-button="" data-copy-path="{$atom-href}" data-copy-title="Copy Atom feed URL" title="Copy Atom feed URL" aria-label="Copy Atom feed URL">
                        <svg class="icon-svg feed-copy-icon feed-copy-icon--copy" width="16" height="16" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true" focusable="false">
                          <path d="M0 6.75C0 5.784.784 5 1.75 5h1.5a.75.75 0 0 1 0 1.5h-1.5a.25.25 0 0 0-.25.25v7.5c0 .138.112.25.25.25h7.5a.25.25 0 0 0 .25-.25v-1.5a.75.75 0 0 1 1.5 0v1.5A1.75 1.75 0 0 1 9.25 16h-7.5A1.75 1.75 0 0 1 0 14.25Z"/>
                          <path d="M5 1.75C5 .784 5.784 0 6.75 0h7.5C15.216 0 16 .784 16 1.75v7.5A1.75 1.75 0 0 1 14.25 11h-7.5A1.75 1.75 0 0 1 5 9.25Zm1.75-.25a.25.25 0 0 0-.25.25v7.5c0 .138.112.25.25.25h7.5a.25.25 0 0 0 .25-.25v-7.5a.25.25 0 0 0-.25-.25Z"/>
                        </svg>
                        <svg class="icon-svg feed-copy-icon feed-copy-icon--success" width="16" height="16" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true" focusable="false">
                          <path d="M13.78 4.22a.75.75 0 0 1 0 1.06l-7.25 7.25a.75.75 0 0 1-1.06 0L2.22 9.28a.751.751 0 0 1 .018-1.042.751.751 0 0 1 1.042-.018L6 10.94l6.72-6.72a.75.75 0 0 1 1.06 0Z"/>
                        </svg>
                      </button>
                      <span class="sr-only" data-copy-status="" aria-live="polite"></span>
                    </div>
                    <div class="feed-copy-control" data-copy-control="" data-copy-state="idle" data-copy-label="JSON Feed">
                      <a class="feed-copy-link" aria-label="Open JSON Feed URL">
                        <xsl:attribute name="href">
                          <xsl:value-of select="$json-href"/>
                        </xsl:attribute>
                        <span class="feed-copy-link-title">JSON Feed</span>
                        <span class="feed-copy-link-url"><xsl:value-of select="$json-href"/></span>
                      </a>
                      <button type="button" class="feed-copy-trigger" data-copy-button="" data-copy-path="{$json-href}" data-copy-title="Copy JSON Feed URL" title="Copy JSON Feed URL" aria-label="Copy JSON Feed URL">
                        <svg class="icon-svg feed-copy-icon feed-copy-icon--copy" width="16" height="16" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true" focusable="false">
                          <path d="M0 6.75C0 5.784.784 5 1.75 5h1.5a.75.75 0 0 1 0 1.5h-1.5a.25.25 0 0 0-.25.25v7.5c0 .138.112.25.25.25h7.5a.25.25 0 0 0 .25-.25v-1.5a.75.75 0 0 1 1.5 0v1.5A1.75 1.75 0 0 1 9.25 16h-7.5A1.75 1.75 0 0 1 0 14.25Z"/>
                          <path d="M5 1.75C5 .784 5.784 0 6.75 0h7.5C15.216 0 16 .784 16 1.75v7.5A1.75 1.75 0 0 1 14.25 11h-7.5A1.75 1.75 0 0 1 5 9.25Zm1.75-.25a.25.25 0 0 0-.25.25v7.5c0 .138.112.25.25.25h7.5a.25.25 0 0 0 .25-.25v-7.5a.25.25 0 0 0-.25-.25Z"/>
                        </svg>
                        <svg class="icon-svg feed-copy-icon feed-copy-icon--success" width="16" height="16" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true" focusable="false">
                          <path d="M13.78 4.22a.75.75 0 0 1 0 1.06l-7.25 7.25a.75.75 0 0 1-1.06 0L2.22 9.28a.751.751 0 0 1 .018-1.042.751.751 0 0 1 1.042-.018L6 10.94l6.72-6.72a.75.75 0 0 1 1.06 0Z"/>
                        </svg>
                      </button>
                      <span class="sr-only" data-copy-status="" aria-live="polite"></span>
                    </div>
                  </nav>
                </div>

                <p class="feed-page-count">
                  <xsl:value-of select="count(/rss/channel/item | /atom:feed/atom:entry)"/>
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
                      <xsl:for-each select="/rss/channel/item | /atom:feed/atom:entry">
                        <xsl:variable name="entry-link">
                          <xsl:choose>
                            <xsl:when test="$is-atom">
                              <xsl:value-of select="atom:link[@rel='alternate'][1]/@href"/>
                            </xsl:when>
                            <xsl:otherwise>
                              <xsl:value-of select="link"/>
                            </xsl:otherwise>
                          </xsl:choose>
                        </xsl:variable>
                        <xsl:variable name="entry-date">
                          <xsl:choose>
                            <xsl:when test="$is-atom and string-length(atom:published) &gt; 0">
                              <xsl:value-of select="atom:published"/>
                            </xsl:when>
                            <xsl:when test="$is-atom">
                              <xsl:value-of select="atom:updated"/>
                            </xsl:when>
                            <xsl:otherwise>
                              <xsl:value-of select="pubDate"/>
                            </xsl:otherwise>
                          </xsl:choose>
                        </xsl:variable>
                        <li class="archive-item feed-entry-item">
                          <time class="archive-date feed-entry-date">
                            <xsl:attribute name="datetime"><xsl:value-of select="$entry-date"/></xsl:attribute>
                            <xsl:choose>
                              <xsl:when test="$is-atom">
                                <xsl:value-of select="substring($entry-date, 1, 10)"/>
                              </xsl:when>
                              <xsl:otherwise>
                                <xsl:value-of select="substring($entry-date, 6, 11)"/>
                              </xsl:otherwise>
                            </xsl:choose>
                          </time>
                          <a class="archive-title feed-entry-link">
                            <xsl:attribute name="href">
                              <xsl:value-of select="$entry-link"/>
                            </xsl:attribute>
                            <xsl:choose>
                              <xsl:when test="$is-atom">
                                <xsl:value-of select="atom:title"/>
                              </xsl:when>
                              <xsl:otherwise>
                                <xsl:value-of select="title"/>
                              </xsl:otherwise>
                            </xsl:choose>
                          </a>
                          <span class="archive-reading-time feed-entry-type"><xsl:value-of select="$feed-format-label"/></span>
                        </li>
                      </xsl:for-each>
                    </ol>
                  </section>
                </div>
              </section>
            </section>
          </main>

          <!-- Footer (mirrors Footer.tsx structure) -->
          <footer class="site-footer">
            <div class="site-footer-inner">
              <span>&#169; 2024&#8211;<script>document.write(new Date().getFullYear())</script> Phiphi</span>
              <nav class="site-footer-nav" aria-label="Site links">
                <a href="https://github.com/frenchvandal/normco.re" target="_blank" rel="noopener noreferrer" aria-label="Open GitHub repository">
                  <svg class="site-footer-icon" width="16" height="16" viewBox="0 0 32 32" fill="currentColor" aria-hidden="true" focusable="false">
                    <path d="M16 2a14 14 0 0 0-4.43 27.28c.7.13 1-.3 1-.67s0-1.21 0-2.38c-3.89.84-4.71-1.88-4.71-1.88A3.71 3.71 0 0 0 6.24 22.3c-1.27-.86.1-.85.1-.85A2.94 2.94 0 0 1 8.48 22.9a3 3 0 0 0 4.08 1.16 2.93 2.93 0 0 1 .88-1.87c-3.1-.36-6.37-1.56-6.37-6.92a5.4 5.4 0 0 1 1.44-3.76 5 5 0 0 1 .14-3.7s1.17-.38 3.85 1.43a13.3 13.3 0 0 1 7 0c2.67-1.81 3.84-1.43 3.84-1.43a5 5 0 0 1 .14 3.7 5.4 5.4 0 0 1 1.44 3.76c0 5.38-3.27 6.56-6.39 6.91a3.33 3.33 0 0 1 .95 2.59c0 1.87 0 3.38 0 3.84s.25.81 1 .67A14 14 0 0 0 16 2Z"/>
                  </svg>
                </a>
                <a aria-label="Open RSS feed">
                  <xsl:attribute name="href">
                    <xsl:value-of select="$rss-href"/>
                  </xsl:attribute>
                  <svg class="site-footer-icon" width="16" height="16" viewBox="0 0 32 32" fill="currentColor" aria-hidden="true" focusable="false">
                    <path d="M8 18c-3.3 0-6 2.7-6 6s2.7 6 6 6 6-2.7 6-6C14 20.7 11.3 18 8 18zM8 28c-2.2 0-4-1.8-4-4s1.8-4 4-4 4 1.8 4 4C12 26.2 10.2 28 8 28z"/>
                    <path d="M30 24h-2C28 13 19 4 8 4V2C20.1 2 30 11.9 30 24z"/>
                    <path d="M22 24h-2c0-6.6-5.4-12-12-12v-2C15.7 10 22 16.3 22 24z"/>
                  </svg>
                </a>
              </nav>
            </div>
          </footer>
        </div>
        <script src="/scripts/disclosure-controls.js"/>
        <script src="/scripts/theme-toggle.js"/>
        <script src="/scripts/pagefind-lazy-init.js"/>
        <script src="/scripts/feed-copy.js"/>
      </body>
    </html>
  </xsl:template>

</xsl:stylesheet>
