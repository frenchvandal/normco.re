import { walk } from "@std/fs";
import { getErrorMessage } from "../scripts/_shared.ts";

type CommandStatus = {
  readonly code: number;
  readonly success: boolean;
};

export type BuildTask = {
  readonly name: string;
  readonly command: string;
  readonly args: ReadonlyArray<string>;
};

export type CommandRunner = (
  command: string,
  args: ReadonlyArray<string>,
) => Promise<CommandStatus>;

export const PRE_BUILD_TASKS: ReadonlyArray<BuildTask> = [
  {
    name: "ensure quality report directory",
    command: "deno",
    args: ["run", "--allow-write", "scripts/ensure-dir.ts", "_quality"],
  },
];

export const POST_BUILD_TASKS: ReadonlyArray<BuildTask> = [
  {
    name: "fingerprint built assets",
    command: "deno",
    args: [
      "run",
      "--allow-read",
      "--allow-write",
      "scripts/fingerprint-assets.ts",
      "_site",
    ],
  },
  {
    name: "verify browser imports",
    command: "deno",
    args: ["run", "--allow-read", "scripts/check-browser-imports.ts", "_site"],
  },
  {
    name: "format built HTML and JSON output",
    command: "deno",
    args: ["fmt", "_site/**/*.html", "_site/**/*.json"],
  },
  {
    name: "validate built output links",
    command: "deno",
    args: [
      "run",
      "--allow-read",
      "--allow-write",
      "scripts/check-output-links.ts",
      "_site",
      "_quality/broken-links.json",
    ],
  },
];

function formatCommand(command: string, args: ReadonlyArray<string>): string {
  return [command, ...args].join(" ");
}

async function collectFilesByExtension(
  rootDir: string,
  extension: string,
): Promise<ReadonlyArray<string>> {
  const files: string[] = [];

  try {
    for await (
      const entry of walk(rootDir, {
        includeDirs: false,
        exts: [extension],
      })
    ) {
      files.push(entry.path);
    }
  } catch (error) {
    if (error instanceof Deno.errors.NotFound) {
      return [];
    }

    throw error;
  }

  return files.sort();
}

async function resolveTaskArgs(
  task: BuildTask,
): Promise<ReadonlyArray<string>> {
  const firstArg = task.args[0];

  if (task.command !== "deno" || firstArg !== "fmt") {
    return task.args;
  }

  const resolvedArgs: string[] = ["fmt"];
  const globPattern = /^(.*)\/\*\*\/\*\.([a-z0-9]+)$/i;

  for (const arg of task.args.slice(1)) {
    const match = globPattern.exec(arg);

    if (match) {
      const rootDir = match[1];
      const extensionSuffix = match[2];

      if (rootDir === undefined || extensionSuffix === undefined) {
        continue;
      }

      resolvedArgs.push(
        ...await collectFilesByExtension(rootDir, `.${extensionSuffix}`),
      );
      continue;
    }

    resolvedArgs.push(arg);
  }

  return resolvedArgs;
}

async function defaultCommandRunner(
  command: string,
  args: ReadonlyArray<string>,
): Promise<CommandStatus> {
  const child = new Deno.Command(command, {
    args: [...args],
    stdout: "inherit",
    stderr: "inherit",
  }).spawn();

  return await child.status;
}

export async function runBuildTask(
  task: BuildTask,
  runCommand: CommandRunner = defaultCommandRunner,
): Promise<void> {
  try {
    const args = await resolveTaskArgs(task);

    if (task.command === "deno" && args.length === 1 && args[0] === "fmt") {
      return;
    }

    const status = await runCommand(task.command, args);

    if (!status.success) {
      throw new Error(`Command exited with code ${status.code}`);
    }
  } catch (error) {
    throw new Error(
      `[build-task] ${task.name} failed while running "${
        formatCommand(task.command, task.args)
      }": ${getErrorMessage(error)}`,
    );
  }
}

export async function runBuildTasks(
  tasks: ReadonlyArray<BuildTask>,
  runCommand: CommandRunner = defaultCommandRunner,
): Promise<void> {
  for (const task of tasks) {
    await runBuildTask(task, runCommand);
  }
}
