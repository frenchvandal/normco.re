const XML_STYLESHEET_RULES = [
  {
    suffix: "/feed.xml",
    href: "/feed.xsl",
  },
  {
    suffix: "/atom.xml",
    href: "/feed.xsl",
  },
  {
    suffix: "/sitemap.xml",
    href: "/sitemap.xsl",
  },
] as const;

/** Returns the XSL stylesheet URL to inject for a generated XML page URL. */
export function getXmlStylesheetHref(pageUrl: string): string | undefined {
  for (const rule of XML_STYLESHEET_RULES) {
    if (pageUrl.endsWith(rule.suffix)) {
      return rule.href;
    }
  }

  return undefined;
}
