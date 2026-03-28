import ArrowRightOutlinedModule from "npm:@ant-design/icons-svg@4.4.2/lib/asn/ArrowRightOutlined.js";
import CheckOutlinedModule from "npm:@ant-design/icons-svg@4.4.2/lib/asn/CheckOutlined.js";
import CloseOutlinedModule from "npm:@ant-design/icons-svg@4.4.2/lib/asn/CloseOutlined.js";
import CopyOutlinedModule from "npm:@ant-design/icons-svg@4.4.2/lib/asn/CopyOutlined.js";
import DesktopOutlinedModule from "npm:@ant-design/icons-svg@4.4.2/lib/asn/DesktopOutlined.js";
import DownOutlinedModule from "npm:@ant-design/icons-svg@4.4.2/lib/asn/DownOutlined.js";
import DownloadOutlinedModule from "npm:@ant-design/icons-svg@4.4.2/lib/asn/DownloadOutlined.js";
import EnvironmentOutlinedModule from "npm:@ant-design/icons-svg@4.4.2/lib/asn/EnvironmentOutlined.js";
import ExclamationCircleTwoToneModule from "npm:@ant-design/icons-svg@4.4.2/lib/asn/ExclamationCircleTwoTone.js";
import EyeOutlinedModule from "npm:@ant-design/icons-svg@4.4.2/lib/asn/EyeOutlined.js";
import GithubFilledModule from "npm:@ant-design/icons-svg@4.4.2/lib/asn/GithubFilled.js";
import InfoCircleTwoToneModule from "npm:@ant-design/icons-svg@4.4.2/lib/asn/InfoCircleTwoTone.js";
import MenuOutlinedModule from "npm:@ant-design/icons-svg@4.4.2/lib/asn/MenuOutlined.js";
import MoonFilledModule from "npm:@ant-design/icons-svg@4.4.2/lib/asn/MoonFilled.js";
import ProfileOutlinedModule from "npm:@ant-design/icons-svg@4.4.2/lib/asn/ProfileOutlined.js";
import SearchOutlinedModule from "npm:@ant-design/icons-svg@4.4.2/lib/asn/SearchOutlined.js";
import SunFilledModule from "npm:@ant-design/icons-svg@4.4.2/lib/asn/SunFilled.js";
import TranslationOutlinedModule from "npm:@ant-design/icons-svg@4.4.2/lib/asn/TranslationOutlined.js";
import UnorderedListOutlinedModule from "npm:@ant-design/icons-svg@4.4.2/lib/asn/UnorderedListOutlined.js";
import WechatFilledModule from "npm:@ant-design/icons-svg@4.4.2/lib/asn/WechatFilled.js";
import { escapeHtml } from "./html.ts";

export type IconResolver = (
  key: string,
  catalogId: string,
  rest?: string,
) => string;

type RawIconNode = Readonly<{
  attrs: Readonly<Record<string, string>>;
  children?: readonly RawIconNode[];
  tag: string;
}>;

type RawIconSource =
  | RawIconNode
  | ((primaryColor: string, secondaryColor: string) => RawIconNode);

type RawIconDefinition = Readonly<{
  icon: RawIconSource;
  name: string;
  theme: string;
}>;

type SiteIconData = Readonly<{
  paths: readonly Readonly<Record<string, string>>[];
  svgAttrs: Readonly<Record<string, string>>;
  viewBox: string;
}>;

const SIMPLE_ICONS_ASSET_BASE = "/icons/simpleicons";

function unwrapAntdIconDefinition(module: unknown): RawIconDefinition {
  const candidate = module as { default?: unknown };
  const firstDefault = candidate.default ?? module;
  const secondDefault = (firstDefault as { default?: unknown }).default ??
    firstDefault;

  return secondDefault as RawIconDefinition;
}

function resolveRawIconNode(icon: RawIconSource): RawIconNode {
  return typeof icon === "function" ? icon("#1677ff", "#dbeafe") : icon;
}

const SITE_ICON_DEFINITIONS = {
  "alert-fill": unwrapAntdIconDefinition(ExclamationCircleTwoToneModule),
  "arrow-right": unwrapAntdIconDefinition(ArrowRightOutlinedModule),
  check: unwrapAntdIconDefinition(CheckOutlinedModule),
  "chevron-down": unwrapAntdIconDefinition(DownOutlinedModule),
  copy: unwrapAntdIconDefinition(CopyOutlinedModule),
  "device-desktop": unwrapAntdIconDefinition(DesktopOutlinedModule),
  download: unwrapAntdIconDefinition(DownloadOutlinedModule),
  eye: unwrapAntdIconDefinition(EyeOutlinedModule),
  github: unwrapAntdIconDefinition(GithubFilledModule),
  info: unwrapAntdIconDefinition(InfoCircleTwoToneModule),
  "list-unordered": unwrapAntdIconDefinition(UnorderedListOutlinedModule),
  location: unwrapAntdIconDefinition(EnvironmentOutlinedModule),
  moon: unwrapAntdIconDefinition(MoonFilledModule),
  profile: unwrapAntdIconDefinition(ProfileOutlinedModule),
  search: unwrapAntdIconDefinition(SearchOutlinedModule),
  sun: unwrapAntdIconDefinition(SunFilledModule),
  "three-bars": unwrapAntdIconDefinition(MenuOutlinedModule),
  translation: unwrapAntdIconDefinition(TranslationOutlinedModule),
  wechat: unwrapAntdIconDefinition(WechatFilledModule),
  x: unwrapAntdIconDefinition(CloseOutlinedModule),
} as const;

export type SiteIconName = keyof typeof SITE_ICON_DEFINITIONS;

export function resolveSimpleIconUrl(
  name: string,
  resolveIcon?: IconResolver,
): string {
  return resolveIcon?.(name, "simpleicons") ??
    `${SIMPLE_ICONS_ASSET_BASE}/${name}.svg`;
}

export function getSiteIconData(
  name: SiteIconName,
): SiteIconData {
  const icon = resolveRawIconNode(SITE_ICON_DEFINITIONS[name].icon);
  const { viewBox = "0 0 1024 1024", focusable: _focusable, ...svgAttrs } =
    icon.attrs;
  const paths = (icon.children ?? [])
    .filter((child) => child.tag === "path")
    .map((child) => child.attrs);

  return {
    paths,
    svgAttrs,
    viewBox,
  };
}

function renderAttributes(
  attributes: Readonly<Record<string, string>>,
): string {
  return Object.entries(attributes)
    .map(([name, value]) => ` ${escapeHtml(name)}="${escapeHtml(value)}"`)
    .join("");
}

export function renderSiteIconMarkup(
  name: SiteIconName,
  className: string,
  {
    width = 16,
    height = 16,
  }: Readonly<{
    width?: number;
    height?: number;
  }> = {},
): string {
  const { paths, svgAttrs, viewBox } = getSiteIconData(name);
  const svgMarkup = renderAttributes({
    ...svgAttrs,
    class: className,
    width: String(width),
    height: String(height),
    fill: "currentColor",
    "aria-hidden": "true",
    focusable: "false",
    "data-icon": name,
    viewBox,
  });
  const pathMarkup = paths.map((pathAttributes) =>
    `<path${renderAttributes(pathAttributes)}></path>`
  ).join("");

  return `<svg${svgMarkup}>${pathMarkup}</svg>`;
}
