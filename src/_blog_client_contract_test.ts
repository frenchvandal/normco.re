import { assertStringIncludes } from "@std/assert";
import { describe, it } from "@std/testing/bdd";

const commonSource = Deno.readTextFileSync(
  new URL("./blog/client/common.tsx", import.meta.url),
);
const blogAntdStyles = Deno.readTextFileSync(
  new URL("./styles/blog-antd.css", import.meta.url),
);
const postAntdSource = Deno.readTextFileSync(
  new URL("./blog/client/post-antd.ts", import.meta.url),
);
const postAntdBuild = Deno.readTextFileSync(
  new URL("./blog/client/post-antd.build.ts", import.meta.url),
);

describe("blog client interaction contracts", () => {
  it("uses full-card links for story and featured cards", () => {
    assertStringIncludes(
      commonSource,
      'className="blog-antd-story-card__link"',
    );
    assertStringIncludes(
      commonSource,
      'className="blog-antd-feature-card__link"',
    );
    assertStringIncludes(commonSource, "const hasSecondaryStories");
  });

  it("keeps the direct-link card styling wired in CSS", () => {
    assertStringIncludes(blogAntdStyles, ".blog-antd-feature-card__link,");
    assertStringIncludes(blogAntdStyles, ".blog-antd-story-card__link {");
    assertStringIncludes(blogAntdStyles, ".blog-antd-story-card:focus-within");
  });

  it("keeps the post Ant Design build alias aligned with its source exports", () => {
    assertStringIncludes(postAntdSource, "Breadcrumb,\n  Button,");
    assertStringIncludes(postAntdBuild, "Breadcrumb,\n  Button,");
    assertStringIncludes(postAntdBuild, "import Button");
  });
});
