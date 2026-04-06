const VIEW_TRANSITION_NAME_PREFIX = "post-title";
export const VIEW_TRANSITION_NAME_ATTRIBUTE = "data-view-transition-name";

type ViewTransitionNameAttributes = Readonly<{
  [VIEW_TRANSITION_NAME_ATTRIBUTE]: string;
}>;

function normalizeTransitionSegment(segment: string): string {
  return segment
    .toLowerCase()
    .replaceAll(/[^a-z0-9]+/g, "-")
    .replaceAll(/^-+|-+$/g, "");
}

function decodePathSegment(segment: string): string {
  try {
    return decodeURIComponent(segment);
  } catch {
    return segment;
  }
}

export function resolvePostTitleViewTransitionName(
  url: string,
): string | undefined {
  if (url.length === 0) {
    return undefined;
  }

  try {
    const { pathname } = new URL(url, "https://normco.re");
    const segments = pathname
      .split("/")
      .filter(Boolean)
      .map(decodePathSegment)
      .map(normalizeTransitionSegment)
      .filter((segment) => segment.length > 0);
    const postsSegmentIndex = segments.lastIndexOf("posts");

    if (
      segments.length === 0 ||
      postsSegmentIndex === -1 ||
      postsSegmentIndex === segments.length - 1
    ) {
      return undefined;
    }

    return `${VIEW_TRANSITION_NAME_PREFIX}-${segments.join("-")}`;
  } catch {
    return undefined;
  }
}

export function resolvePostTitleViewTransitionAttributes(
  url: string,
): ViewTransitionNameAttributes | undefined {
  const name = resolvePostTitleViewTransitionName(url);

  return name === undefined
    ? undefined
    : { [VIEW_TRANSITION_NAME_ATTRIBUTE]: name };
}

export function renderViewTransitionNameAttribute(
  name: string | undefined,
): string {
  return name === undefined
    ? ""
    : ` ${VIEW_TRANSITION_NAME_ATTRIBUTE}="${name}"`;
}
