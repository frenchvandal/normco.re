const GIT_REMOTE_HEAD_PREFIX = "refs/remotes/origin/";
const TEXT_DECODER = new TextDecoder();

export type GitRepositoryInfo = Readonly<{
  rootPath: string;
  repositoryUrl?: string;
  defaultBranch?: string;
}>;

export type GitFileLastCommit = Readonly<{
  sha: string;
  shortSha: string;
  committedAt: string;
  filePath: string;
  historyUrl?: string;
  commitUrl?: string;
}>;

export type GitFileHistory = Readonly<{
  createdAt?: string;
  lastCommit?: GitFileLastCommit;
}>;

type GitCommandRunner = (
  args: string[],
  cwd?: string,
) => string | undefined;

export function normalizeGitPath(path: string): string {
  return path.replaceAll("\\", "/");
}

export function runGitCommand(
  args: string[],
  cwd?: string,
): string | undefined {
  try {
    const output = new Deno.Command("git", {
      args,
      ...(cwd ? { cwd } : {}),
    }).outputSync();

    if (!output.success) {
      return undefined;
    }

    return TEXT_DECODER.decode(output.stdout).trim();
  } catch {
    return undefined;
  }
}

export function normalizeRepositoryUrl(
  url: string | undefined,
): string | undefined {
  if (!url) {
    return undefined;
  }

  if (url.startsWith("git@")) {
    const sshMatch = /^git@([^:]+):(.+?)(?:\.git)?$/.exec(url);

    if (sshMatch) {
      const [, host, repoPath] = sshMatch;
      return `https://${host}/${repoPath}`;
    }
  }

  return url.replace(/\.git$/, "").replace(/\/+$/, "");
}

export function parseDefaultBranch(
  remoteHeadRef: string | undefined,
  fallbackBranch: string | undefined,
): string | undefined {
  if (remoteHeadRef?.startsWith(GIT_REMOTE_HEAD_PREFIX)) {
    return remoteHeadRef.slice(GIT_REMOTE_HEAD_PREFIX.length);
  }

  if (fallbackBranch && fallbackBranch.trim().length > 0) {
    return fallbackBranch.trim();
  }

  return undefined;
}

export function toRepoRelativePath(
  sourcePath: string,
  rootPath: string,
): string | undefined {
  if (sourcePath.length === 0 || sourcePath === "(generated)") {
    return undefined;
  }

  const normalizedSourcePath = normalizeGitPath(sourcePath);
  const normalizedRootPath = normalizeGitPath(rootPath).replace(/\/+$/, "");

  if (normalizedSourcePath === normalizedRootPath) {
    return undefined;
  }

  if (normalizedSourcePath.startsWith(`${normalizedRootPath}/`)) {
    return normalizedSourcePath.slice(normalizedRootPath.length + 1);
  }

  return normalizedSourcePath.replace(/^\/+/, "");
}

function getGitPathCandidates(
  sourcePath: string,
  rootPath: string,
): string[] {
  const repoRelativePath = toRepoRelativePath(sourcePath, rootPath);

  if (!repoRelativePath) {
    return [];
  }

  const candidates = new Set([repoRelativePath]);

  if (!repoRelativePath.startsWith("src/")) {
    candidates.add(`src/${repoRelativePath}`);
  }

  return [...candidates];
}

function encodeGitHubPath(path: string): string {
  return path.split("/").map(encodeURIComponent).join("/");
}

export function buildGitHubHistoryUrl(
  repositoryUrl: string | undefined,
  branch: string | undefined,
  filePath: string | undefined,
): string | undefined {
  if (!repositoryUrl || !branch || !filePath) {
    return undefined;
  }

  return `${repositoryUrl}/commits/${encodeURIComponent(branch)}/${
    encodeGitHubPath(filePath)
  }`;
}

export function buildGitHubCommitUrl(
  repositoryUrl: string | undefined,
  sha: string | undefined,
): string | undefined {
  if (!repositoryUrl || !sha) {
    return undefined;
  }

  return `${repositoryUrl}/commit/${encodeURIComponent(sha)}`;
}

export function parseGitFileLastCommit(
  value: string | undefined,
):
  | Readonly<{ sha: string; shortSha: string; committedAt: string }>
  | undefined {
  if (!value) {
    return undefined;
  }

  const [sha, committedAt] = value.split("\0");

  if (!sha || !committedAt) {
    return undefined;
  }

  return {
    sha,
    shortSha: sha.slice(0, 7),
    committedAt,
  };
}

export function getGitRepositoryInfo(
  runCommand: GitCommandRunner = runGitCommand,
  cwd: string = Deno.cwd(),
): GitRepositoryInfo | undefined {
  const rootPath = runCommand(["rev-parse", "--show-toplevel"], cwd);

  if (!rootPath) {
    return undefined;
  }

  const normalizedRootPath = normalizeGitPath(rootPath);
  const repositoryUrl = normalizeRepositoryUrl(
    runCommand(["config", "--get", "remote.origin.url"], normalizedRootPath),
  );
  const defaultBranch = parseDefaultBranch(
    runCommand(
      ["symbolic-ref", "refs/remotes/origin/HEAD"],
      normalizedRootPath,
    ),
    runCommand(["branch", "--show-current"], normalizedRootPath),
  );

  return {
    rootPath: normalizedRootPath,
    ...(repositoryUrl ? { repositoryUrl } : {}),
    ...(defaultBranch ? { defaultBranch } : {}),
  };
}

export function createGitFileLastCommitResolver(
  runCommand: GitCommandRunner = runGitCommand,
  cwd: string = Deno.cwd(),
): (sourcePath: string) => GitFileLastCommit | undefined {
  const resolveHistory = createGitFileHistoryResolver(runCommand, cwd);

  return (sourcePath: string): GitFileLastCommit | undefined =>
    resolveHistory(sourcePath).lastCommit;
}

export function createGitFileHistoryResolver(
  runCommand: GitCommandRunner = runGitCommand,
  cwd: string = Deno.cwd(),
): (sourcePath: string) => GitFileHistory {
  const repository = getGitRepositoryInfo(runCommand, cwd);
  const cache = new Map<string, GitFileHistory>();

  return (sourcePath: string): GitFileHistory => {
    const normalizedSourcePath = normalizeGitPath(sourcePath);

    if (cache.has(normalizedSourcePath)) {
      return cache.get(normalizedSourcePath) ?? {};
    }

    if (!repository) {
      const emptyHistory = {};
      cache.set(normalizedSourcePath, emptyHistory);
      return emptyHistory;
    }

    const filePathCandidates = getGitPathCandidates(
      normalizedSourcePath,
      repository.rootPath,
    );

    if (filePathCandidates.length === 0) {
      const emptyHistory = {};
      cache.set(normalizedSourcePath, emptyHistory);
      return emptyHistory;
    }

    let filePath: string | undefined;
    let lastCommit:
      | Readonly<{ sha: string; shortSha: string; committedAt: string }>
      | undefined;
    let createdAt: string | undefined;

    for (const candidate of filePathCandidates) {
      const candidateLastCommit = parseGitFileLastCommit(
        runCommand(
          ["log", "--follow", "-n", "1", "--format=%H%x00%cI", "--", candidate],
          repository.rootPath,
        ),
      );
      const candidateCreatedAt = runCommand(
        ["log", "--follow", "--diff-filter=A", "--format=%cI", "--", candidate],
        repository.rootPath,
      )
        ?.split("\n")
        .filter((line) => line.trim().length > 0)
        .at(-1);

      if (candidateLastCommit || candidateCreatedAt) {
        filePath = candidate;
        lastCommit = candidateLastCommit;
        createdAt = candidateCreatedAt;
        break;
      }
    }

    if (!filePath) {
      const emptyHistory = {};
      cache.set(normalizedSourcePath, emptyHistory);
      return emptyHistory;
    }

    const historyUrl = buildGitHubHistoryUrl(
      repository.repositoryUrl,
      repository.defaultBranch,
      filePath,
    );
    const commitUrl = lastCommit
      ? buildGitHubCommitUrl(repository.repositoryUrl, lastCommit.sha)
      : undefined;
    const resolvedLastCommit = lastCommit
      ? {
        ...lastCommit,
        filePath,
        ...(historyUrl ? { historyUrl } : {}),
        ...(commitUrl ? { commitUrl } : {}),
      }
      : undefined;
    const history = {
      ...(createdAt ? { createdAt } : {}),
      ...(resolvedLastCommit ? { lastCommit: resolvedLastCommit } : {}),
    };

    cache.set(normalizedSourcePath, history);
    return history;
  };
}
