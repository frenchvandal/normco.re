/**
 * SourceInfo Component
 * Displays source file link and commit revision for a page
 */

import type { RepoInfo } from "../../plugins.ts";

interface SourceInfoProps {
  sourceCommit?: string;
  sourcePath?: string;
  repo?: RepoInfo;
  i18n: {
    source: {
      view_source: string;
      revision: string;
    };
  };
}

/**
 * Renders source file metadata and repository links.
 *
 * @param props - Source metadata and translations.
 * @returns The source info HTML markup.
 *
 * @example
 * ```ts
 * import { assertEquals } from "@std/assert";
 * import renderSourceInfo from "./SourceInfo.ts";
 *
 * assertEquals(typeof renderSourceInfo, "function");
 * ```
 */
export default function (
  { sourceCommit, sourcePath, repo, i18n }: SourceInfoProps,
) {
  if (!sourcePath) {
    return "";
  }

  const repoUrl = repo?.baseUrl && repo?.owner && repo?.name
    ? `${repo.baseUrl}/${repo.owner}/${repo.name}`
    : "";
  const hasRepo = Boolean(repoUrl);
  const hasBranch = Boolean(repo?.branch);
  const hasCommit = Boolean(sourceCommit);
  const shortSha = sourceCommit
    ? sourceCommit.substring(0, 8)
    : crypto.randomUUID().replaceAll("-", "").slice(0, 8);
  const sourceUrl = hasRepo && hasBranch && hasCommit
    ? `${repoUrl}/blob/${repo?.branch}/${sourcePath}`
    : "";
  const commitUrl = hasRepo && hasCommit
    ? `${repoUrl}/commit/${sourceCommit}`
    : "";

  // Fallback to repo URL when source file URL is not available (local dev)
  const sourceLinkUrl = sourceUrl || repoUrl;
  const sourceLabel = sourceLinkUrl
    ? `<a href="${sourceLinkUrl}" target="_blank" rel="noopener noreferrer">${i18n.source.view_source}</a>`
    : `<span class="source-info__text">${i18n.source.view_source}</span>`;
  const commitLabel = commitUrl
    ? `<a href="${commitUrl}" target="_blank" rel="noopener noreferrer">${i18n.source.revision} ${shortSha}</a>`
    : `<span class="source-info__commit">${i18n.source.revision} ${shortSha}</span>`;

  return `
<aside class="source-info" aria-label="Source information">
  ${sourceLabel}
  <span class="source-info__separator" aria-hidden="true">&middot;</span>
  ${commitLabel}
</aside>
`;
}
