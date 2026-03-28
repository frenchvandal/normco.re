import type { BlogPostViewData } from "../view-data.ts";
import { BlogAntdPostApp } from "./PostApp.tsx";
import { mountBlogApp } from "./bootstrap.tsx";

mountBlogApp<BlogPostViewData>(BlogAntdPostApp);
