type PatchedDenoKey = "readDir" | "readTextFile" | "stat";

type PatchedDenoFns = Partial<Pick<typeof Deno, PatchedDenoKey>>;

export async function withPatchedDeno<T>(
  patch: PatchedDenoFns,
  callback: () => Promise<T> | T,
): Promise<T> {
  const denoObject = Deno as unknown as Record<PatchedDenoKey, unknown>;
  const originals = new Map<PatchedDenoKey, unknown>();

  try {
    for (const key of Object.keys(patch) as PatchedDenoKey[]) {
      originals.set(key, denoObject[key]);
      denoObject[key] = patch[key];
    }

    return await callback();
  } finally {
    for (const [key, value] of originals) {
      denoObject[key] = value;
    }
  }
}

export function createDirEntry(
  name: string,
  kind: "file" | "directory",
): Deno.DirEntry {
  return {
    name,
    isDirectory: kind === "directory",
    isFile: kind === "file",
    isSymlink: false,
  };
}
