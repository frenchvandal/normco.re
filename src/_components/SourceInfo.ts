/**
 * SourceInfo Component
 * Displays source file link and commit revision for a page
 */

interface SourceInfoProps {
  sourceCommit?: string;
  sourcePath?: string;
  repoUrl: string;
  i18n: {
    source: {
      view_source: string;
      revision: string;
    };
  };
}

export default function (
  { sourceCommit, sourcePath, repoUrl, i18n }: SourceInfoProps,
) {
  if (!sourceCommit || !sourcePath) {
    return "";
  }

  const sourceUrl = `${repoUrl}/blob/main/${sourcePath}`;
  const commitUrl = `${repoUrl}/commit/${sourceCommit}`;
  const shortSha = sourceCommit.substring(0, 8);

  return `
<aside class="source-info" aria-label="Source information">
  <a href="${sourceUrl}" target="_blank" rel="noopener noreferrer">${i18n.source.view_source}</a>
  <span class="source-info__separator" aria-hidden="true">&middot;</span>
  <a href="${commitUrl}" target="_blank" rel="noopener noreferrer">${i18n.source.revision} ${shortSha}</a>
</aside>
`;
}
