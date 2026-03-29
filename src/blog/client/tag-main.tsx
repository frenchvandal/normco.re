import type { BlogTagViewData } from "../view-data.ts";
import { BlogAntdTagApp } from "./TagApp.tsx";
import { mountBlogApp } from "./bootstrap.tsx";
import { isBlogTagViewData } from "./bootstrap-data.ts";

mountBlogApp<BlogTagViewData>(BlogAntdTagApp, isBlogTagViewData);
