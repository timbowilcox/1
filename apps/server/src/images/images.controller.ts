import type { Request, Response } from "express";
import { imagesService } from "./images.service.js";
import { BadRequestError } from "../errors/apiErrors.js";
import {
  rememberOwnedPaths,
  assertCanAccessPaths,
} from "../middlewares/pathOwnership.js";

class ImagesController {
  uploadImages = async (req: Request, res: Response) => {
    const files = req.files as Express.Multer.File[];
    const tmpIds = req.body.tmpIds;

    const normalizedTmpIds = Array.isArray(tmpIds) ? tmpIds : [tmpIds];

    const result = await imagesService.uploadTemporaryImages(
      files,
      normalizedTmpIds,
    );

    rememberOwnedPaths(req, result.map((r) => r.path));
    res.json(result);
  };

  uploadAvatar = async (req: Request, res: Response) => {
    const file = req.file as Express.Multer.File;

    if (!file) {
      throw new BadRequestError("Avatar file is required");
    }

    const result = await imagesService.uploadAvatarImage(file);
    rememberOwnedPaths(req, [result.path]);
    res.json(result);
  };

  uploadImagesByUrls = async (req: Request, res: Response) => {
    const urls = req.body.urls as string[];

    if (!urls || !Array.isArray(urls) || urls.length === 0) {
      throw new BadRequestError("Urls array is required");
    }

    const result = await imagesService.uploadImagesByUrls(urls);

    rememberOwnedPaths(req, result.map((r) => r.path));
    res.json(result);
  };

  getSignedImageUrls = async (req: Request, res: Response) => {
    const raw = req.query.paths as string;

    if (!raw)
      throw new BadRequestError("Paths is required for generating signed url");

    const normalized = raw.split(",");

    await assertCanAccessPaths(req, normalized);

    const result = await imagesService.createSignedUrls(normalized);
    res.json(result);
  };

  deleteUploadedTmpImage = async (req: Request, res: Response) => {
    const raw = req.query.paths as string;
    if (!raw) throw new BadRequestError("Paths is required for removing image");
    const paths = raw.split(",");

    paths.forEach((p) => {
      if (!p.startsWith("tmp/"))
        throw new BadRequestError(`The image should be temporary: ${p}`);
    });

    await assertCanAccessPaths(req, paths);

    await imagesService.deleteImages(paths);
    res.status(204).end();
  };

  downloadImages = async (req: Request, res: Response) => {
    const path = req.query.path;

    if (!path || typeof path !== "string") {
      throw new BadRequestError("Image path is required");
    }

    await assertCanAccessPaths(req, [path]);

    const blob = await imagesService.downloadImage(path);
    const arrayBuffer = await blob.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const filename = path.split("/").pop() || "downloaded-image.jpg";

    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
    res.setHeader("Content-Type", blob.type || "application/octet-stream");
    res.send(buffer);
  };
}

export const imagesController = new ImagesController();
