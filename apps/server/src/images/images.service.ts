import { supabaseAdmin } from "../lib/supabase.js";
import { v4 as uuidv4 } from "uuid";
import { environment } from "../config/environment.js";
import { BadRequestError, NotFoundError } from "../errors/apiErrors.js";
import { MAX_FILE_SIZE } from "../constants.js";
import type {
  GeneratedImage,
  UploadBufferParams,
  UploadedImage,
} from "../types/index.js";
import { ApiError } from "shared";
import sharp from "sharp";
import { safeFetchBuffer } from "../lib/net-guard.js";

const BUCKET = environment.SUPABASE_BUCKET_NAME;

class ImagesService {
  public getThumbPath(path: string): string {
    const parts = path.split(".");
    if (parts.length > 1) {
      const ext = parts.pop();
      return `${parts.join(".")}_thumb.${ext}`;
    }
    return `${path}_thumb`;
  }

  async uploadTemporaryImages(
    files: Express.Multer.File[],
    tmpIds: string[],
  ): Promise<UploadedImage[]> {
    this.validateFiles(files);

    const results: UploadedImage[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i]!;
      const tmpId = tmpIds[i]!;
      const id = uuidv4();
      const path = this.generateFilePath("tmp", id, file.mimetype);

      const metadata = await sharp(file.buffer).metadata();

      const thumbBuffer = await sharp(file.buffer)
        .resize({ width: 800, withoutEnlargement: true })
        .toBuffer();

      await this.uploadBuffer({
        buffer: file.buffer,
        mimeType: file.mimetype,
        path,
      });

      await this.uploadBuffer({
        buffer: thumbBuffer,
        mimeType: file.mimetype,
        path: this.getThumbPath(path),
      });

      const url = await this.createSignedUrl(path, 300);
      results.push({
        tmpId,
        id,
        path,
        url,
        width: metadata.width,
        height: metadata.height,
      } as any);
    }

    return results;
  }

  async uploadImagesByUrls(urls: string[]): Promise<UploadedImage[]> {
    const results: UploadedImage[] = [];

    for (const url of urls) {
      // SSRF-guarded: validates scheme/host, blocks private/internal targets,
      // follows redirects safely, enforces a timeout and the size cap.
      const { buffer, contentType } = await safeFetchBuffer(url, {
        maxBytes: MAX_FILE_SIZE,
      });

      if (!contentType || !contentType.startsWith("image/")) {
        throw new BadRequestError("Invalid image content-type");
      }

      const id = uuidv4();
      const path = this.generateFilePath("tmp", id, contentType);

      const metadata = await sharp(buffer).metadata();

      const thumbBuffer = await sharp(buffer)
        .resize({ width: 800, withoutEnlargement: true })
        .toBuffer();

      await this.uploadBuffer({
        buffer,
        mimeType: contentType,
        path,
      });

      await this.uploadBuffer({
        buffer: thumbBuffer,
        mimeType: contentType,
        path: this.getThumbPath(path),
      });

      const signedUrl = await this.createSignedUrl(path, 300);

      results.push({
        id,
        tmpId: "",
        path,
        url: signedUrl,
        width: metadata.width,
        height: metadata.height,
      } as any);
    }

    return results;
  }

  async uploadAvatarImage(file: Express.Multer.File): Promise<{ url: string; path: string }> {
    if (!file) throw new BadRequestError("No file provided");
    if (!file.mimetype.startsWith("image/")) {
      throw new BadRequestError(`Invalid file type: ${file.mimetype}. Only images are allowed`);
    }
    if (file.size > MAX_FILE_SIZE) {
      throw new BadRequestError("File exceeds maximum size");
    }

    const id = uuidv4();
    const ext = file.mimetype.split("/")[1];
    const path = `avatars/${id}.${ext}`;

    const optimizedBuffer = await sharp(file.buffer)
      .resize({ width: 400, height: 400, fit: "cover" })
      .toBuffer();

    await this.uploadBuffer({
      buffer: optimizedBuffer,
      mimeType: file.mimetype,
      path,
    });

    const url = this.getPublicUrl(path);

    return { url, path };
  }

  async uploadGeneratedImage(params: {
    buffer: Buffer;
    mimeType: string;
  }): Promise<GeneratedImage> {
    const id = uuidv4();
    const path = this.generateFilePath("generated", id, params.mimeType);

    const metadata = await sharp(params.buffer).metadata();

    const thumbBuffer = await sharp(params.buffer)
      .resize({ width: 800, withoutEnlargement: true })
      .toBuffer();

    await this.uploadBuffer({
      buffer: params.buffer,
      mimeType: params.mimeType,
      path,
    });

    await this.uploadBuffer({
      buffer: thumbBuffer,
      mimeType: params.mimeType,
      path: this.getThumbPath(path),
    });

    return { 
      id, 
      path,
      width: metadata.width,
      height: metadata.height,
    } as any;
  }

  async downloadImage(path: string): Promise<Blob> {
    const { data, error } = await supabaseAdmin.storage
      .from(BUCKET)
      .download(path);

    if (error) {
      console.error(error);
      throw new ApiError("Failed to download image", 500);
    }

    return data;
  }

  async createSignedUrls(paths: string[], expires = 60 * 10) {
    const { data, error } = await supabaseAdmin.storage
      .from(BUCKET)
      .createSignedUrls(paths, expires);

    if (error || !data) {
      console.error(error);
      throw new ApiError("Failed to create signed urls", 500);
    }

    return data.map((item) => {
      return item.signedUrl ?? null;
    });
  }

  async createSignedUrl(path: string, expires = 60 * 10): Promise<string> {
    const { data, error } = await supabaseAdmin.storage
      .from(BUCKET)
      .createSignedUrl(path, expires);

    if (error || !data?.signedUrl) {
      console.error(error);
      throw new ApiError(`Failed to create signed url for path ${path}`, 500);
    }

    return data.signedUrl;
  }

  async existImage(path: string) {
    const { data } = await supabaseAdmin.storage.from(BUCKET).exists(path);
    return data;
  }

  async existImageOrThrow(path: string) {
    const exist = await this.existImage(path);
    if (!exist) throw new NotFoundError(`Image not found by path ${path}`);
  }

  async deleteImages(paths: string[]) {
    const allPaths = [
      ...paths,
      ...paths.map((p) => this.getThumbPath(p)),
    ];

    const { error } = await supabaseAdmin.storage.from(BUCKET).remove(allPaths);

    if (error) {
      console.error(error);
      throw new ApiError(`Failed to delete images for paths ${paths}`, 500);
    }
  }

  async moveImageToProject(sourcePath: string, projectId: string) {
    let targetDirectory = "";

    if (sourcePath.startsWith("tmp/")) {
      targetDirectory = "original";
    } else if (sourcePath.startsWith("generated/")) {
      targetDirectory = "generated";
    } else {
      throw new BadRequestError("Image must be in either 'tmp' or 'generated' directory");
    }

    const fileName = sourcePath.split("/").pop();
    const newPath = `${targetDirectory}/${projectId}/${fileName}`;

    const { error } = await supabaseAdmin.storage
      .from(BUCKET)
      .move(sourcePath, newPath);

    if (error) {
      console.error(error);
      throw new ApiError(`Failed to move image to ${targetDirectory} project folder: ${sourcePath}`, 500);
    }

    await supabaseAdmin.storage
      .from(BUCKET)
      .move(this.getThumbPath(sourcePath), this.getThumbPath(newPath));

    return newPath;
  }

  // =======================
  // Private helpers
  // =======================

  private validateFiles(files?: Express.Multer.File[]) {
    if (!files || files.length === 0) {
      throw new ApiError("No files uploaded", 400);
    }

    for (const file of files) {
      if (!file.mimetype.startsWith("image/")) {
        throw new ApiError(
          `Invalid file type: ${file.mimetype}. Only images are allowed`,
          400,
        );
      }

      if (file.size > MAX_FILE_SIZE) {
        throw new ApiError(
          `File "${file.originalname}" exceeds size limit`,
          400,
        );
      }
    }
  }

  private generateFilePath(
    folder: "tmp" | "generated",
    id: string,
    mimeType: string,
  ): string {
    const ext = mimeType.split("/")[1];
    return `${folder}/${id}.${ext}`;
  }

  private async uploadBuffer({
    buffer,
    mimeType,
    path,
  }: UploadBufferParams): Promise<void> {
    const { error } = await supabaseAdmin.storage
      .from(BUCKET)
      .upload(path, buffer, {
        contentType: mimeType,
        upsert: false,
      });

    if (error) {
      console.error(error);
      throw new ApiError(`Failed to upload image for path ${path}`, 500);
    }
  }

  public getPublicUrl(filePath: string): string {
    const { data } = supabaseAdmin.storage.from(BUCKET).getPublicUrl(filePath);
    return data.publicUrl;
  }
}

export const imagesService = new ImagesService();
