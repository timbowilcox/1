import OpenAI from "openai";
import type { ImageGenerationProviderI } from "../interfaces/imageGenerationProvider.js";
import { environment } from "../config/environment.js";

class OpenaiProvider implements ImageGenerationProviderI {
  private client: OpenAI | null = null;

  // Lazy init: an unset OPENAI_API_KEY must not crash the app at boot — it only
  // matters if the OpenAI model is actually selected.
  private getClient(): OpenAI {
    if (!this.client) {
      if (!environment.OPENAI_API_KEY) {
        throw new Error("OPENAI_API_KEY is not configured");
      }
      this.client = new OpenAI({ apiKey: environment.OPENAI_API_KEY });
    }
    return this.client;
  }

  async generateImage({
    buffer,
    prompt,
    mimeType,
  }: {
    base64Image: string;
    blob: Blob;
    buffer: Buffer<ArrayBuffer>;
    mimeType: string;
    prompt: string;
  }) {
    const file = new File([buffer], "input.png", { type: mimeType });

    const result = await this.getClient().images.edit(
      {
        model: "gpt-image-1",
        image: file,
        prompt,
      },
      { timeout: 120_000, maxRetries: 1 },
    );

    const image_base64 = result.data?.[0]?.b64_json;
    if (!image_base64) throw new Error("No image returned from Openai");

    return Buffer.from(image_base64, "base64");
  }
}

export const openaiProvider = new OpenaiProvider();
