import fs from "node:fs";

let jsdomPromise: Promise<typeof import("npm:jsdom@29.0.0")> | undefined;

export async function getJSDOM(): Promise<
  (typeof import("npm:jsdom@29.0.0"))["JSDOM"]
> {
  if (!jsdomPromise) {
    const originalReadFileSync = fs.readFileSync;

    fs.readFileSync = ((path: fs.PathOrFileDescriptor, options?: unknown) => {
      if (String(path).endsWith("default-stylesheet.css")) {
        return "";
      }

      return originalReadFileSync(
        path,
        options as Parameters<typeof originalReadFileSync>[1],
      );
    }) as typeof fs.readFileSync;

    jsdomPromise = import("npm:jsdom@29.0.0").finally(() => {
      fs.readFileSync = originalReadFileSync;
    });
  }

  const { JSDOM } = await jsdomPromise;
  return JSDOM;
}
