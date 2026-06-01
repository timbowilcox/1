import { describe, it, expect } from "vitest";
import { assertPublicUrl } from "../src/lib/net-guard";

describe("assertPublicUrl (SSRF guard)", () => {
  it("blocks the cloud metadata IP", async () => {
    await expect(
      assertPublicUrl("http://169.254.169.254/latest/meta-data"),
    ).rejects.toThrow();
  });

  it("blocks private / loopback ranges", async () => {
    await expect(assertPublicUrl("http://10.0.0.1")).rejects.toThrow();
    await expect(assertPublicUrl("http://192.168.1.1")).rejects.toThrow();
    await expect(assertPublicUrl("http://172.16.0.1")).rejects.toThrow();
    await expect(assertPublicUrl("http://127.0.0.1")).rejects.toThrow();
  });

  it("blocks localhost and non-http(s) schemes", async () => {
    await expect(assertPublicUrl("http://localhost/")).rejects.toThrow();
    await expect(assertPublicUrl("ftp://example.com")).rejects.toThrow();
    await expect(assertPublicUrl("file:///etc/passwd")).rejects.toThrow();
  });

  it("allows a public IP literal", async () => {
    const url = await assertPublicUrl("https://8.8.8.8/");
    expect(url.protocol).toBe("https:");
  });
});
