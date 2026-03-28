import { parseArgs } from "@std/cli";
import lume from "lume/mod.ts";
import type Site from "lume/core/site.ts";
import { readConsoleDebugPolicy } from "./plugins/console_debug.ts";
import {
  POST_BUILD_TASKS,
  PRE_BUILD_TASKS,
  runBuildTasks,
} from "./_config/build_tasks.ts";
import { registerAssets } from "./_config/assets.ts";
import { registerPlugins } from "./_config/plugins.ts";
import { registerFeeds } from "./_config/feeds.ts";
import { registerMobileContentApi } from "./_config/mobile_content_api.ts";
import { getGitRepositoryInfo } from "./_config/git.ts";
import {
  SCOPED_UPDATE_MATCHERS,
  shouldRunPostBuildTasks,
} from "./_config/runtime_policy.ts";
import { registerSiteManifest } from "./_config/site_manifest.ts";
import { registerProcessors } from "./_config/processors.ts";
import { registerXslStylesheets } from "./_config/xsl_stylesheets.ts";

const consoleDebugPolicy = readConsoleDebugPolicy((name) => Deno.env.get(name));
const parsedDenoArgs = parseArgs(Deno.args, {
  boolean: ["serve"],
  alias: { s: "serve" },
});
const isServeTask = Deno.env.get("LUME_SERVE") === "1" ||
  Deno.env.get("DENO_TASK_NAME") === "serve" ||
  parsedDenoArgs.serve === true;

type BuildData = {
  repositoryUrl?: string;
  defaultBranch?: string;
  swDebugLevel: "off" | "summary" | "verbose";
};

type SeoIssue = {
  pagePath: string;
  messages: string[];
};

function getBuildData(): BuildData {
  const repository = getGitRepositoryInfo();
  const swDebugLevel = isServeTask ? consoleDebugPolicy.level : "off";

  return {
    swDebugLevel,
    ...(repository?.repositoryUrl
      ? { repositoryUrl: repository.repositoryUrl }
      : {}),
    ...(repository?.defaultBranch
      ? { defaultBranch: repository.defaultBranch }
      : {}),
  };
}

function updateSeoDebugCollection(
  site: Site,
  buildData: BuildData,
  seoIssues: ReadonlyArray<SeoIssue>,
): void {
  const collection = site.debugBar?.collection("SEO output errors");

  if (!collection) {
    return;
  }

  const repositoryActions = buildData.repositoryUrl
    ? [{ text: "Open repository", href: buildData.repositoryUrl }]
    : [];

  collection.icon = "search";
  collection.items = seoIssues.map(({ pagePath, messages }) => ({
    title: pagePath,
    description: messages.join("\n"),
    actions: [
      { text: "Open page", href: pagePath },
      ...repositoryActions,
    ],
  }));
}

const site: Site = lume({
  src: "./src",
  location: new URL("https://normco.re"),
  server: { debugBar: true },
}, {
  markdown: {
    options: {
      // Let markdown-it handle output-side smart punctuation for rendered
      // Markdown content. This is distinct from source-level repo hygiene
      // checks, and a blind text-replacement plugin would be too coarse here.
      typographer: true,
    },
  },
});

const buildData = getBuildData();
site.data("build", buildData);
site.scopedUpdates(...SCOPED_UPDATE_MATCHERS);

const seoIssues: SeoIssue[] = [];
site.addEventListener("beforeSave", () => {
  updateSeoDebugCollection(site, buildData, seoIssues);
});

// Registration order matters for some plugins and post-processors.
registerAssets(site);
registerPlugins(site, { isServeTask });
registerFeeds(site);
registerMobileContentApi(site);
registerSiteManifest(site);
registerProcessors(site);
registerXslStylesheets(site);

if (shouldRunPostBuildTasks(isServeTask)) {
  // Ensure generated quality reports are written under a dedicated ignored
  // directory separate from the Lume build cache.
  site.addEventListener("beforeBuild", () => runBuildTasks(PRE_BUILD_TASKS));

  // Run asset fingerprinting and link/import validation against the final
  // output, after Lume has finished rewriting URLs.
  site.addEventListener("afterBuild", () => runBuildTasks(POST_BUILD_TASKS));
}

export default site;
