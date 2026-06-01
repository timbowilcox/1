import type { Request } from "express";
import { prisma } from "../lib/prisma/index.js";
import { ForbiddenError } from "../errors/apiErrors.js";

/**
 * Authorizes access to a storage path for signed-URL / download requests.
 *
 * Two ways a request may legitimately reference a path:
 *  1. Session-owned: the path was produced by this session (upload / scrape /
 *     restyle input). Tracked in req.session.ownedPaths — covers the guest and
 *     pre-save flows without requiring a logged-in user.
 *  2. DB-owned: the path lives under a project (original/<projectId>/... or
 *     generated/<projectId>/...) owned by the authenticated user.
 *
 * Anything else is rejected — this closes the "sign/download any path" IDOR.
 */

const MAX_OWNED_PATHS = 500;

/** A thumbnail (foo_thumb.ext) shares ownership with its base (foo.ext). */
function normalizeBase(path: string): string {
  return path.replace(/_thumb(\.[^.]+)?$/, "$1");
}

export function rememberOwnedPaths(req: Request, paths: Array<string | null | undefined>): void {
  const set = new Set<string>(req.session.ownedPaths ?? []);
  for (const p of paths) if (p) set.add(p);
  let arr = [...set];
  if (arr.length > MAX_OWNED_PATHS) arr = arr.slice(arr.length - MAX_OWNED_PATHS);
  req.session.ownedPaths = arr;
}

function isOwnedInSession(req: Request, path: string): boolean {
  const owned = req.session.ownedPaths ?? [];
  const base = normalizeBase(path);
  return owned.includes(path) || owned.includes(base);
}

// Saved project assets: original/<projectId>/<file> or generated/<projectId>/<file>
function extractProjectId(path: string): string | null {
  const m = path.match(
    /^(?:original|generated)\/([0-9a-fA-F-]{36})\//,
  );
  return m ? m[1]! : null;
}

export async function assertCanAccessPaths(req: Request, paths: string[]): Promise<void> {
  const userId = req.session.userId;
  const projectIdsToCheck = new Set<string>();

  for (const path of paths) {
    if (!path) continue;
    if (isOwnedInSession(req, path)) continue;

    const projectId = extractProjectId(path);
    if (projectId && userId) {
      projectIdsToCheck.add(projectId);
      continue;
    }
    throw new ForbiddenError("You do not have access to this resource");
  }

  if (projectIdsToCheck.size === 0) return;
  if (!userId) throw new ForbiddenError("You do not have access to this resource");

  const ids = [...projectIdsToCheck];
  const owned = await prisma.project.findMany({
    where: { id: { in: ids }, userId },
    select: { id: true },
  });
  const ownedSet = new Set(owned.map((p) => p.id));

  for (const id of ids) {
    if (!ownedSet.has(id)) {
      throw new ForbiddenError("You do not have access to this resource");
    }
  }
}
