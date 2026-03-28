import { getSiteIconData, type SiteIconName } from "../utils/site-icons.ts";

type SiteIconProps = Readonly<{
  name: SiteIconName;
  className: string;
  width?: number;
  height?: number;
}>;

export default (
  { name, className, width = 16, height = 16 }: SiteIconProps,
) => {
  const { paths, svgAttrs, viewBox } = getSiteIconData(name);
  const svgProps = {
    ...svgAttrs,
    class: className,
    width,
    height,
    viewBox,
    fill: "currentColor",
    "aria-hidden": "true",
    focusable: "false",
    "data-icon": name,
  } as const;

  return (
    <svg {...svgProps}>
      {paths.map((path, index) => (
        <path key={`${name}-${index}`} {...path}></path>
      ))}
    </svg>
  );
};
