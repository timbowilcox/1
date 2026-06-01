import { lookup } from "node:dns/promises";
import net from "node:net";
import { BadRequestError } from "../errors/apiErrors.js";

/**
 * SSRF protection for server-side fetches of user-supplied URLs.
 *
 * The server holds the Supabase service-role key and runs inside the cloud
 * network, so an unvalidated fetch of an attacker URL could reach the cloud
 * metadata endpoint or internal services. Every outbound fetch of a
 * user-controlled URL MUST go through assertPublicUrl / safeFetch* here.
 */

const MAX_REDIRECTS = 3;
const FETCH_TIMEOUT_MS = 8000;
const DEFAULT_MAX_BYTES = 15 * 1024 * 1024; // 15MB

function isPrivateIp(ip: string): boolean {
  // Normalise IPv4-mapped IPv6 (::ffff:a.b.c.d)
  const v4 = ip.startsWith("::ffff:") ? ip.slice(7) : ip;

  if (net.isIPv4(v4)) {
    const parts = v4.split(".").map(Number);
    const [a, b] = parts as [number, number];
    if (a === 0) return true; // "this" network
    if (a === 10) return true; // private
    if (a === 127) return true; // loopback
    if (a === 169 && b === 254) return true; // link-local + cloud metadata (169.254.169.254)
    if (a === 172 && b >= 16 && b <= 31) return true; // private
    if (a === 192 && b === 168) return true; // private
    if (a === 100 && b >= 64 && b <= 127) return true; // CGNAT (100.64/10)
    if (a >= 224) return true; // multicast / reserved
    return false;
  }

  const lower = ip.toLowerCase();
  if (lower === "::1" || lower === "::") return true; // loopback / unspecified
  if (lower.startsWith("fe80")) return true; // link-local
  if (lower.startsWith("fc") || lower.startsWith("fd")) return true; // unique-local
  return false;
}

/** Parse + validate a URL, rejecting non-http(s) schemes and private/internal hosts. */
export async function assertPublicUrl(rawUrl: string): Promise<URL> {
  let url: URL;
  try {
    url = new URL(rawUrl);
  } catch {
    throw new BadRequestError("Invalid URL");
  }

  if (url.protocol !== "http:" && url.protocol !== "https:") {
    throw new BadRequestError("Only http(s) URLs are allowed");
  }

  const host = url.hostname.replace(/^\[|\]$/g, ""); // strip IPv6 brackets

  if (host.toLowerCase() === "localhost") {
    throw new BadRequestError("Blocked host");
  }

  if (net.isIP(host)) {
    if (isPrivateIp(host)) throw new BadRequestError("Blocked private address");
    return url;
  }

  let addresses: { address: string }[];
  try {
    addresses = await lookup(host, { all: true });
  } catch {
    throw new BadRequestError("Could not resolve host");
  }

  if (addresses.length === 0) throw new BadRequestError("Could not resolve host");

  for (const a of addresses) {
    if (isPrivateIp(a.address)) {
      throw new BadRequestError("Blocked private address");
    }
  }

  return url;
}

async function readCapped(res: Response, maxBytes: number): Promise<Buffer> {
  if (!res.body) return Buffer.alloc(0);
  const reader = res.body.getReader();
  const chunks: Buffer[] = [];
  let total = 0;
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    if (value) {
      total += value.byteLength;
      if (total > maxBytes) {
        await reader.cancel().catch(() => {});
        throw new BadRequestError("Resource exceeds maximum size");
      }
      chunks.push(Buffer.from(value));
    }
  }
  return Buffer.concat(chunks);
}

async function safeRequest(
  rawUrl: string,
  method: "GET" | "HEAD",
  headers?: Record<string, string>,
): Promise<Response> {
  let current = rawUrl;
  for (let i = 0; i <= MAX_REDIRECTS; i++) {
    await assertPublicUrl(current);

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
    let res: Response;
    try {
      res = await fetch(current, {
        method,
        redirect: "manual",
        signal: controller.signal,
        headers,
      });
    } finally {
      clearTimeout(timer);
    }

    // Follow redirects manually so every hop is re-validated (defeats
    // redirect-to-internal and DNS-rebind via Location).
    if (res.status >= 300 && res.status < 400) {
      const location = res.headers.get("location");
      if (!location) throw new BadRequestError("Invalid redirect");
      try {
        await res.arrayBuffer();
      } catch {
        /* drain */
      }
      current = new URL(location, current).toString();
      continue;
    }

    return res;
  }
  throw new BadRequestError("Too many redirects");
}

export async function safeFetchBuffer(
  rawUrl: string,
  opts: { maxBytes?: number; headers?: Record<string, string> } = {},
): Promise<{ buffer: Buffer; contentType: string | null }> {
  const res = await safeRequest(rawUrl, "GET", opts.headers);
  if (!res.ok) throw new BadRequestError(`Failed to fetch resource (${res.status})`);

  const maxBytes = opts.maxBytes ?? DEFAULT_MAX_BYTES;
  const declared = Number(res.headers.get("content-length") ?? "0");
  if (declared && declared > maxBytes) {
    throw new BadRequestError("Resource exceeds maximum size");
  }
  const buffer = await readCapped(res, maxBytes);
  return { buffer, contentType: res.headers.get("content-type") };
}

export async function safeFetchText(
  rawUrl: string,
  opts: { maxBytes?: number; headers?: Record<string, string> } = {},
): Promise<{ text: string; contentType: string | null }> {
  const res = await safeRequest(rawUrl, "GET", opts.headers);
  if (!res.ok) throw new BadRequestError(`Failed to fetch page (${res.status})`);
  const buffer = await readCapped(res, opts.maxBytes ?? DEFAULT_MAX_BYTES);
  return { text: buffer.toString("utf-8"), contentType: res.headers.get("content-type") };
}

export async function safeHeadContentType(rawUrl: string): Promise<string | null> {
  const res = await safeRequest(rawUrl, "HEAD");
  return res.headers.get("content-type");
}
