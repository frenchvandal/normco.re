/** Carbon icon renderer backed by the official `@carbon/icons` package. */

type CarbonIconContentNode = {
  readonly elem: "path";
  readonly attrs: Readonly<Record<string, string | number>>;
};

export type CarbonIconDescriptor = {
  readonly attrs: {
    readonly viewBox: string;
    readonly width: number;
    readonly height: number;
  };
  readonly content: readonly CarbonIconContentNode[];
  readonly name: string;
  readonly size: number;
};

/** Renders one official Carbon icon with the requested size and class names. */
export default (
  {
    icon,
    className,
    width,
    height,
  }: {
    readonly icon: CarbonIconDescriptor;
    readonly className: string;
    readonly width?: number;
    readonly height?: number;
  },
) => (
  <svg
    class={className}
    width={width ?? icon.attrs.width}
    height={height ?? icon.attrs.height}
    viewBox={icon.attrs.viewBox}
    fill="currentColor"
    aria-hidden="true"
    focusable="false"
    data-carbon-icon={icon.name}
  >
    {icon.content.map((node, index) => (
      <path
        key={`${icon.name}-${index}`}
        {...node.attrs}
      >
      </path>
    ))}
  </svg>
);
