import {
  DEFAULT_LANGUAGE,
  LANGUAGE_PREFIX,
  SUPPORTED_LANGUAGES,
} from "../src/utils/i18n.ts";

export type RobotsRule = {
  allow?: string | string[];
  disallow?: string | string[];
  contentSignal?: string;
  sitemap?: string;
  userAgent?: string | string[];
};

// Content Signals policy (https://contentsignals.org/): allow search and
// AI-assisted answering, refuse AI model training on the blog content.
export const ROBOTS_CONTENT_SIGNAL = "search=yes, ai-input=yes, ai-train=no";

function buildOfflineDisallows(): string[] {
  return SUPPORTED_LANGUAGES.flatMap((language) => {
    const offlinePath = `${LANGUAGE_PREFIX[language]}/offline`;

    return language === DEFAULT_LANGUAGE
      ? [offlinePath, `${offlinePath}/`, "/offline.html"]
      : [offlinePath, `${offlinePath}/`];
  });
}

export function buildRobotsRules(): RobotsRule[] {
  // The content signal is a separate trailing rule on purpose: the plugin
  // sorts `contentSignal` before `userAgent` inside a rule, which would emit
  // it outside the group. As a standalone record after the wildcard group it
  // stays attached to that group per RFC 9309. The `Sitemap:` line is added
  // by the sitemap plugin, so no sitemap rule is declared here.
  return [
    {
      userAgent: "*",
      allow: "/",
      disallow: ["/404", "/404.html", "/pretext/", ...buildOfflineDisallows()],
    },
    { contentSignal: ROBOTS_CONTENT_SIGNAL },
  ];
}
