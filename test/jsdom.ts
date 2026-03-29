let jsdomPromise: Promise<typeof import("npm:jsdom@29.0.0")> | undefined;

export async function getJSDOM(): Promise<
  (typeof import("npm:jsdom@29.0.0"))["JSDOM"]
> {
  if (!jsdomPromise) {
    jsdomPromise = import("npm:jsdom@29.0.0");
  }

  const { JSDOM } = await jsdomPromise;
  return JSDOM;
}
