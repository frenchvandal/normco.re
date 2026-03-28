import type { BlogTagViewData } from "../view-data.ts";
import { BlogAntdTagApp } from "./TagApp.tsx";
import { mountBlogApp } from "./bootstrap.tsx";

mountBlogApp<BlogTagViewData>(BlogAntdTagApp);
