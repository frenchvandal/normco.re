/** Site footer with copyright and feed links. */

export default ({ author }: { readonly author: string }) => {
  const year = new Date().getFullYear();
  return (
    <footer class="site-footer">
      <div class="site-footer-inner">
        <span>© {year} {author}</span>
        <nav class="site-footer-nav" aria-label="Feeds">
          <a href="/feed.xml">RSS</a>
          <a href="/feed.json">JSON Feed</a>
        </nav>
      </div>
    </footer>
  );
};
