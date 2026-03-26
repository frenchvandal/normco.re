import { dirname, join } from "@std/path";

const TEMP_TEST_ROOT = join(
  import.meta.dirname ?? ".",
  "..",
  ".tmp",
  "deno-tests",
);

async function ensureTempTestRoot(): Promise<void> {
  await Deno.mkdir(TEMP_TEST_ROOT, { recursive: true });
}

export async function withTempDir<T>(
  prefix: string,
  callback: (tempDir: string) => Promise<T>,
): Promise<T> {
  await ensureTempTestRoot();
  const tempDir = await Deno.makeTempDir({ dir: TEMP_TEST_ROOT, prefix });

  try {
    return await callback(tempDir);
  } finally {
    await Deno.remove(tempDir, { recursive: true });
  }
}

export async function withTempFile<T>(
  prefix: string,
  callback: (tempFile: string) => Promise<T>,
): Promise<T> {
  await ensureTempTestRoot();
  const tempFile = await Deno.makeTempFile({ dir: TEMP_TEST_ROOT, prefix });

  try {
    return await callback(tempFile);
  } finally {
    await Deno.remove(tempFile);
  }
}

export async function writeTextTree(
  rootDir: string,
  files: Readonly<Record<string, string>>,
): Promise<void> {
  for (const [relativePath, content] of Object.entries(files)) {
    const outputPath = join(rootDir, relativePath);
    await Deno.mkdir(dirname(outputPath), { recursive: true });
    await Deno.writeTextFile(outputPath, content);
  }
}
