import lume from "lume/mod.ts";
import date from "lume/plugins/date.ts";
import sitemap from "lume/plugins/sitemap.ts";
import feed from "lume/plugins/feed.ts";
import codeHighlight from "lume/plugins/code_highlight.ts";

const site = lume({
  src: "./src",
  location: new URL("https://normco.re"),
});

site.add("/style.css");

// Reading time — computed from the plain-text length of each post's content.
// Average adult reading speed: 238 words per minute (source: Brysbaert et al., 2019).
const WORDS_PER_MINUTE = 238;
site.preprocess([".ts"], (pages) => {
  for (const page of pages) {
    const raw = String(page.data.content ?? "");
    // Strip HTML tags to count only visible words.
    const text = raw.replace(/<[^>]+>/g, " ");
    const wordCount = text.trim().split(/\s+/).filter(Boolean).length;
    page.data.readingTime = Math.max(
      1,
      Math.ceil(wordCount / WORDS_PER_MINUTE),
    );
  }
});

site.use(date());
site.use(sitemap());
site.use(codeHighlight());
site.use(
  feed({
    output: ["/feed.xml", "/feed.json"],
    query: "type=post",
    info: {
      title: "normco.re",
      description: "Personal blog by Phiphi, based in Chengdu, China.",
      lang: "en",
      generator: false,
    },
    items: {
      title: "=title",
      description: "=description",
      published: "=date",
      content: "=content",
    },
  }),
);

export default site;
