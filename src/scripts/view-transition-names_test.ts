import { assertEquals } from "@std/assert";
import { describe, it } from "@std/testing/bdd";
import VIEW_TRANSITION_NAMES_SCRIPT from "./view-transition-names.js" with {
  type: "text",
};
import { evaluateClassicScript, getJSDOM } from "../../test/jsdom.ts";

const JSDOM = await getJSDOM();

function createDom(): InstanceType<typeof JSDOM> {
  return new JSDOM(
    `<!doctype html>
    <html lang="en">
      <body>
        <a
          id="initial-title"
          href="/posts/hello/"
          data-view-transition-name="post-title-posts-hello"
        >
          Hello
        </a>
      </body>
    </html>`,
    {
      pretendToBeVisual: true,
      runScripts: "outside-only",
      url: "https://normco.re/posts/",
    },
  );
}

async function flushNodeTimers(cycles = 2): Promise<void> {
  for (let index = 0; index < cycles; index += 1) {
    await new Promise((resolve) => globalThis.setTimeout(resolve, 0));
  }
}

describe("view-transition-names.js", () => {
  it("applies view-transition names to elements already present in the DOM", () => {
    const dom = createDom();
    const { window } = dom;

    try {
      evaluateClassicScript(window, VIEW_TRANSITION_NAMES_SCRIPT);

      const title = window.document.getElementById("initial-title");

      assertEquals(title instanceof window.HTMLElement, true);
      assertEquals(title?.style.viewTransitionName, "post-title-posts-hello");
    } finally {
      window.close();
    }
  });

  it("syncs nodes added after the initial pass", async () => {
    const dom = createDom();
    const { window } = dom;

    try {
      evaluateClassicScript(window, VIEW_TRANSITION_NAMES_SCRIPT);

      const later = window.document.createElement("span");
      later.id = "later-title";
      later.textContent = "Later";
      later.dataset.viewTransitionName = "post-title-posts-later";
      window.document.body.append(later);

      await flushNodeTimers();

      assertEquals(later.style.viewTransitionName, "post-title-posts-later");
    } finally {
      window.close();
    }
  });

  it("updates the inline property when the data attribute changes", async () => {
    const dom = createDom();
    const { window } = dom;

    try {
      evaluateClassicScript(window, VIEW_TRANSITION_NAMES_SCRIPT);

      const title = window.document.getElementById("initial-title");

      if (!(title instanceof window.HTMLElement)) {
        throw new Error("expected title element");
      }

      title.dataset.viewTransitionName = "post-title-posts-updated";

      await flushNodeTimers();

      assertEquals(title.style.viewTransitionName, "post-title-posts-updated");
    } finally {
      window.close();
    }
  });
});
