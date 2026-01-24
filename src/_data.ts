/**
 * Global site data
 */

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
  home: {
    welcome: string;
  };
  menu_links: MenuLink[];
  extra_head: string[];
  metas: MetasConfig;
}

const data: SiteData = {
  lang: "en",
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
};

export default data;
