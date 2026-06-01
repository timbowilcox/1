import axios from "axios";
import type { ImageGenerationProviderI } from "../interfaces/imageGenerationProvider.js";
import { environment } from "../config/environment.js";

class StableDiffusionProvider implements ImageGenerationProviderI {
  async generateImage({
    blob,
    prompt,
  }: {
    base64Image: string;
    blob: Blob;
    mimeType: string;
    prompt: string;
  }) {
    const payload = {
      image: blob,
      mode: "image-to-image",
      prompt,
      output_format: "png",
      strength: 0.65,
    };

    const response = await axios.postForm(
      `https://api.stability.ai/v2beta/stable-image/generate/sd3`,
      axios.toFormData(payload, new FormData()),
      {
        validateStatus: () => true,
        responseType: "arraybuffer",
        timeout: 120_000,
        headers: {
          Authorization: `Bearer ${environment.SD_API_KEY}`,
          Accept: "image/*",
        },
      },
    );

    if (response.status === 200) {
      // responseType "arraybuffer" + Accept image/* → response.data is already
      // the raw PNG bytes. (The previous Buffer.from(data, "base64") decoded the
      // binary as base64, producing a corrupt image.)
      return Buffer.from(response.data);
    } else {
      const message = Buffer.from(response.data).toString("utf-8");
      console.error(message);
      throw new Error(`${response.status}: ${message}`);
    }
  }
}

export const stableDiffusionProvider = new StableDiffusionProvider();
