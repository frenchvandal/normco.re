import HiddenHCard from "./HiddenHCard.tsx";
import HiddenUrl from "./HiddenUrl.tsx";
import type { HFeedShellProps } from "../types.ts";

export default function HFeedShell({
  tagName = "div",
  className = "h-feed",
  rootAttributes,
  url,
  urlClassName = "u-url sr-only",
  author,
  children,
}: HFeedShellProps) {
  const Root = tagName;

  return (
    <Root class={className} {...rootAttributes}>
      <HiddenUrl url={url} className={urlClassName} />
      {author !== undefined && <HiddenHCard author={author} />}
      {children}
    </Root>
  );
}
