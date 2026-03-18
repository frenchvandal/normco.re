export default function HiddenUrl(
  { url, className = "u-url sr-only" }: {
    readonly url: string;
    readonly className?: string;
  },
) {
  return <a class={className} href={url}>{url}</a>;
}
