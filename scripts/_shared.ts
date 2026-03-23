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

export function lineNumberAt(source: string, index: number): number {
  let line = 1;

  for (let i = 0; i < index; i += 1) {
    if (source[i] === "\n") {
      line += 1;
    }
  }

  return line;
}

export function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}
