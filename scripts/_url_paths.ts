import { join, relative } from "@std/path";
import {
  basename as posixBasename,
  dirname as posixDirname,
  normalize as normalizePosix,
  relative as posixRelative,
} from "@std/path/posix";

function toAbsoluteUrlPath(urlPath: string): string {
  const normalizedPath = normalizePosix(urlPath);

  if (normalizedPath === "." || normalizedPath.length === 0) {
    return "/";
  }

  return normalizedPath.startsWith("/") ? normalizedPath : `/${normalizedPath}`;
}

export function toOutputPath(rootDir: string, urlPath: string): string {
  const relativeUrlPath = posixRelative("/", toAbsoluteUrlPath(urlPath));

  return relativeUrlPath.length === 0
    ? rootDir
    : join(rootDir, relativeUrlPath);
}

export function toSiteUrl(rootDir: string, outputPath: string): string {
  return toAbsoluteUrlPath(relative(rootDir, outputPath).replaceAll("\\", "/"));
}

export function getUrlDirectory(urlPath: string): string {
  const directory = posixDirname(toAbsoluteUrlPath(urlPath));
  return directory === "." ? "/" : directory;
}

export function getUrlBasename(urlPath: string): string {
  return posixBasename(toAbsoluteUrlPath(urlPath));
}

export function toRelativeUrlPath(fromDir: string, toPath: string): string {
  const relativeUrlPath = posixRelative(
    toAbsoluteUrlPath(fromDir),
    toAbsoluteUrlPath(toPath),
  );

  if (relativeUrlPath.length === 0) {
    return "./";
  }

  return relativeUrlPath.startsWith(".")
    ? relativeUrlPath
    : `./${relativeUrlPath}`;
}
