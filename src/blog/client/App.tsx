/** @jsxImportSource react */
import type { BlogAppViewData } from "../view-data.ts";
import { ConfigProvider } from "@blog/antd-components";
import { ArchiveView, BlogAntdArchiveApp } from "./ArchiveApp.tsx";
import { BlogAntdPostApp, PostView } from "./PostApp.tsx";
import { BlogAntdTagApp, TagView } from "./TagApp.tsx";
import { BLOG_ANTD_THEME } from "./theme.ts";

function BlogAntdContent({ data }: { data: BlogAppViewData }) {
  switch (data.view) {
    case "archive":
      return <ArchiveView data={data} />;
    case "tag":
      return <TagView data={data} />;
    case "post":
      return <PostView data={data} />;
  }
}

export { BlogAntdArchiveApp, BlogAntdPostApp, BlogAntdTagApp };

export default function BlogAntdApp({ data }: { data: BlogAppViewData }) {
  return (
    <ConfigProvider theme={BLOG_ANTD_THEME}>
      <BlogAntdContent data={data} />
    </ConfigProvider>
  );
}
