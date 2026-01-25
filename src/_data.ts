/**
 * Global site data
 */

import "lume/types.ts";

interface MenuLink {
  text: string;
  href: string;
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
  repoUrl: string;
  home: {
    welcome: string;
  };
  menu_links: MenuLink[];
  extra_head: string[];
  metas: MetasConfig;
  jsonLd: Lume.Data["jsonLd"];
}

const data: SiteData = {
  lang: "en",
  repoUrl: "https://github.com/frenchvandal/normco.re",
  home: {
    welcome: "Hello, I am a person that writes stuff.",
  },
  menu_links: [],
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
