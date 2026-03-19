import type { jsx } from "lume/jsx-runtime";

type BrandMarkProps = {
  readonly className?: string;
  readonly decorative?: boolean;
  readonly title?: string;
};

/** Stylized site mark derived from the blog logo strokes provided by the author. */
export default function BrandMark(
  { className, decorative = true, title = "normco.re logo" }: BrandMarkProps,
): ReturnType<typeof jsx> {
  const labelled = decorative !== true;
  const svgClass = className === undefined ? {} : { class: className };

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 1200 675"
      {...svgClass}
      fill="none"
      stroke="currentColor"
      stroke-width="6"
      stroke-linecap="round"
      stroke-linejoin="round"
      preserveAspectRatio="xMidYMid meet"
      {...(labelled
        ? { role: "img", "aria-label": title }
        : { "aria-hidden": "true", focusable: "false" })}
    >
      {!decorative ? <title>{title}</title> : null}
      <g>
        <path d="M80 420 L180 160 L260 160 L220 300 L320 300 L360 160 L440 160 L400 300 L520 300 L560 160 L640 160 L600 300 L720 300 L760 160 L840 160 L800 300 L900 300" />
        <path d="M200 300 L240 200" />
        <path d="M360 300 L400 200" />
        <path d="M560 300 L600 200" />
        <path d="M760 300 L800 200" />
        <path d="M300 420 L320 360 L380 360 L360 420 Z" />
        <path d="M400 420 L420 360 L480 360 L460 420 Z" />
        <path d="M500 420 L520 360 L580 360 L560 420 Z" />
        <path d="M600 420 L620 360 L680 360 L660 420 Z" />
        <path d="M700 420 L720 360 L780 360 L760 420 Z" />
        <path d="M800 420 L820 360 L880 360 L860 420 Z" />
      </g>
    </svg>
  );
}
