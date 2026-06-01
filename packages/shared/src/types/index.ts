import { MODELS, StylePresetEnum } from "../constants/index.js";

export type Model = (typeof MODELS)[number];
export type StylePreset = (typeof StylePresetEnum)[number];

export type JobStatus =
  | "pending"
  | "completed"
  | "failed"
  | "failed_final"
  | "completed_with_errors";

export type Job<T = any> = {
  id: string;
  status: JobStatus;
  owner?: string; // ownership key: "user:<id>" | "guest:<sessionId>" — scopes reads
  input: any; // data transferred for generation (images, prompts, etc.)
  result?: T; // generation result (URL, base64, etc.)
  error?: string;
  createdAt: string;
  updatedAt: string;
};

export type UpdateJob<T = any> = Partial<
  Pick<Job<T>, "status" | "result" | "error">
>;
