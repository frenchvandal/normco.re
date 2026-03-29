import { resolvePageSetup } from "../../utils/page-setup.ts";
import { resolveDateHelper } from "../../utils/lume-helpers.ts";
import {
  PostBackToTop,
  PostDetails,
  PostInlineAnchor,
  PostRail,
  PostSummaryMeta,
  resolvePostNeighbors,
  resolvePostState,
} from "./post-view.tsx";

export const layout = "layouts/base.tsx";
export const extraStylesheets = ["/styles/blog-antd.css"];
const POST_MOBILE_TOOLS_MEDIA_QUERY = "(max-width: 65.99rem)";

// ── Layout ───────────────────────────────────────────────────────────────

export default (data: Lume.Data, helpers: Lume.Helpers) => {
  const dateFormat = resolveDateHelper(helpers);
  const page = resolvePageSetup(data.lang);
  const {
    language,
    languageDataCode,
    languageTag,
    archiveUrl: postsBaseUrl,
    homeUrl,
    translations: t,
  } = page;
  const neighbors = resolvePostNeighbors(
    data,
    typeof data.url === "string" ? data.url : "/",
    postsBaseUrl,
    `type=post lang=${languageDataCode}`,
  );
  const state = resolvePostState(
    data,
    dateFormat,
    { language, post: t.post },
    neighbors,
  );

  // Only ship localized copy overrides. The client script already knows the
  // English defaults, so duplicating them in data attributes adds noise.
  const codeCopyAttr = (label: string, fallback: string) =>
    state.includeCodeCopy && label !== fallback ? label : undefined;
  const codeCopyLabel = codeCopyAttr(t.post.copyCodeLabel, "Copy code");
  const codeCopyFeedback = codeCopyAttr(
    t.post.copyCodeFeedback,
    "Code copied",
  );
  const codeCopyFailedFeedback = codeCopyAttr(
    t.post.copyCodeFailedFeedback,
    "Cannot copy code",
  );
  const hasMobileTools = state.tags.length > 0 || state.backlinks.length > 0 ||
    neighbors.prev !== undefined || neighbors.next !== undefined;
  return (
    <>
      <div class="blog-antd-root">
        <div class="site-page-shell site-page-shell--wide">
          <div
            class={`feature-layout${
              state.hasRail ? " feature-layout--with-rail" : ""
            }`}
          >
            <article
              class="post-article feature-main"
              data-code-copy-label={codeCopyLabel}
              data-code-copy-feedback={codeCopyFeedback}
              data-code-copy-failed-feedback={codeCopyFailedFeedback}
            >
              <header class="post-header pagehead post-pagehead">
                <nav
                  class="site-breadcrumb"
                  aria-label={t.post.breadcrumbAriaLabel}
                >
                  <ol class="site-breadcrumb-list">
                    <li class="site-breadcrumb-item">
                      <a href={homeUrl} class="site-breadcrumb-link">
                        {t.navigation.home}
                      </a>
                    </li>
                    <li class="site-breadcrumb-item">
                      <a href={postsBaseUrl} class="site-breadcrumb-link">
                        {t.navigation.writing}
                      </a>
                    </li>
                  </ol>
                </nav>
                <div class="post-pagehead-grid">
                  <div class="post-pagehead-copy">
                    <h1 id="post-title" class="post-title">
                      {data.title ?? ""}
                    </h1>
                    <p class="post-meta">
                      <time datetime={state.publishedDateIso}>
                        {state.publishedDateLabel}
                      </time>
                      {state.readingTimeLabel !== undefined && (
                        <>
                          <span class="post-meta-separator" aria-hidden="true">
                            ·
                          </span>
                          <span>{state.readingTimeLabel}</span>
                        </>
                      )}
                    </p>
                  </div>
                  {state.showSummaryBlock && (
                    <div class="post-pagehead-context">
                      {state.visibleSummary !== undefined && (
                        <>
                          <p class="post-pagehead-kicker">
                            {t.post.summaryEyebrow}
                          </p>
                          <p class="post-pagehead-summary pagehead-lead">
                            {state.visibleSummary}
                          </p>
                        </>
                      )}
                      {state.summaryItems.length > 0 && (
                        <PostSummaryMeta items={state.summaryItems} />
                      )}
                    </div>
                  )}
                </div>
              </header>

              <PostInlineAnchor
                outline={state.outline}
                title={t.post.outlineTitle}
                ariaLabel={t.post.outlineAriaLabel}
              />

              <section
                class="post-content"
                lang={languageTag}
                aria-labelledby="post-title"
              >
                {state.renderedChildren}
              </section>

              <PostDetails
                title={t.post.detailsTitle}
                items={state.publicationDetails}
              />
            </article>

            {state.hasRail && (
              <PostRail
                language={language}
                translations={t.post}
                closeLabel={t.site.closeLabel}
                outline={state.outline}
                backlinks={state.backlinks}
                tags={state.tags}
                prev={neighbors.prev}
                next={neighbors.next}
              />
            )}
          </div>
        </div>
        <PostBackToTop label={t.post.backToTopLabel} />
      </div>
      {hasMobileTools && (
        <script
          type="module"
          src="/scripts/post-mobile-tools-loader.js"
          data-media-query={POST_MOBILE_TOOLS_MEDIA_QUERY}
        />
      )}
      {state.includeCodeCopy && (
        <script src="/scripts/post-code-copy.js" defer></script>
      )}
    </>
  );
};
