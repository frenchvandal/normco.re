import HiddenHCard from "./HiddenHCard.tsx";
import HiddenUrl from "./HiddenUrl.tsx";
import type { HEntryShellProps } from "../types.ts";

export default function HEntryShell({
  className = "h-entry",
  rootAttributes,
  url,
  urlClassName = "u-url u-uid sr-only",
  author,
  summary,
  categories = [],
  children,
}: HEntryShellProps) {
  const filteredCategories = categories.filter((tag) => tag.length > 0);

  return (
    <article class={className} {...rootAttributes}>
      {url !== undefined && <HiddenUrl url={url} className={urlClassName} />}
      {author !== undefined && <HiddenHCard author={author} />}
      {summary !== undefined && <p class="p-summary sr-only">{summary}</p>}
      {filteredCategories.map((tag) => (
        <span key={tag} class="p-category sr-only">{tag}</span>
      ))}
      {children}
    </article>
  );
}
