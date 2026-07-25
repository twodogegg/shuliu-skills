export type Provider = "pidoi" | "lk888";

/** Seedance / pidoi reference_mode for first-frame / start-end. */
export type ReferenceMode = "auto" | "start_frame" | "start_end";

export type CliArgs = {
  prompt: string | null;
  promptFiles: string[];
  /**
   * Reference images (local path, public URL, or data URI).
   * First entry is also treated as primary image_url when needed.
   * Legacy: single --ref / --image appends here.
   */
  refs: string[];
  /** Reference videos (URL or local path that will be rejected unless URL — local video not uploaded as base64 by default for size). */
  videos: string[];
  /** Reference audios (URL preferred). */
  audios: string[];
  referenceMode: ReferenceMode | null;
  output: string | null;
  provider: Provider | null;
  model: string | null;
  /** Duration in seconds (string to preserve upstream wire format). */
  seconds: string | null;
  /** Pixel size for pidoi sora2, e.g. 1280x720 */
  size: string | null;
  /** Aspect ratio: pidoi seedance / lk888 */
  aspectRatio: string | null;
  /** Resolution: 480p | 720p */
  resolution: string | null;
  /** Optional webhook for lk888 notify_url */
  notifyUrl: string | null;
  poll: number;
  /** Max wait before giving up (ms). Default 70 minutes for long video jobs. */
  timeout: number;
  batchPath: string | null;
  concurrency: number;
  json: boolean;
  help: boolean;
};

export type BatchTaskInput = {
  prompt?: string;
  promptFile?: string;
  /** @deprecated use refs */
  ref?: string;
  image?: string;
  refs?: string[];
  images?: string[];
  videos?: string[];
  audios?: string[];
  referenceMode?: ReferenceMode;
  output?: string;
  provider?: Provider;
  model?: string;
  seconds?: string | number;
  size?: string;
  ar?: string;
  resolution?: string;
  notifyUrl?: string;
};

export type ResolvedTask = {
  prompt: string;
  refs: string[];
  videos: string[];
  audios: string[];
  referenceMode: ReferenceMode | null;
  outputPath: string;
  provider: Provider;
  model: string;
  seconds: string;
  size: string | null;
  aspectRatio: string | null;
  resolution: string | null;
  notifyUrl: string | null;
};

export type GenerateVideoResult = {
  provider: Provider;
  model: string;
  taskId: string;
  resultUrl: string;
  savedVideo: string;
  progress?: string;
  raw?: unknown;
};

export type ProviderModule = {
  id: Provider;
  getDefaultModel: () => string;
  resolveModel: (model: string | null) => string;
  generateVideo: (
    task: ResolvedTask,
    opts: { poll: number; timeout: number; json: boolean }
  ) => Promise<GenerateVideoResult>;
  validateTask?: (task: ResolvedTask) => void;
};
