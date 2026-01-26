/**
 * Code Tabs Component for Lume
 * Wrapper around tabs component for displaying code snippets in multiple languages
 */

export interface CodeSnippet {
  lang: string;
  label?: string;
  code: string;
}

export interface CodeTabsProps {
  snippets: CodeSnippet[];
  id?: string;
}

/**
 * Language display names and icons
 */
const LANG_CONFIG: Record<string, { label: string; icon?: string }> = {
  ts: { label: "TypeScript" },
  typescript: { label: "TypeScript" },
  js: { label: "JavaScript" },
  javascript: { label: "JavaScript" },
  deno: { label: "Deno" },
  node: { label: "Node.js" },
  bash: { label: "Bash" },
  sh: { label: "Shell" },
  json: { label: "JSON" },
  html: { label: "HTML" },
  css: { label: "CSS" },
  scss: { label: "SCSS" },
  yaml: { label: "YAML" },
  md: { label: "Markdown" },
  sql: { label: "SQL" },
  py: { label: "Python" },
  python: { label: "Python" },
  go: { label: "Go" },
  rust: { label: "Rust" },
  java: { label: "Java" },
  c: { label: "C" },
  cpp: { label: "C++" },
  csharp: { label: "C#" },
  php: { label: "PHP" },
  ruby: { label: "Ruby" },
  swift: { label: "Swift" },
  kotlin: { label: "Kotlin" },
};

/**
 * Get display label for a language
 */
function getLangLabel(lang: string): string {
  const config = LANG_CONFIG[lang.toLowerCase()];
  return config?.label ?? lang.toUpperCase();
}

/**
 * Escape HTML entities in code
 */
function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

/**
 * Renders code snippets with optional tabbed navigation.
 *
 * @param props - Code snippet configuration and optional ID.
 * @returns The code tabs HTML markup.
 *
 * @example
 * ```ts
 * import { assertEquals } from "@std/assert";
 * import renderCodeTabs from "./CodeTabs.ts";
 *
 * assertEquals(typeof renderCodeTabs, "function");
 * ```
 */
export default function ({
  snippets,
  id = `code-tabs-${Math.random().toString(36).slice(2, 11)}`,
}: CodeTabsProps) {
  if (!snippets || snippets.length === 0) {
    return "";
  }

  // If only one snippet, just render it without tabs
  if (snippets.length === 1) {
    const snippet = snippets[0];
    return `
      <div class="code-block">
        <pre><code class="language-${snippet.lang}">${
      escapeHtml(snippet.code)
    }</code></pre>
      </div>
    `;
  }

  // Multiple snippets: use tabs
  return `
    <div class="code-tabs tabs tabs--boxed" data-tabs id="${id}">
      <div class="tabs__list" role="tablist" aria-label="Code examples">
        ${
    snippets
      .map((snippet, index) => {
        const isFirst = index === 0;
        const label = snippet.label ?? getLangLabel(snippet.lang);
        const tabId = `${id}-tab-${index}`;
        const panelId = `${id}-panel-${index}`;

        return `
        <button
          class="tabs__tab"
          role="tab"
          id="${tabId}"
          aria-controls="${panelId}"
          aria-selected="${isFirst ? "true" : "false"}"
          tabindex="${isFirst ? "0" : "-1"}"
        >
          ${label}
        </button>`;
      })
      .join("")
  }
      </div>
      <div class="tabs__panels">
        ${
    snippets
      .map((snippet, index) => {
        const isFirst = index === 0;
        const tabId = `${id}-tab-${index}`;
        const panelId = `${id}-panel-${index}`;

        return `
        <div
          class="tabs__panel"
          role="tabpanel"
          id="${panelId}"
          aria-labelledby="${tabId}"
          data-state="${isFirst ? "active" : "inactive"}"
          ${!isFirst ? "hidden" : ""}
        >
          <pre><code class="language-${snippet.lang}">${
          escapeHtml(snippet.code)
        }</code></pre>
        </div>`;
      })
      .join("")
  }
      </div>
    </div>
  `;
}
