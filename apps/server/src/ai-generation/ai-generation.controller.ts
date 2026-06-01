import type { Request, Response } from "express";
import { aiGenerationService } from "./ai-generation.service.js";
import { jobService } from "../job-pooling/job.service.js";
import type { UserDTO } from "../users/users.dto.js";
import { BadRequestError } from "../errors/apiErrors.js";
import { imagesService } from "../images/images.service.js";
import type { RequestIdentity } from "../types/index.js";
import { ownerKey } from "../middlewares/ownerKey.js";
import { assertCanAccessPaths } from "../middlewares/pathOwnership.js";

class AIGenerationController {
  restyle = async (req: Request, res: Response) => {
    const user = (req as any).user as UserDTO | undefined;

    // Only restyle inputs the caller actually owns (session-owned uploads or
    // their own project images) — prevents restyling someone else's image.
    const paths = Array.isArray(req.body?.paths)
      ? (req.body.paths as string[])
      : [];
    if (paths.length > 0) {
      await assertCanAccessPaths(req, paths);
    }

    const identity: RequestIdentity = user
      ? { type: "user", id: user.id }
      : { type: "guest", id: req.ip ?? "unknown_ip" };

    const result = await aiGenerationService.restyle(
      identity,
      req.body,
      ownerKey(req),
    );
    res.json(result);
  };

  getJobById = async (req: Request, res: Response) => {
    const jobId = req.params.jobId as string;
    if (!jobId) throw new BadRequestError("Job Id is required");

    const job = await jobService.getJob(jobId);
    // Don't reveal existence of jobs the caller doesn't own.
    if (!job || job.owner !== ownerKey(req)) {
      return res.status(404).json({ message: "Job not found" });
    }

    res.json(job);
  };

  getJobs = async (req: Request, res: Response) => {
    const jobIds = req.body as string[];
    const ids = req.query.ids as string;
    const createSignedUrls = req.query.signed_urls === "true";
    if (!jobIds && !ids) throw new BadRequestError("Jobs Ids is required");

    const normalizedIds = ids ? ids.split(",") : jobIds;
    const requester = ownerKey(req);

    const fetched = await Promise.all(
      normalizedIds.map((job) => jobService.getJob(job)),
    );

    // Null out any job the requester doesn't own BEFORE signing any URLs.
    const results = fetched.map((j) =>
      j && j.owner === requester ? j : null,
    );

    if (createSignedUrls) {
      const originalPaths = results.map((j) =>
        j && j.input && j.status === "completed"
          ? (j.input.path as string)
          : null,
      );
      const restyledPaths = results.map((j) =>
        j && j.result && j.status === "completed"
          ? (j.result.path as string)
          : null,
      );
      const originalUrls = await imagesService.createSignedUrls(
        originalPaths as string[],
      );
      const restyledUrls = await imagesService.createSignedUrls(
        restyledPaths as string[],
      );

      results.forEach((j, i) => {
        if (j) {
          j.input.url = originalUrls[i];
          if (j.result) j.result.url = restyledUrls[i];
        }
      });
    }

    res.json(results);
  };
}

export const aiGenerationController = new AIGenerationController();
