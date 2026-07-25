import path from "node:path";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import type { GenerateVideoResult, ResolvedTask } from "../types";

const DEFAULT_MODEL = "grok-imagine-video-1.5-preview";
const DISPLAY_MODEL = "grok-video-3.5";
const DEFAULT_SECONDS = "6";
const DEFAULT_AR = "16:9";
const DEFAULT_RESOLUTION = "720p";

const MODEL_ALIASES: Record<string, string> = {
  "grok-video-3.5": DEFAULT_MODEL,
  "grok-video-3.5-preview": DEFAULT_MODEL,
  "grok-imagine-video": DEFAULT_MODEL,
  "grok-imagine-video-1.5": DEFAULT_MODEL,
  "grok-imagine-video-1.5-preview": DEFAULT_MODEL,
  grok: DEFAULT_MODEL,
};

const SUPPORTED_AR = new Set(["16:9", "9:16", "1:1", "3:2", "2:3"]);
const SUPPORTED_RESOLUTION = new Set(["480p", "720p"]);

type CreateResponse = {
  task_id?: string | number;
  id?: string | number;
  error?: string;
  message?: string;
};

type StatusResponse = {
  task_id?: string | number;
  state?: "pending" | "running" | "success" | "failed" | string;
  status?: string;
  status_group?: string;
  is_final?: boolean;
  progress?: string;
  result_url?: string;
  result_type?: string;
  error?: string;
  cost?: number;
};

export function getDefaultModel(): string {
  return process.env.LK888_VIDEO_MODEL || process.env.SHULIU_VIDEO_MODEL || DEFAULT_MODEL;
}

export function resolveModel(model: string | null): string {
  const raw = (model || getDefaultModel()).trim();
  return MODEL_ALIASES[raw.toLowerCase()] || raw;
}

function getBaseUrl(): string {
  return (process.env.LK888_BASE_URL || "https://api.lk888.ai").replace(/\/+$/g, "");
}

function getApiKey(): string {
  const key = process.env.LK888_API_KEY;
  if (!key) {
    throw new Error(
      "LK888_API_KEY is not set. Export it or put it in .shuliu-skills/.env / ~/.shuliu-skills/.env"
    );
  }
  return key;
}

export function validateTask(task: ResolvedTask): void {
  if (task.refs.length !== 1) {
    throw new Error(
      "lk888 grok-video is image-to-video only: pass exactly one --ref <image> (URL or local path)."
    );
  }
  if (task.videos.length || task.audios.length) {
    throw new Error("lk888 does not support reference video/audio.");
  }
  const seconds = Number(task.seconds);
  if (!Number.isFinite(seconds) || seconds < 1 || seconds > 15) {
    throw new Error(`lk888 duration must be 1-15 seconds, got: ${task.seconds}`);
  }
  const ar = task.aspectRatio || DEFAULT_AR;
  if (!SUPPORTED_AR.has(ar)) {
    throw new Error(`lk888 --ar must be one of: ${Array.from(SUPPORTED_AR).join(", ")}`);
  }
  const resolution = (task.resolution || DEFAULT_RESOLUTION).toLowerCase();
  if (!SUPPORTED_RESOLUTION.has(resolution)) {
    throw new Error(`lk888 --resolution must be 480p or 720p`);
  }
}

function mimeFromPath(p: string): string {
  const ext = path.extname(p).toLowerCase();
  if (ext === ".jpg" || ext === ".jpeg") return "image/jpeg";
  if (ext === ".webp") return "image/webp";
  if (ext === ".gif") return "image/gif";
  return "image/png";
}

async function normalizeImageInput(ref: string): Promise<string> {
  if (ref.startsWith("http://") || ref.startsWith("https://") || ref.startsWith("data:")) {
    return ref;
  }
  const full = path.resolve(ref);
  const data = await readFile(full);
  const mime = mimeFromPath(full);
  if (data.byteLength > 10 * 1024 * 1024) {
    throw new Error(`lk888 base64 image must be <= 10MB after decode (got ${data.byteLength} bytes)`);
  }
  return `data:${mime};base64,${data.toString("base64")}`;
}

export async function createVideoTask(task: ResolvedTask): Promise<{ taskId: string; raw: CreateResponse }> {
  const apiKey = getApiKey();
  const url = `${getBaseUrl()}/v1/media/generate`;
  const image = await normalizeImageInput(task.refs[0]!);

  const body: Record<string, unknown> = {
    model: task.model,
    prompt: task.prompt,
    params: {
      images: [image],
      aspect_ratio: task.aspectRatio || DEFAULT_AR,
      resolution: (task.resolution || DEFAULT_RESOLUTION).toLowerCase(),
      duration: String(task.seconds || DEFAULT_SECONDS),
    },
  };
  if (task.notifyUrl) body.notify_url = task.notifyUrl;

  const res = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  const text = await res.text();
  let parsed: CreateResponse;
  try {
    parsed = JSON.parse(text) as CreateResponse;
  } catch {
    throw new Error(`lk888 create failed: ${res.status} ${res.statusText} - ${text}`);
  }
  if (!res.ok) throw new Error(`lk888 create failed: ${res.status} ${res.statusText} - ${text}`);
  const taskId = parsed.task_id ?? parsed.id;
  if (taskId === undefined || taskId === null || taskId === "") {
    throw new Error(`lk888 create response missing task_id: ${text}`);
  }
  return { taskId: String(taskId), raw: parsed };
}

export async function getTaskStatus(taskId: string): Promise<StatusResponse> {
  const apiKey = getApiKey();
  const url = `${getBaseUrl()}/v1/media/status?task_id=${encodeURIComponent(taskId)}`;
  const res = await fetch(url, {
    method: "GET",
    headers: { Authorization: `Bearer ${apiKey}` },
  });
  const text = await res.text();
  let parsed: StatusResponse;
  try {
    parsed = JSON.parse(text) as StatusResponse;
  } catch {
    throw new Error(`lk888 status failed: ${res.status} ${res.statusText} - ${text}`);
  }
  if (!res.ok) throw new Error(`lk888 status failed: ${res.status} ${res.statusText} - ${text}`);
  return parsed;
}

export async function downloadVideo(url: string): Promise<Uint8Array> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to download video: ${res.status} ${res.statusText}`);
  return new Uint8Array(await res.arrayBuffer());
}

export async function generateVideo(
  task: ResolvedTask,
  opts: { poll: number; timeout: number; json: boolean }
): Promise<GenerateVideoResult> {
  validateTask(task);
  const resolved: ResolvedTask = {
    ...task,
    seconds: task.seconds || DEFAULT_SECONDS,
    aspectRatio: task.aspectRatio || DEFAULT_AR,
    resolution: (task.resolution || DEFAULT_RESOLUTION).toLowerCase(),
    model: resolveModel(task.model),
  };

  const { taskId } = await createVideoTask(resolved);
  if (!opts.json) {
    console.log(`Using lk888 / ${resolved.model} (display: ${DISPLAY_MODEL})`);
    console.log(`Task created: ${taskId}`);
  }

  const started = Date.now();
  let lastProgress = "";

  while (true) {
    if (Date.now() - started > opts.timeout) {
      throw new Error(`lk888 task timed out after ${opts.timeout}ms (task_id=${taskId})`);
    }

    const status = await getTaskStatus(taskId);
    const progress = status.progress || "";

    if (!opts.json) {
      if (progress && progress !== lastProgress) {
        lastProgress = progress;
        console.log(`state=${status.state ?? "?"} progress=${progress}`);
      } else {
        process.stdout.write(`state=${status.state ?? "?"} progress=${progress || "?"} \r`);
      }
    }

    if (status.is_final === true) {
      if (status.state === "success") {
        const resultUrl = status.result_url;
        if (!resultUrl) {
          throw new Error(`lk888 success but missing result_url: ${JSON.stringify(status)}`);
        }
        if (!opts.json) console.log(`\nDownloading video from ${resultUrl}...`);
        const videoData = await downloadVideo(resultUrl);
        const out = path.resolve(resolved.outputPath);
        await mkdir(path.dirname(out), { recursive: true });
        await writeFile(out, videoData);
        return {
          provider: "lk888",
          model: resolved.model,
          taskId,
          resultUrl,
          savedVideo: out,
          progress: progress || "100%",
          raw: status,
        };
      }
      if (status.state === "failed") {
        throw new Error(
          `lk888 generation failed (task_id=${taskId}): ${status.error || JSON.stringify(status)}`
        );
      }
      throw new Error(`lk888 reached final state without success: ${JSON.stringify(status)}`);
    }

    await new Promise((r) => setTimeout(r, opts.poll));
  }
}

export const id = "lk888" as const;
