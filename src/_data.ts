/**
 * Global site data
 */

import "lume/types.ts";

import type { RepoInfo } from "../plugins.ts";

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

interface SiteData {
  lang: string;
  repo?: RepoInfo;
  repoUrl?: string;
  home: {
    welcome: string;
  };
  menu_links: MenuLink[];
  social_links: SocialLink[];
  extra_head: string[];
  metas: MetasConfig;
  jsonLd: Lume.Data["jsonLd"];
}

const data: SiteData = {
  lang: "en",
  home: {
    welcome: "Hello, I am a person that writes stuff.",
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

export default data;
