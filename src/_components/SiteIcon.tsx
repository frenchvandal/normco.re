import { getOcticonPathData, type OcticonName } from "../utils/primer-icons.ts";

type SiteIconProps = Readonly<{
  name: OcticonName;
  className: string;
  width?: number;
  height?: number;
}>;

export default (
  { name, className, width = 16, height = 16 }: SiteIconProps,
) => (
  <svg
    class={className}
    width={width}
    height={height}
    viewBox="0 0 16 16"
    fill="currentColor"
    aria-hidden="true"
    focusable="false"
    data-icon={name}
  >
    {getOcticonPathData(name).map((path, index) => (
      <path key={`${name}-${index}`} d={path}></path>
    ))}
  </svg>
);
