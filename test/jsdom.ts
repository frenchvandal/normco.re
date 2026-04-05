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

type ClassicScriptEvaluationWindow = Readonly<{
  eval(source: string): unknown;
}>;

type ClassicScriptInstallationWindow = Readonly<{
  document: Document;
}>;

/**
 * Evaluate a classic browser script against a JSDOM window configured with
 * `runScripts: "outside-only"`. Tests already import local script source from
 * disk, so this keeps the trust boundary explicit in one helper instead of
 * scattering direct `window.eval(...)` calls across the suite.
 */
export function evaluateClassicScript(
  window: ClassicScriptEvaluationWindow,
  source: string,
): void {
  window.eval(source);
}

/**
 * Install a classic inline script into a JSDOM document configured with
 * `runScripts: "dangerously"` so the DOM executes the exact source under test.
 */
export function installClassicScript(
  window: ClassicScriptInstallationWindow,
  source: string,
  dataset: Readonly<Record<string, string>> = {},
): HTMLScriptElement {
  const script = window.document.createElement("script");

  for (const [key, value] of Object.entries(dataset)) {
    script.dataset[key] = value;
  }

  script.textContent = source;
  window.document.body.append(script);

  return script;
}
