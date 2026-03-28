import type { BlogArchiveViewData } from "../view-data.ts";
import { BlogAntdArchiveApp } from "./ArchiveApp.tsx";
import { mountBlogApp } from "./bootstrap.tsx";

mountBlogApp<BlogArchiveViewData>(BlogAntdArchiveApp);
