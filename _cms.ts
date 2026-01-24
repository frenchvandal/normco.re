import lumeCMS from "lume/cms/mod.ts";
import {
  contentField,
  createSearchValuesField,
  extraHeadField,
  urlField,
} from "./_cms-fields.ts";

const cms = lumeCMS();

cms.document({
  name: "settings",
  description: "Global settings for the site.",
  store: "src:_data.ts",
  url: "/",
  fields: [
    {
      name: "lang",
      type: "text",
      label: "Language",
    },
    {
      name: "home",
      type: "object",
      fields: [
        {
          name: "welcome",
          type: "text",
          label: "Title",
          description: "Welcome message in the homepage",
        },
      ],
    },
    {
      name: "menu_links",
      type: "object-list",
      fields: [
        {
          name: "text",
          type: "text",
          label: "Title",
        },
        {
          name: "href",
          type: "text",
          label: "URL",
        },
      ],
    },
    extraHeadField,
    {
      name: "metas",
      type: "object",
      description: "Meta tags configuration.",
      fields: [
        "site: text",
        "description: text",
        "title: text",
        "image: text",
        "twitter: text",
        "lang: text",
        "generator: checkbox",
      ],
    },
  ],
});

cms.collection(
  "posts: Blog posts",
  "src:posts/*.md",
  [
    "title: text",
    urlField,
    createSearchValuesField("author", "text", "author"),
    "date: date",
    {
      name: "draft",
      label: "Draft",
      type: "checkbox",
      description: "If checked, the post will not be published.",
    },
    createSearchValuesField("tags", "list", "tags", "Tags"),
    extraHeadField,
    contentField,
  ],
);

cms.collection(
  "pages: Additional pages, like about, contact, etc.",
  "src:pages/*.md",
  [
    {
      name: "layout",
      type: "hidden",
      value: "layouts/page.ts",
    },
    {
      name: "title",
      type: "text",
      label: "Title",
    },
    urlField,
    {
      name: "menu",
      type: "object",
      label: "Whether to include in the menu",
      fields: [
        {
          name: "visible",
          type: "checkbox",
          label: "Show in menu",
        },
        {
          name: "order",
          type: "number",
          label: "Order",
        },
      ],
    },
    extraHeadField,
    contentField,
  ],
);

cms.upload("uploads: Uploaded files", "src:uploads");

export default cms;
