import OpenAI from "openai";
import type { ImageGenerationProviderI } from "../interfaces/imageGenerationProvider.js";
import { environment } from "../config/environment.js";

class OpenaiProvider implements ImageGenerationProviderI {
  private openai = new OpenAI({
    apiKey: environment.OPENAI_API_KEY,
  });

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

    const result = await this.openai.images.edit(
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
