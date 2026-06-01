import { Router, type Router as ExpressRouter } from "express";
import { imagesController } from "./images.controller.js";
import { uploadImagesMulter } from "../middlewares/multerMiddleware.js";
import { requireAuth } from "../middlewares/requireAuth.js";
import { scrapeLimiter } from "../middlewares/rateLimiters.js";

const imagesRouter: ExpressRouter = Router();

// Uploads are allowed for guests (pre-signup flow); produced paths are recorded
// on the session so the caller can later sign/download only their own assets.
imagesRouter.post(
  "/upload",
  uploadImagesMulter.array("images"),
  imagesController.uploadImages,
);

// Server-side fetch of user URLs — SSRF-guarded in the service + rate limited.
imagesRouter.post(
  "/upload-by-urls",
  scrapeLimiter,
  imagesController.uploadImagesByUrls,
);

// Avatars only make sense for a logged-in account.
imagesRouter.post(
  "/upload-avatar",
  requireAuth,
  uploadImagesMulter.single("file"),
  imagesController.uploadAvatar,
);

// Signed-URL / download / tmp-delete enforce path ownership in the controller
// (session-owned paths, or project paths owned by the authenticated user).
imagesRouter.get("/signed", imagesController.getSignedImageUrls);
imagesRouter.get("/download", imagesController.downloadImages);
imagesRouter.delete("/uploaded-tmp", imagesController.deleteUploadedTmpImage);

export default imagesRouter;
