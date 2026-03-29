import type { BlogPostViewData } from "../view-data.ts";
import { BlogAntdPostApp } from "./PostApp.tsx";
import { mountBlogApp } from "./bootstrap.tsx";
import { isBlogPostViewData } from "./bootstrap-data.ts";

mountBlogApp<BlogPostViewData>(BlogAntdPostApp, isBlogPostViewData);
