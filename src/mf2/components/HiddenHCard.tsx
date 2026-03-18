import type { AuthorIdentity } from "../types.ts";

export default function HiddenHCard(
  { author, className = "p-author h-card sr-only" }: {
    readonly author: AuthorIdentity;
    readonly className?: string;
  },
) {
  return (
    <a class={className} href={author.url}>
      <span class="p-name">{author.name}</span>
    </a>
  );
}
