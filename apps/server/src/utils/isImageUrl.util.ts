import { safeHeadContentType } from "../lib/net-guard.js";

/**
 * Best-effort check whether a URL points directly at an image. SSRF-guarded:
 * a blocked/private/unreachable host resolves to `false` (the caller then
 * treats it as a page URL, which is itself guarded).
 */
export async function isImageUrl(url: string): Promise<boolean> {
  try {
    const contentType = await safeHeadContentType(url);
    return !!contentType?.startsWith("image/");
  } catch {
    return false;
  }
}
