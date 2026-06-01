import { environment } from "../config/environment.js";
import { imagesService } from "../images/images.service.js";
import { geminiProvider } from "../ai-providers/geminiProvider.js";
import { mockGenProvider } from "../ai-providers/mockGenProvider.js";
import { openaiProvider } from "../ai-providers/openaiProvider.js";
import { stableDiffusionProvider } from "../ai-providers/stableDiffusionProvider.js";
import { jobService } from "../job-pooling/job.service.js";
import type { StylePreset } from "@prisma/client";
import { stylesService } from "../styles/styles.service.js";
import { quotaService } from "../quota/quota.service.js";
import { BadRequestError } from "../errors/apiErrors.js";
import { RestyleSchema, zodParseOrThrow, type Model } from "shared";
import type { RequestIdentity } from "../types/index.js";

class AIGenerationService {
  async restyle(
    identity: RequestIdentity,
    input: {
      paths: string[];
      model: Model;
      style: StylePreset;
    },
    owner: string,
  ) {
    const { model, style, paths } = zodParseOrThrow(RestyleSchema, input);
    const jobIds: string[] = [];

    const reservedQuota = await quotaService.reserveQuotaAtomic(
      identity,
      paths.length,
    );

    for (const path of paths) {
      const jobId = await jobService.createJob({ path, model, style }, owner);
      jobIds.push(jobId);

      setImmediate(async () => {
        const startRestyle = async () => {
          const result = await this.restyleByProvider(path, model, style);
          await jobService.completeJob(jobId, result);
        };

        try {
          await startRestyle();
        } catch (err: any) {
          console.error(
            `Failed to generate restyle for image ${path}, model: ${model}, style: ${style}, jobId: ${jobId}`,
          );
          console.error(err);

          try {
            await jobService.updateJob(jobId, {
              status: "failed",
              error: err.message,
            });

            console.log("Trying auto restyle");

            await startRestyle();
          } catch (err: any) {
            console.error(
              `Failed to generate restyle for image ${path}, model: ${model}, style: ${style}, jobId: ${jobId}`,
            );
            console.error(err);

            await quotaService.refundQuota(reservedQuota.id, 1);
            await jobService.updateJob(jobId, {
              status: "failed_final",
              error: err.message,
            });
          }
        }
      });
    }

    return jobIds;
  }

  private async restyleByProvider(
    image: string,
    model: Model,
    style: StylePreset,
  ) {
    const blob = await imagesService.downloadImage(image);
    const arrayBuffer = await blob.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const base64Image = buffer.toString("base64");
    const mime = blob.type || "application/octet-stream";

    const prompt = stylesService.getPrompt(style);

    const generatedBuffer = await this.generateImage(model, {
      base64Image,
      blob,
      buffer,
      mimeType: mime,
      prompt,
    });

    if (!generatedBuffer) throw new Error("Failed to generate image");

    return await imagesService.uploadGeneratedImage({
      buffer: generatedBuffer,
      mimeType: "image/png",
    });
  }

  private getProvider(model: Model) {
    if (environment.USE_MOCK_AI) {
      return mockGenProvider;
    }

    switch (model) {
      case "gemini":
        return geminiProvider;
      case "openai":
        return openaiProvider;
      case "stable-diffusion":
        return stableDiffusionProvider;
      default:
        throw new BadRequestError(`Unsupported model: ${model}`);
    }
  }

  private async generateImage(
    model: Model,
    data: {
      base64Image: string;
      blob: Blob;
      buffer: Buffer<ArrayBuffer>;
      mimeType: string;
      prompt: string;
    },
  ) {
    const provider = this.getProvider(model);
    return provider.generateImage(data);
  }
}

export const aiGenerationService = new AIGenerationService();
