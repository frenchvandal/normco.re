type SsxProps = Record<string, unknown>;

type SsxRenderable =
  | string
  | number
  | boolean
  | null
  | undefined
  | { __html?: string }
  | SsxRenderable[]
  | Promise<SsxRenderable>;

type SsxComponent = {
  type: string | ((props: SsxProps) => SsxRenderable);
  props: SsxProps;
};

export function jsx(type: string, props: SsxProps): SsxComponent;
export const jsxs: typeof jsx;
export function Fragment(props: { children: unknown }): unknown;
export function renderComponent(
  component: unknown | unknown[],
): Promise<string>;

export namespace JSX {
  export type Element = SsxRenderable | SsxComponent | Promise<SsxRenderable>;

  export interface IntrinsicAttributes {
    key?: string | number;
  }

  export interface ElementChildrenAttribute {
    children: unknown;
  }

  export interface IntrinsicElements {
    [elemName: string]: Record<string, unknown>;
  }
}
