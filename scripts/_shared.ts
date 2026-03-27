/**
 * Returns whether a path currently exists on disk.
 *
 * @example
 * ```ts
 * import { fileExists } from "./_shared.ts";
 *
 * const exists = await fileExists("./_shared.ts");
 * console.log(typeof exists === "boolean");
 * ```
 */
export async function fileExists(filePath: string): Promise<boolean> {
  try {
    await Deno.stat(filePath);
    return true;
  } catch (error) {
    if (error instanceof Deno.errors.NotFound) {
      return false;
    }

    throw error;
  }
}

/**
 * Returns `true` when CLI args include `--help` or `-h`.
 *
 * @example
 * ```ts
 * import { hasHelpFlag } from "./_shared.ts";
 *
 * if (!hasHelpFlag(["--help"])) {
 *   throw new Error("Expected help flag to be detected");
 * }
 * ```
 */
export function hasHelpFlag(args: ReadonlyArray<string>): boolean {
  return args.some((arg) => arg === "--help" || arg === "-h");
}

/**
 * Creates a consistent usage error for repo-local CLI utilities.
 *
 * @example
 * ```ts
 * import { createUsageError } from "./_shared.ts";
 *
 * const error = createUsageError("Missing path", "Usage: cmd <path>");
 * console.log(error.message.includes("Usage: cmd <path>"));
 * ```
 */
export function createUsageError(message: string, usage: string): Error {
  return new Error(`${message}\n\n${usage}`);
}

/**
 * Maps a string index to a 1-based line number.
 *
 * @example
 * ```ts
 * import { lineNumberAt } from "./_shared.ts";
 *
 * if (lineNumberAt("alpha\nbeta", 6) !== 2) {
 *   throw new Error("Expected second line");
 * }
 * ```
 */
export function lineNumberAt(source: string, index: number): number {
  let line = 1;

  for (let i = 0; i < index; i += 1) {
    if (source[i] === "\n") {
      line += 1;
    }
  }

  return line;
}

export function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : String(error);
}
