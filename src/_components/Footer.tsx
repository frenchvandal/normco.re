/** Site footer with copyright and primary links. */
type IconHelpers = Pick<Lume.Helpers, "icon">;

const DEFAULT_ICON_HELPERS: IconHelpers = {
  icon: (key, catalogId, variant) => {
    const variantSuffix = variant ? `-${variant}` : "";
    return `/icons/${catalogId}/${key}${variantSuffix}.svg`;
  },
};

const repositoryUrl = "https://github.com/frenchvandal/normco.re" as const;

/** Renders the site footer with the repository and RSS links. */
export default (
  { author }: { readonly author: string },
  helpers: IconHelpers = DEFAULT_ICON_HELPERS,
) => {
  const year = new Date().getFullYear();
  return (
    <footer class="site-footer">
      <div class="site-footer-inner">
        <span>© {year} {author}</span>
        <nav class="site-footer-nav" aria-label="Site links">
          <a
            href={repositoryUrl}
            class="feed-link"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Open GitHub repository"
          >
            <img
              inline
              class="octicon-svg feed-link-icon"
              width="16"
              height="16"
              src={helpers.icon("mark-github", "octicons", "16")}
              alt=""
              aria-hidden="true"
              focusable="false"
            />
          </a>
          <a href="/feed.xml" class="feed-link" aria-label="Open RSS feed">
            <img
              inline
              class="octicon-svg feed-link-icon"
              width="16"
              height="16"
              src={helpers.icon("rss", "octicons", "16")}
              alt=""
              aria-hidden="true"
              focusable="false"
            />
          </a>
        </nav>
      </div>
    </footer>
  );
};
