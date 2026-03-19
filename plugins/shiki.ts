import type { Page } from "lume/core/file.ts";
import type Site from "lume/core/site.ts";
import type { Plugin } from "lume/core/site.ts";
import {
  type BundledLanguage,
  type BundledTheme,
  type CodeToHastOptions,
  createHighlighter,
  type Highlighter,
} from "npm/shiki";

type ShikiThemeConfig = Readonly<Record<"light" | "dark", BundledTheme>>;

export type ShikiPluginOptions = {
  readonly extensions?: readonly string[];
  readonly languages: readonly BundledLanguage[];
  readonly themes: ShikiThemeConfig;
};

const DEFAULT_EXTENSIONS = [".html"] as const;
let highlighterPromise: Promise<Highlighter> | undefined;

function mergeClassNames(
  currentClassName: string | null,
  nextClassName: string | null,
): string | undefined {
  const mergedClassNames = new Set(
    `${currentClassName ?? ""} ${nextClassName ?? ""}`.trim().split(/\s+/)
      .filter(Boolean),
  );

  return mergedClassNames.size > 0
    ? Array.from(mergedClassNames).join(" ")
    : undefined;
}

function applyRenderedAttributes(
  target: Element,
  source: Element,
): void {
  for (const attributeName of source.getAttributeNames()) {
    if (attributeName === "class") {
      const mergedClassName = mergeClassNames(
        target.getAttribute("class"),
        source.getAttribute("class"),
      );

      if (mergedClassName) {
        target.setAttribute("class", mergedClassName);
      }

      continue;
    }

    target.setAttribute(
      attributeName,
      source.getAttribute(attributeName) ?? "",
    );
  }
}

function resolveLanguageId(className: string | null): string | undefined {
  const languageMatch = className?.match(/(?:^|\s)language-([A-Za-z0-9_+-]+)/);
  return languageMatch?.[1];
}

function getHighlighter(
  options: ShikiPluginOptions,
): Promise<Highlighter> {
  if (!highlighterPromise) {
    highlighterPromise = createHighlighter({
      themes: [options.themes.light, options.themes.dark],
      langs: [...options.languages],
    });
  }

  return highlighterPromise;
}

async function highlightPage(
  page: Page,
  options: ShikiPluginOptions,
): Promise<void> {
  const document = page.document;

  if (!document) {
    return;
  }

  const sourceBlocks = document.querySelectorAll(
    "pre > code[class*='language-']",
  );

  if (sourceBlocks.length === 0) {
    return;
  }

  const highlighter = await getHighlighter(options);

  for (const sourceCode of sourceBlocks) {
    const sourcePre = sourceCode.parentElement;

    if (!sourcePre) {
      continue;
    }

    const code = sourceCode.textContent ?? "";
    const language = resolveLanguageId(sourceCode.getAttribute("class"));

    if (code.length === 0 || !language) {
      continue;
    }

    const container = document.createElement("div");

    try {
      container.innerHTML = highlighter.codeToHtml(
        code,
        {
          defaultColor: false,
          lang: language as BundledLanguage,
          themes: options.themes,
        } satisfies CodeToHastOptions,
      );
    } catch {
      continue;
    }

    const renderedPre = container.querySelector("pre");
    const renderedCode = renderedPre?.querySelector("code");

    if (!renderedPre || !renderedCode) {
      continue;
    }

    sourceCode.innerHTML = renderedCode.innerHTML;
    applyRenderedAttributes(sourcePre, renderedPre);
    applyRenderedAttributes(sourceCode, renderedCode);
  }
}

/** Local Shiki integration for Lume HTML output. */
export default function shiki(options: ShikiPluginOptions): Plugin {
  const extensions = options.extensions ?? DEFAULT_EXTENSIONS;

  return (site: Site) => {
    site.process([...extensions], async (pages) => {
      await Promise.all(pages.map((page) => highlightPage(page, options)));
    });
  };
}
