/**
 * Global site data
 *
 * This module exports site-wide data with multilanguage support.
 * The Lume Multilanguage plugin uses named exports (fr, zh) as
 * language-specific overrides for the default data.
 *
 * @module
 */

import "lume/types.ts";

import type { RepoInfo } from "../plugins.ts";
import i18nEn, { fr as i18nFr, type I18n, zh as i18nZh } from "./_data/i18n.ts";

interface MenuLink {
  text: string;
  href: string;
}

/**
 * Social link configuration for footer icons.
 */
interface SocialLink {
  /** Platform identifier (e.g., "github", "twitter", "email") */
  platform: string;
  /** URL or mailto link */
  url: string;
  /** Accessible label for the link */
  label: string;
}

interface MetasConfig {
  site: string;
  description: string;
  title: string;
  image: string;
  twitter: string;
  lang: string;
}

/**
 * Profile configuration for home page profile mode.
 */
interface ProfileConfig {
  /** Author's display name */
  name: string;
  /** Author's avatar image URL */
  avatar?: string;
  /** Short bio or tagline */
  bio?: string;
}

/**
 * Home page configuration.
 */
interface HomeConfig {
  /** Welcome message for posts mode */
  welcome: string;
  /** Home page mode: "posts" shows recent posts, "profile" shows author profile */
  mode?: "posts" | "profile";
  /** Profile configuration (used when mode is "profile") */
  profile?: ProfileConfig;
}

interface SiteData {
  lang: string;
  repo?: RepoInfo;
  repoUrl?: string;
  home: HomeConfig;
  menu_links: MenuLink[];
  social_links: SocialLink[];
  extra_head: string[];
  metas: MetasConfig;
  jsonLd: Lume.Data["jsonLd"];
  /** OG Images plugin layout for generating social sharing images */
  openGraphLayout: string;
  /** Internationalization strings */
  i18n: I18n;
}

const data: SiteData = {
  lang: "en",
  openGraphLayout: "layouts/og_images.tsx",
  i18n: i18nEn,
  home: {
    welcome: "Hello, I am a person that writes stuff.",
    mode: "posts",
    profile: {
      name: "Phiphi",
      bio: "Finding liberation into being nothing special",
    },
  },
  menu_links: [],
  social_links: [
    {
      platform: "github",
      url: "https://github.com/frenchvandal",
      label: "GitHub",
    },
    {
      platform: "twitter",
      url: "https://twitter.com/frenchvandal",
      label: "Twitter",
    },
    {
      platform: "rss",
      url: "/feed.xml",
      label: "RSS Feed",
    },
    {
      platform: "jsonfeed",
      url: "/feed-json-viewer/",
      label: "JSON Feed",
    },
  ],
  extra_head: [],
  metas: {
    site: "normco.re",
    description: "Finding liberation into being nothing special",
    title: "=title",
    image: "=image",
    twitter: "@frenchvandal",
    lang: "en",
  },
  jsonLd: {
    "@type": "WebSite",
    url: "=url",
    headline: "=title || =metas.site",
    name: "=metas.site",
    description: "=metas.description",
    image: "=image || =metas.image || /favicon.png",
    publisher: {
      "@type": "Organization",
      name: "=metas.site",
      logo: {
        "@type": "ImageObject",
        url: "/favicon.png",
      },
    },
  },
};

/**
 * French language overrides.
 * Used by Lume Multilanguage plugin to generate French pages.
 */
export const fr = {
  i18n: i18nFr,
  home: {
    welcome: "Bonjour, je suis quelqu'un qui écrit des trucs.",
  },
  metas: {
    description: "Trouver la libération dans le fait de n'être rien de spécial",
    lang: "fr",
  },
};

/**
 * Chinese language overrides.
 * Used by Lume Multilanguage plugin to generate Chinese pages.
 */
export const zh = {
  i18n: i18nZh,
  home: {
    welcome: "你好，我是一个写东西的人。",
  },
  metas: {
    description: "在平凡中找到解放",
    lang: "zh",
  },
};

export default data;
