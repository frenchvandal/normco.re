/** Base HTML layout. Every page and layout chains to this. */

/** Typed helpers used in this layout. */
type H = {
  attr: (attrs: Record<string, unknown>) => string;
};

/**
 * Inline script injected into `<head>` before any CSS renders.
 * Reads the stored color-scheme preference and applies it to `:root`
 * to prevent a flash of the wrong theme on page load.
 */
const antiFlashScript =
  `(function(){var t=localStorage.getItem("color-scheme");if(t==="light"||t==="dark"){document.documentElement.setAttribute("data-color-scheme",t);}})();`;

/**
 * Inline script that wires up the theme toggle button.
 * Injected at the end of `<body>` so the DOM is available.
 */
const themeToggleScript = `(function(){
  var root=document.documentElement;
  var btn=document.getElementById("theme-toggle");
  if(!btn)return;
  function effective(){return root.getAttribute("data-color-scheme")||(window.matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light");}
  function update(t){btn.setAttribute("aria-label",t==="dark"?"Switch to light theme":"Switch to dark theme");}
  update(effective());
  btn.addEventListener("click",function(){
    var next=effective()==="dark"?"light":"dark";
    root.setAttribute("data-color-scheme",next);
    localStorage.setItem("color-scheme",next);
    update(next);
  });
})();`;

export default function (
  { title, description, content, url, comp }: Lume.Data,
  helpers: Lume.Helpers,
): string {
  const { attr } = helpers as unknown as H;

  const pageTitle = title ? `${title} — normco.re` : "normco.re";
  const metaDescription = description ??
    "Personal blog by Phiphi, based in Chengdu, China.";

  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta ${
    attr({ name: "viewport", content: "width=device-width, initial-scale=1" })
  }>
    <title>${pageTitle}</title>
    <meta ${attr({ name: "description", content: metaDescription })}>
    <script>${antiFlashScript}</script>
    <link rel="stylesheet" href="/style.css">
    <link rel="alternate" type="application/rss+xml" title="normco.re" href="/feed.xml">
    <link rel="alternate" type="application/json" title="normco.re JSON feed" href="/feed.json">
  </head>
  <body>
    <a class="skip-link" href="#main-content">Skip to content</a>
    <div class="site-wrapper">
      ${comp.Header({ currentUrl: url ?? "/" })}
      <main class="site-main" id="main-content">
        ${content}
      </main>
      ${comp.Footer({})}
    </div>
    <script>${themeToggleScript}</script>
  </body>
</html>`;
}
