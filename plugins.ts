import date, { Options as DateOptions } from "lume/plugins/date.ts";
import esbuild from "lume/plugins/esbuild.ts";
import lightningCss from "lume/plugins/lightningcss.ts";
import purgecss from "lume/plugins/purgecss.ts";
import sourceMaps from "lume/plugins/source_maps.ts";
import prism, { Options as PrismOptions } from "lume/plugins/prism.ts";
import basePath from "lume/plugins/base_path.ts";
import slugifyUrls from "lume/plugins/slugify_urls.ts";
import resolveUrls from "lume/plugins/resolve_urls.ts";
import jsonLd from "lume/plugins/json_ld.ts";
import metas from "lume/plugins/metas.ts";
import pagefind, { Options as PagefindOptions } from "lume/plugins/pagefind.ts";
import robots from "lume/plugins/robots.ts";
import sitemap from "lume/plugins/sitemap.ts";
import feed, { Options as FeedOptions } from "lume/plugins/feed.ts";
import readingInfo from "lume/plugins/reading_info.ts";
import { merge } from "lume/core/utils/object.ts";
import toc from "lume/markdown-plugins/toc.ts";
import image from "lume/markdown-plugins/image.ts";
import footnotes from "lume/markdown-plugins/footnotes.ts";
import "lume/types.ts";

import { alert } from "@mdit/plugin-alert";

export interface RepoInfo {
  baseUrl: string;
  owner: string;
  name: string;
  branch: string;
}

interface GitCommandResult {
  code: number;
  out: string;
  err: string;
}

export interface Options {
  prism?: Partial<PrismOptions>;
  date?: Partial<DateOptions>;
  pagefind?: Partial<PagefindOptions>;
  feed?: Partial<FeedOptions>;
}

/**
 * Default plugin configuration overrides.
 *
 * @example
 * ```ts
 * import { assertEquals } from "@std/assert";
 * import { defaults } from "./plugins.ts";
 *
 * assertEquals(typeof defaults, "object");
 * ```
 */
export const defaults: Options = {
  prism: {
    autoloadLanguages: true, // Auto-load languages for code tabs
  },
  pagefind: {
    ui: false, // Disable auto UI injection, we handle it in main.js
  },
  feed: {
    output: ["/feed.xml", "/feed.json"],
    query: "type=post",
    info: {
      title: "=metas.site",
      description: "=metas.description",
    },
    items: {
      title: "=title",
    },
    stylesheet: "/feed.xsl",
  },
};

const textDecoder = new TextDecoder();

/**
 * Executes a git command synchronously.
 *
 * @param args - Git command arguments to pass to the git executable.
 * @returns Object containing exit code, stdout, and stderr output.
 *
 * @internal
 */
const runGit = (args: string[]): GitCommandResult => {
  const cmd = new Deno.Command("git", {
    args,
    stdout: "piped",
    stderr: "piped",
  });
  const { code, stdout, stderr } = cmd.outputSync();
  return {
    code,
    out: textDecoder.decode(stdout).trim(),
    err: textDecoder.decode(stderr).trim(),
  };
};

/**
 * Parses a git remote URL and extracts repository information.
 *
 * Supports both SSH (`git@host:owner/repo.git`) and HTTPS
 * (`https://host/owner/repo.git`) formats.
 *
 * @param remote - The git remote URL string to parse.
 * @returns Parsed repository info (baseUrl, owner, name) or null if parsing fails.
 *
 * @internal
 */
const parseGitRemote = (
  remote: string,
): { baseUrl: string; owner: string; name: string } | null => {
  const ssh = remote.match(/^git@([^:]+):([^/]+)\/(.+?)(?:\.git)?$/);
  if (ssh) {
    return {
      baseUrl: `https://${ssh[1]}`,
      owner: ssh[2],
      name: ssh[3],
    };
  }

  const https = remote.match(/^https:\/\/([^/]+)\/([^/]+)\/(.+?)(?:\.git)?$/);
  if (https) {
    return {
      baseUrl: `https://${https[1]}`,
      owner: https[2],
      name: https[3],
    };
  }

  return null;
};

/**
 * Retrieves the current git branch name.
 *
 * Tries `git branch --show-current` first, then falls back to
 * `git rev-parse --abbrev-ref HEAD` for detached HEAD states.
 *
 * @returns The current branch name, or an empty string if not in a git repo
 *          or in detached HEAD state without a branch reference.
 *
 * @internal
 */
const getBranch = (): string => {
  const currentBranch = runGit(["branch", "--show-current"]);
  if (currentBranch.code === 0 && currentBranch.out) {
    return currentBranch.out;
  }

  const headBranch = runGit(["rev-parse", "--abbrev-ref", "HEAD"]);
  if (headBranch.code === 0 && headBranch.out !== "HEAD") {
    return headBranch.out;
  }

  return "";
};

/**
 * Extracts repository information from GitHub Actions environment variables.
 *
 * Reads `GITHUB_SERVER_URL`, `GITHUB_REPOSITORY`, and `GITHUB_REF_NAME`
 * to construct repository metadata when running in CI.
 *
 * @returns Repository info object or null if required env vars are missing.
 *
 * @internal
 */
const getRepoInfoFromEnv = (): RepoInfo | null => {
  const baseUrl = Deno.env.get("GITHUB_SERVER_URL");
  const repository = Deno.env.get("GITHUB_REPOSITORY");
  const branch = Deno.env.get("GITHUB_REF_NAME");

  if (!baseUrl || !repository || !branch) {
    return null;
  }

  const [owner, name] = repository.split("/");
  if (!owner || !name) {
    return null;
  }

  return {
    baseUrl,
    owner,
    name,
    branch,
  };
};

/**
 * Extracts repository information from local git configuration.
 *
 * Reads the `origin` remote URL and current branch name using git commands.
 * Used as a fallback when GitHub Actions environment variables are not available.
 *
 * @returns Repository info object or null if not in a git repo or remote is not set.
 *
 * @internal
 */
const getRepoInfoFromGit = (): RepoInfo | null => {
  const remote = runGit(["remote", "get-url", "origin"]);
  if (remote.code !== 0 || !remote.out) {
    return null;
  }

  const parsed = parseGitRemote(remote.out);
  if (!parsed) {
    return null;
  }

  return {
    ...parsed,
    branch: getBranch(),
  };
};

/**
 * Retrieves repository information from available sources.
 *
 * Tries GitHub Actions environment variables first, then falls back
 * to local git configuration.
 *
 * @returns Repository info object or null if no source is available.
 *
 * @internal
 */
const getRepoInfo = (): RepoInfo | null =>
  getRepoInfoFromEnv() ?? getRepoInfoFromGit();

/**
 * Configure the Lume site with the blog's plugin stack.
 *
 * @param userOptions - Optional overrides for plugin configuration.
 * @returns A Lume site configuration function.
 *
 * @example
 * ```ts
 * import { assertEquals } from "@std/assert";
 * import configureSite from "./plugins.ts";
 *
 * assertEquals(typeof configureSite, "function");
 * ```
 */
export default function (userOptions?: Options) {
  const options = merge(defaults, userOptions);

  return (site: Lume.Site) => {
    const repoInfo = getRepoInfo();
    if (repoInfo) {
      site.data("repo", repoInfo);
      site.data(
        "repoUrl",
        `${repoInfo.baseUrl}/${repoInfo.owner}/${repoInfo.name}`,
      );
    }

    site.use(esbuild())
      .use(lightningCss({
        options: {
          minify: true,
          drafts: {
            customMedia: true,
          },
        },
      }))
      .use(purgecss({
        options: {
          safelist: {
            deep: [/token/, /source-info/],
            standard: [/^language-/],
          },
        },
      }))
      .use(sourceMaps())
      .use(basePath())
      .use(toc())
      .use(prism(options.prism))
      .use(readingInfo())
      .use(date(options.date))
      .use(jsonLd())
      .use(slugifyUrls())
      .use(metas())
      .use(image())
      .use(footnotes())
      .use(resolveUrls())
      .use(pagefind(options.pagefind))
      .use(robots())
      .use(sitemap())
      .use(feed(options.feed))
      .add("fonts")
      .add("styles.css")
      .add("js/main.js")
      .add("favicon.png")
      .add("feed.xsl")
      .add("uploads")
      .mergeKey("extra_head", "stringArray")
      .preprocess([".md"], (pages) => {
        for (const page of pages) {
          if (page.data.excerpt) {
            continue;
          }
          const content = typeof page.data.content === "string"
            ? page.data.content
            : "";
          if (!content) {
            continue;
          }
          page.data.excerpt = content.split(/<!--\s*more\s*-->/i)[0];
        }
      })
      // Inject git commit SHA for each source file
      .preprocess([".md"], (pages) => {
        for (const page of pages) {
          const src = page.src;
          if (!src?.path || !src?.ext) continue;

          const normalizedPath = src.path.startsWith("/")
            ? src.path
            : `/${src.path}`;
          const filePath = `src${normalizedPath}${src.ext}`;
          page.data.sourcePath = filePath;
          try {
            const result = runGit([
              "log",
              "-1",
              "--format=%H",
              "--follow",
              "--no-merges",
              "--",
              filePath,
            ]);
            if (result.code === 0 && result.out) {
              page.data.sourceCommit = result.out;
            }
          } catch {
            // Silently ignore git errors
          }
        }
      });

    // Alert plugin
    site.hooks.addMarkdownItPlugin(alert);

    // Add lazy loading to images and improve accessibility (DOM API)
    site.process([".html"], (pages) => {
      for (const page of pages) {
        const document = page.document;
        if (!document) {
          continue;
        }

        // Add loading="lazy" to images (except first image for LCP)
        let imageCount = 0;
        for (const img of document.querySelectorAll("img")) {
          imageCount++;

          // First image: use eager loading for better LCP
          const loading = imageCount === 1 ? "eager" : "lazy";

          // Add loading and decoding attributes
          if (!img.hasAttribute("loading")) {
            img.setAttribute("loading", loading);
          }
          if (!img.hasAttribute("decoding")) {
            img.setAttribute("decoding", "async");
          }

          // Ensure alt attribute exists (accessibility)
          if (!img.hasAttribute("alt")) {
            img.setAttribute("alt", "");
          }
        }
      }
    });
  };
}
