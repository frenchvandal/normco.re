const EDITORIAL_IMAGE_SELECTOR = "main[data-pagefind-body] img";

export type EditorialImageQueryRoot = {
  querySelectorAll(
    selectors: string,
  ): Iterable<{ getAttribute(name: string): string | null }>;
};

export type EditorialImagePageSnapshot = {
  readonly pageUrl: string;
  readonly document: EditorialImageQueryRoot;
};

/**
 * Returns gate errors for editorial images missing explicit dimensions.
 *
 * Editorial scope is restricted to `main[data-pagefind-body]` to avoid
 * false positives in navigation chrome, feed/sitemap views, and unlisted pages.
 */
export function collectEditorialImageDimensionIssues(
  page: EditorialImagePageSnapshot,
): ReadonlyArray<string> {
  const issues: string[] = [];

  for (
    const image of page.document.querySelectorAll(EDITORIAL_IMAGE_SELECTOR)
  ) {
    const width = image.getAttribute("width");
    const height = image.getAttribute("height");
    const hasWidth = typeof width === "string" && width.trim().length > 0;
    const hasHeight = typeof height === "string" && height.trim().length > 0;

    if (hasWidth && hasHeight) {
      continue;
    }

    const missingDimensions = [
      ...(hasWidth ? [] : ["width"]),
      ...(hasHeight ? [] : ["height"]),
    ].join("+");
    const src = image.getAttribute("src") ?? "(missing src)";
    issues.push(
      `${page.pageUrl}: <img src="${src}"> is missing ${missingDimensions}`,
    );
  }

  return issues;
}

export function formatEditorialImageDimensionError(
  issues: ReadonlyArray<string>,
): string {
  const issueSummary = [
    `[editorial-image-dimensions] Found ${issues.length} editorial image(s) missing explicit dimensions`,
    ...issues.map((issue) => `- ${issue}`),
    "Add explicit width and height attributes or ensure the image source is a build-local asset so intrinsic dimensions can be resolved.",
  ];

  return issueSummary.join("\n");
}

export function assertEditorialImageDimensions(
  pages: ReadonlyArray<EditorialImagePageSnapshot>,
): void {
  const issues = pages.flatMap(collectEditorialImageDimensionIssues);

  if (issues.length === 0) {
    return;
  }

  throw new Error(formatEditorialImageDimensionError(issues));
}
