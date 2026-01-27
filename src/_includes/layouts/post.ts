/**
 * Post Layout
 * Layout for individual blog posts with TOC and post navigation
 */
export const layout = "layouts/base.ts";

/**
 * Body class assigned to post pages.
 *
 * @example
 * ```ts
 * import { assertEquals } from "@std/assert";
 * import { bodyClass } from "./post.ts";
 *
 * assertEquals(bodyClass, "body-post");
 * ```
 */
export const bodyClass = "body-post";

/**
 * Renders the post layout with metadata, TOC, and navigation.
 *
 * @param data - Lume data for the post and shared components.
 * @returns The post HTML markup.
 *
 * @example
 * ```ts
 * import { assertEquals } from "@std/assert";
 * import renderPostLayout from "./post.ts";
 *
 * assertEquals(typeof renderPostLayout, "function");
 * ```
 */
export default async function (
  {
    title,
    description,
    date,
    tags,
    author,
    readingInfo,
    toc,
    content,
    footnotes,
    url,
    search,
    i18n,
    comp,
    sourceCommit,
    sourcePath,
    repo,
    draft,
    image,
    imageAlt,
    imageCaption,
  }: Lume.Data,
) {
  const postDetails = await comp.PostDetails({
    date,
    tags,
    author,
    readingInfo,
  });

  const breadcrumbs = await comp.Breadcrumbs({
    items: [
      { label: i18n.nav.posts, url: "/archive/" },
      { label: title },
    ],
    homeLabel: i18n.nav.home,
  });

  const sourceInfo = await comp.SourceInfo({
    sourceCommit,
    sourcePath,
    repo,
    i18n,
  });

  const previousPost = search.previousPage(url, "type=post");
  const nextPost = search.nextPage(url, "type=post");

  const relatedPosts = await comp.RelatedPosts({
    currentUrl: url,
    tags,
    limit: 3,
    search,
    i18n: { related_posts: i18n.post.related_posts },
  });

  const draftBadge = draft
    ? `<span class="badge badge--draft">${i18n.post.draft}</span>`
    : "";

  const coverImage = image
    ? await comp.CoverImage({
      src: image,
      alt: imageAlt || title,
      caption: imageCaption,
      loading: "eager",
    })
    : "";

  return `
${breadcrumbs}

<article class="post${
    draft ? " post--draft" : ""
  }" data-pagefind-body data-title="${title}" data-pagefind-index-attrs="data-title">
  <header class="post-header">
    ${draftBadge}
    <h1 class="post-title u-display-title">${title}</h1>

    ${description ? `<p class="post-description">${description}</p>` : ""}

    ${postDetails}

    ${coverImage}
  </header>

  ${
    toc && toc.length > 0
      ? `
  <nav class="toc" aria-labelledby="toc-heading">
    <h2 id="toc-heading">${i18n.nav.toc}</h2>
    <ol role="list">
      ${
        toc.map((
          item: {
            slug: string;
            text: string;
            children: { slug: string; text: string }[];
          },
        ) => `
      <li>
        <a href="#${item.slug}">${item.text}</a>

        ${
          item.children && item.children.length > 0
            ? `
        <ul>
          ${
              item.children.map((child: { slug: string; text: string }) => `
          <li>
            <a href="#${child.slug}">${child.text}</a>
          </li>
          `).join("")
            }
        </ul>
        `
            : ""
        }
      </li>
      `).join("")
      }
    </ol>
  </nav>
  `
      : ""
  }

  <div class="post-body body">
    ${content}
  </div>

  ${
    footnotes && footnotes.length > 0
      ? `
  <aside role="note" class="footnotes">
    <dl>
      ${
        footnotes.map((
          note: { id: string; refId: string; label: string; content: string },
        ) => `
      <div id="${note.id}" class="footnote">
        <dt><a href="#${note.refId}">${note.label}</a></dt>
        <dd>${note.content}</dd>
      </div>
      `).join("")
      }
    </dl>
  </aside>
  `
      : ""
  }

  ${sourceInfo}

  ${relatedPosts}
</article>

<nav class="page-pagination pagination" aria-label="Post navigation">
  <ul role="list">
    ${
    previousPost
      ? `
    <li class="pagination-prev">
      <a href="${previousPost.url}" rel="prev">
        <span>${i18n.nav.previous_post}</span>
        <strong>${previousPost.title}</strong>
      </a>
    </li>
    `
      : ""
  }

    ${
    nextPost
      ? `
    <li class="pagination-next">
      <a href="${nextPost.url}" rel="next">
        <span>${i18n.nav.next_post}</span>
        <strong>${nextPost.title}</strong>
      </a>
    </li>
    `
      : ""
  }
  </ul>
</nav>
`;
}
