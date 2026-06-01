import { load } from "cheerio";
import { isImageUrl } from "../utils/isImageUrl.util.js";
import { NotFoundError } from "../errors/apiErrors.js";
import { safeFetchText } from "../lib/net-guard.js";

class URLScraperService {
  async scrapeUrl(url: string) {
    // if the user provided a direct image URL.
    if (await isImageUrl(url)) return [url];

    // SSRF-guarded fetch (scheme/host validation, redirect re-validation,
    // timeout, size cap) — the page URL is fully user-controlled.
    const { text: html } = await safeFetchText(url, {
      headers: {
        "user-agent":
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 Chrome/120 Safari/537.36",
      },
    });

    const $ = load(html);

    const ogImage = $('meta[property="og:image"]').attr("content");

    const images: string[] = [];

    // og:image
    if (ogImage) images.push(ogImage);

    $("img").each((_, el) => {
      const src = $(el).attr("src") || $(el).attr("data-src");

      // Only return absolute http(s) candidates; each is re-validated by the
      // SSRF guard again when the client uploads it via /upload-by-urls.
      if (src && /^https?:\/\//i.test(src)) {
        images.push(src);
      }
    });

    const unique = [...new Set(images)];

    if (unique.length === 0) {
      throw new NotFoundError("Images not found");
    }

    return unique.slice(0, 10); // lightweight
  }
}

export const urlScraperService = new URLScraperService();
