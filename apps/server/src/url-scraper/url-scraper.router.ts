import { Router, type Router as ExpressRouter } from "express";
import { urlScraperController } from "./url-scraper.controller.js";
import { scrapeLimiter } from "../middlewares/rateLimiters.js";

const urlScraperRouter: ExpressRouter = Router();

urlScraperRouter.post("/scrape-url", scrapeLimiter, urlScraperController.scrapeUrl);

export default urlScraperRouter;
