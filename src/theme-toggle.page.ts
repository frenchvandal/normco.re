/**
 * Outputs the theme-toggle client script as `/theme-toggle.js`.
 *
 * This script wires up the `#theme-toggle` button: it reads the effective
 * color scheme (from `data-color-scheme` or the system preference), updates
 * the button's `aria-label`, and persists the user's choice to `localStorage`
 * on each click.
 *
 * Loaded at the end of `<body>` so the DOM is already available.
 */

/** Output path in the built site. */
export const url = "/theme-toggle.js";

export default function (): string {
  return `(function(){
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
}
