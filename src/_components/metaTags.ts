/**
 * Meta Tags Component
 * Generates SEO meta tags including Open Graph, Twitter Cards, and JSON-LD
 */
export default function ({
  title,
  description,
  excerpt,
  image,
  url,
  type,
  lang,
  date,
  author,
  tags,
  readingInfo,
  metas,
}: Lume.Data, { url: urlHelper, date: dateHelper }: Lume.Helpers) {
  const pageTitle = title
    ? `${title} - ${metas?.site ?? ""}`
    : metas?.site ?? "";
  const pageDescription = (description || excerpt || metas?.description) ?? "";
  const pageImage = (image || metas?.image) ?? "/favicon.png";
  const pageUrl = urlHelper(url, true);
  const pageType = type === "post" ? "article" : "website";

  return `
<!-- Primary Meta Tags -->
<meta name="title" content="${pageTitle}">
<meta name="description" content="${pageDescription}">

<!-- Open Graph / Facebook -->
<meta property="og:type" content="${pageType}">
<meta property="og:url" content="${pageUrl}">
<meta property="og:title" content="${pageTitle}">
<meta property="og:description" content="${pageDescription}">
<meta property="og:image" content="${urlHelper(pageImage, true)}">
<meta property="og:site_name" content="${metas?.site ?? ""}">
${lang ? `<meta property="og:locale" content="${lang}">` : ""}

${
    type === "post"
      ? `
<!-- Article specific -->
${
        date
          ? `<meta property="article:published_time" content="${
            dateHelper(date, "DATETIME")
          }">`
          : ""
      }
${author ? `<meta property="article:author" content="${author}">` : ""}
${
        tags
          ? tags.map((tag: string) =>
            `<meta property="article:tag" content="${tag}">`
          ).join("\n")
          : ""
      }
`
      : ""
  }

<!-- Twitter -->
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:url" content="${pageUrl}">
<meta name="twitter:title" content="${pageTitle}">
<meta name="twitter:description" content="${pageDescription}">
<meta name="twitter:image" content="${urlHelper(pageImage, true)}">
${
    metas?.twitter
      ? `
<meta name="twitter:site" content="@${metas.twitter}">
<meta name="twitter:creator" content="@${metas.twitter}">
`
      : ""
  }

<!-- JSON-LD Structured Data -->
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "${pageType === "article" ? "BlogPosting" : "WebSite"}",
  "headline": "${(title || metas?.site) ?? ""}",
  "description": "${pageDescription}",
  "url": "${pageUrl}",
  "image": "${urlHelper(pageImage, true)}"${
    type === "post"
      ? `,
  "datePublished": "${dateHelper(date, "DATETIME")}"${
        author
          ? `,
  "author": {
    "@type": "Person",
    "name": "${author}"
  }`
          : ""
      }${
        readingInfo
          ? `,
  "timeRequired": "PT${readingInfo.minutes}M"`
          : ""
      }`
      : ""
  }${
    pageType === "website"
      ? `,
  "name": "${metas?.site ?? ""}",
  "publisher": {
    "@type": "Organization",
    "name": "${metas?.site ?? ""}",
    "logo": {
      "@type": "ImageObject",
      "url": "${urlHelper("/favicon.png", true)}"
    }
  }`
      : ""
  }
}
</script>
`;
}
