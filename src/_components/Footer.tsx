/** Site footer with copyright and primary links. */

import { getOcticonData } from "../utils/octicon.ts";

const rssIcon = getOcticonData("rss");
const githubIcon = getOcticonData("mark-github");
const repositoryUrl = "https://github.com/frenchvandal/normco.re" as const;

/** Renders the site footer with the repository and RSS links. */
export default ({ author }: { readonly author: string }) => {
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
            <svg
              class="octicon-svg feed-link-icon"
              width="16"
              height="16"
              viewBox={githubIcon.viewBox}
              fill="currentColor"
              aria-hidden="true"
              focusable="false"
            >
              <path d={githubIcon.path}></path>
            </svg>
          </a>
          <a href="/feed.xml" class="feed-link" aria-label="Open RSS feed">
            <svg
              class="octicon-svg feed-link-icon"
              width="16"
              height="16"
              viewBox={rssIcon.viewBox}
              fill="currentColor"
              aria-hidden="true"
              focusable="false"
            >
              <path d={rssIcon.path}></path>
            </svg>
          </a>
        </nav>
      </div>
    </footer>
  );
};
