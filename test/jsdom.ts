let jsdomPromise: Promise<typeof import("npm/jsdom")> | undefined;

export async function getJSDOM(): Promise<
  (typeof import("npm/jsdom"))["JSDOM"]
> {
  if (!jsdomPromise) {
    jsdomPromise = import("npm/jsdom");
  }

  const { JSDOM } = await jsdomPromise;
  return JSDOM;
}
