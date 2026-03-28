import { assertNotMatch, assertStringIncludes } from "@std/assert";
import { describe, it } from "@std/testing/bdd";

import StatePanel from "./StatePanel.tsx";

describe("StatePanel", () => {
  it("renders trusted visual markup when provided", () => {
    const html = StatePanel({
      title: "Offline",
      message: "Please reconnect.",
      visual: '<div class="state-panel-visual" aria-hidden="true"></div>',
    });

    assertStringIncludes(
      html,
      '<div class="state-panel-visual" aria-hidden="true"></div>',
    );
  });

  it("escapes dynamic text and attribute values", () => {
    const html = StatePanel({
      title: '<img src=x onerror="alert(1)">',
      message: 'Hello <script>alert("boom")</script>',
      actionHref: '/posts/" onclick="alert(2)',
      actionLabel: "Read <more>",
      ariaLabel: 'Panel "danger"',
      eyebrow: "<unsafe>",
      className: 'custom" data-pwned="yes',
    });

    assertStringIncludes(
      html,
      'class="state-panel state-panel--inline custom&quot; data-pwned=&quot;yes"',
    );
    assertStringIncludes(html, 'aria-label="Panel &quot;danger&quot;"');
    assertStringIncludes(
      html,
      "&lt;img src=x onerror=&quot;alert(1)&quot;&gt;",
    );
    assertStringIncludes(
      html,
      "Hello &lt;script&gt;alert(&quot;boom&quot;)&lt;/script&gt;",
    );
    assertStringIncludes(
      html,
      'href="/posts/&quot; onclick=&quot;alert(2)"',
    );
    assertStringIncludes(html, "Read &lt;more&gt;");
    assertStringIncludes(html, "&lt;unsafe&gt;");
    assertNotMatch(html, /<script>alert\("boom"\)<\/script>/);
    assertNotMatch(html, /<img src=x onerror="alert\(1\)">/);
  });
});
