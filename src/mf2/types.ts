import type { SiteLanguage } from "../utils/i18n.ts";
import type { Mf2Role } from "./config.ts";

export type AuthorIdentity = {
  readonly name: string;
  readonly url: string;
};

export type HtmlFragment = {
  readonly __html: string;
};

export type RootAttributes = Readonly<
  Record<string, string | number | boolean | undefined>
>;

export type HEntryShellProps = {
  readonly className?: string;
  readonly rootAttributes?: RootAttributes;
  readonly url?: string;
  readonly urlClassName?: string;
  readonly author?: AuthorIdentity;
  readonly summary?: string;
  readonly categories?: readonly string[];
  readonly children?: unknown;
};

export type HFeedShellProps = {
  readonly tagName?: "div" | "section";
  readonly className?: string;
  readonly rootAttributes?: RootAttributes;
  readonly url: string;
  readonly urlClassName?: string;
  readonly author?: AuthorIdentity;
  readonly children?: unknown;
};

export type DiscoveryLinksProps = {
  readonly language: SiteLanguage;
  readonly siteName: string;
  readonly rssUrl: string;
  readonly atomUrl: string;
  readonly jsonFeedUrl: string;
};

export type Mf2PageConfig = {
  readonly role: Mf2Role;
};
