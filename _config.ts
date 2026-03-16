import lume from "lume/mod.ts";
import type Site from "lume/core/site.ts";
import { readConsoleDebugPolicy } from "./plugins/console_debug.ts";
import { registerAssets } from "./_config/assets.ts";
import { registerPlugins } from "./_config/plugins.ts";
import { registerFeeds } from "./_config/feeds.ts";
import { registerProcessors } from "./_config/processors.ts";

/** Console debug policy, read once at module init from `LUME_LOGS`. */
const consoleDebugPolicy = readConsoleDebugPolicy((name) => Deno.env.get(name));
const isServeTask = Deno.env.get("LUME_SERVE") === "1" ||
  Deno.env.get("DENO_TASK_NAME") === "serve" ||
  Deno.args.includes("-s") || Deno.args.includes("--serve");

type BuildData = {
  repositoryUrl?: string;
  swDebugLevel: "off" | "summary" | "verbose";
};

type SeoIssue = {
  pagePath: string;
  messages: string[];
};

function runGitCommand(args: string[]): string | undefined {
  try {
    const command = new Deno.Command("git", { args });
    const output = command.outputSync();

    if (!output.success) {
      return undefined;
    }

    return new TextDecoder().decode(output.stdout).trim();
  } catch {
    return undefined;
  }
}

function normalizeRepositoryUrl(url: string | undefined): string | undefined {
  if (!url) {
    return undefined;
  }

  if (url.startsWith("git@")) {
    const sshMatch = /^git@([^:]+):(.+?)(?:\.git)?$/.exec(url);

    if (sshMatch) {
      const [, host, repoPath] = sshMatch;
      return `https://${host}/${repoPath}`;
    }
  }

  return url.replace(/\.git$/, "");
}

function getBuildData(): BuildData {
  const repositoryUrl = normalizeRepositoryUrl(
    runGitCommand(["config", "--get", "remote.origin.url"]),
  );
  const swDebugLevel = isServeTask ? consoleDebugPolicy.level : "off";

  return repositoryUrl ? { repositoryUrl, swDebugLevel } : { swDebugLevel };
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

  collection.icon = "search";
  collection.items = seoIssues.map(({ pagePath, messages }) => ({
    title: pagePath,
    description: messages.join("\n"),
    actions: [
      { text: "Open page", href: pagePath },
      ...(buildData.repositoryUrl
        ? [{ text: "Open repository", href: buildData.repositoryUrl }]
        : []),
    ],
  }));
}

// ---------------------------------------------------------------------------
// Site instantiation
// ---------------------------------------------------------------------------

/** Lume site instance — entry point for the build pipeline. */
const site: Site = lume({
  src: "./src",
  location: new URL("https://normco.re"),
  server: { debugBar: true },
});

const buildData = getBuildData();
site.data("build", buildData);

const seoIssues: SeoIssue[] = [];
site.addEventListener("beforeSave", () => {
  updateSeoDebugCollection(site, buildData, seoIssues);
});

// Module registrations — order matters for some plugins.
registerAssets(site);
registerPlugins(site, { isServeTask });
registerFeeds(site);
registerProcessors(site);

// Ensure generated quality reports are written under a dedicated ignored
// directory instead of polluting the repository root.
site.addEventListener(
  "beforeBuild",
  "deno run --allow-write scripts/ensure-dir.ts _cache/quality",
);

// Post-build: fingerprint assets, verify browser imports, format HTML, then
// validate local links against the final rewritten output.
site.addEventListener(
  "afterBuild",
  "deno run --allow-read --allow-write scripts/fingerprint-assets.ts _site && deno run --allow-read scripts/check-browser-imports.ts _site && deno fmt _site/**/*.html && deno run --allow-read --allow-write scripts/check-output-links.ts _site _cache/quality/broken-links.json",
);

export default site;
