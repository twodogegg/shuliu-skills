import path from "node:path";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import type { GenerateVideoResult, ReferenceMode, ResolvedTask } from "../types";

/** Classic OpenAI-style sora2 image-to-video (multipart). */
const SORA2_DEFAULT = "sora2";
const SORA2_SIZE = "1280x720";
const SORA2_SECONDS = "4";

/** Seedance special-channel default (JSON, multi-ref). */
const SEEDANCE_DEFAULT = "sora-v3-933-pro";

const SORA2_ALIASES: Record<string, string> = {
  sora2: "sora2",
  "sora-2": "sora2",
  "sora-2-pro": "sora2",
  "sora2-pro": "sora2",
};

/** Known Seedance special-channel model ids (model name encodes capacity + tier + res). */
export const SEEDANCE_MODELS = [
  "sora-431-720P",
  "sora-431-fast-480p",
  "sora-431-fast-720p",
  "sora-v3-933-fast",
  "sora-v3-933-pro",
] as const;

export type SeedanceModel = (typeof SEEDANCE_MODELS)[number];

export type ModelFamily = "sora2" | "seedance";

export type SeedanceSpec = {
  family: "seedance";
  model: string;
  code: "431" | "933" | "unknown";
  maxImages: number;
  maxVideos: number;
  maxAudios: number;
  maxFilesTotal: number;
  resolutionHint: "480p" | "720p" | null;
  tier: "fast" | "pro" | "full" | "unknown";
  allowedSeconds: string[];
};

type CreateResponse = {
  id?: string;
  task_id?: string;
  status?: string;
  model?: string;
  progress?: number;
  video_url?: string;
  seconds?: string;
  size?: string;
  failure_reason?: string;
  error?: string;
};

type GenerationsEnvelope = {
  code?: string;
  message?: string;
  data?: {
    task_id?: string;
    status?: string;
    progress?: string | number;
    result_url?: string;
    error?: string;
    data?: {
      model?: string;
      status?: string;
      progress?: number;
      video_url?: string;
    };
  };
};

type VideoStatus = CreateResponse & {
  status?: string;
  progress?: number | string;
  video_url?: string;
  failure_reason?: string;
  error?: string;
};

export function getDefaultModel(): string {
  return process.env.PIDOI_VIDEO_MODEL || process.env.SHULIU_VIDEO_MODEL || SORA2_DEFAULT;
}

export function resolveModel(model: string | null): string {
  const raw = (model || getDefaultModel()).trim();
  const lower = raw.toLowerCase();
  if (SORA2_ALIASES[lower]) return SORA2_ALIASES[lower];
  // Preserve original casing for seedance ids like sora-431-720P
  const known = SEEDANCE_MODELS.find((m) => m.toLowerCase() === lower);
  return known || raw;
}

export function detectFamily(model: string): ModelFamily {
  const m = model.toLowerCase();
  if (m === "sora2" || m === "sora-2") return "sora2";
  if (m.includes("431") || m.includes("933") || m.startsWith("sora-v3") || m.startsWith("sora-431")) {
    return "seedance";
  }
  // Heuristic: anything with sora- prefix that is not sora2 → seedance-style JSON
  if (m.startsWith("sora-") && m !== "sora-2" && m !== "sora-2-pro") return "seedance";
  return "sora2";
}

export function parseSeedanceSpec(model: string): SeedanceSpec {
  const m = model.toLowerCase();
  const code: SeedanceSpec["code"] = m.includes("933") ? "933" : m.includes("431") ? "431" : "unknown";
  const maxImages = code === "933" ? 9 : code === "431" ? 4 : 9;
  const maxVideos = 3;
  const maxAudios = code === "933" ? 3 : code === "431" ? 1 : 3;
  let resolutionHint: SeedanceSpec["resolutionHint"] = null;
  if (m.includes("480")) resolutionHint = "480p";
  else if (m.includes("720")) resolutionHint = "720p";
  let tier: SeedanceSpec["tier"] = "unknown";
  if (m.includes("fast")) tier = "fast";
  else if (m.includes("pro")) tier = "pro";
  else if (code === "431" && !m.includes("fast")) tier = "full";
  return {
    family: "seedance",
    model,
    code,
    maxImages,
    maxVideos,
    maxAudios,
    maxFilesTotal: 15,
    resolutionHint,
    tier,
    allowedSeconds: ["10", "15"],
  };
}

function getBaseUrl(): string {
  return (process.env.PIDOI_BASE_URL || "https://pidoi.com").replace(/\/+$/g, "");
}

function getApiKey(): string {
  const key = process.env.PIDOI_API_KEY;
  if (!key) {
    throw new Error(
      "PIDOI_API_KEY is not set. Export it or put it in .shuliu-skills/.env / ~/.shuliu-skills/.env"
    );
  }
  return key;
}

function mimeFromPath(p: string): string {
  const ext = path.extname(p).toLowerCase();
  if (ext === ".jpg" || ext === ".jpeg") return "image/jpeg";
  if (ext === ".webp") return "image/webp";
  if (ext === ".gif") return "image/gif";
  return "image/png";
}

/** Normalize local image path → data URI; pass through URL / data URI. */
export async function toImageDataOrUrl(ref: string): Promise<string> {
  if (ref.startsWith("http://") || ref.startsWith("https://") || ref.startsWith("data:")) {
    return ref;
  }
  // pure base64 without prefix — pass through (seedance accepts raw base64)
  if (/^[A-Za-z0-9+/=\s]+$/.test(ref) && ref.replace(/\s/g, "").length > 200 && !ref.includes("/") && !ref.includes(".")) {
    return ref.replace(/\s/g, "");
  }
  const full = path.resolve(ref);
  const data = await readFile(full);
  const mime = mimeFromPath(full);
  return `data:${mime};base64,${data.toString("base64")}`;
}

async function loadReferenceBlob(ref: string): Promise<{ blob: Blob; filename: string }> {
  if (ref.startsWith("http://") || ref.startsWith("https://")) {
    const res = await fetch(ref);
    if (!res.ok) throw new Error(`Failed to download reference image: ${res.status} ${res.statusText}`);
    const buf = await res.arrayBuffer();
    const contentType = res.headers.get("content-type") || "image/png";
    const filename = path.basename(new URL(ref).pathname) || "reference.png";
    return { blob: new Blob([buf], { type: contentType }), filename };
  }
  if (ref.startsWith("data:")) {
    const match = ref.match(/^data:([^;]+);base64,(.+)$/);
    if (!match) throw new Error("Invalid data URL for --ref");
    const mime = match[1]!;
    const bytes = Buffer.from(match[2]!, "base64");
    const ext = mime.includes("jpeg") || mime.includes("jpg") ? "jpg" : mime.includes("webp") ? "webp" : "png";
    return { blob: new Blob([bytes], { type: mime }), filename: `reference.${ext}` };
  }
  const full = path.resolve(ref);
  const data = await readFile(full);
  const mime = mimeFromPath(full);
  return { blob: new Blob([data], { type: mime }), filename: path.basename(full) };
}

function pickTaskId(body: CreateResponse): string {
  const id = body.task_id || body.id;
  if (!id) throw new Error(`pidoi create response missing task id: ${JSON.stringify(body)}`);
  return id;
}

export function validateTask(task: ResolvedTask): void {
  const family = detectFamily(task.model);
  if (family === "sora2") {
    if (task.refs.length === 0) {
      throw new Error("pidoi sora2 is image-to-video: pass --ref <image>.");
    }
    if (task.refs.length > 1) {
      throw new Error("pidoi sora2 only supports one input_reference image.");
    }
    if (task.videos.length || task.audios.length) {
      throw new Error("pidoi sora2 does not support reference video/audio. Use a Seedance model (sora-431-*/sora-v3-933-*).");
    }
    const seconds = Number(task.seconds);
    if (!Number.isFinite(seconds) || seconds <= 0) {
      throw new Error(`Invalid --seconds for pidoi sora2: ${task.seconds}`);
    }
    return;
  }

  // Seedance special channel
  const spec = parseSeedanceSpec(task.model);
  const seconds = String(task.seconds);
  if (!spec.allowedSeconds.includes(seconds)) {
    throw new Error(
      `Seedance model ${task.model} only supports seconds ${spec.allowedSeconds.join("/")}, got: ${seconds}`
    );
  }
  const ar = task.aspectRatio;
  const allowedAr = new Set(["16:9", "9:16", "4:3", "3:4", "1:1", "21:9"]);
  if (!ar || !allowedAr.has(ar)) {
    throw new Error(`Seedance --ar required, one of: ${Array.from(allowedAr).join(", ")}`);
  }
  const resolution = (task.resolution || spec.resolutionHint || "720p").toLowerCase();
  if (resolution !== "480p" && resolution !== "720p") {
    throw new Error(`Seedance --resolution must be 480p or 720p`);
  }
  if (spec.resolutionHint && resolution !== spec.resolutionHint) {
    throw new Error(
      `Model ${task.model} implies resolution ${spec.resolutionHint}, but got ${resolution}`
    );
  }
  if (task.refs.length > spec.maxImages) {
    throw new Error(
      `Model ${task.model} allows at most ${spec.maxImages} reference images (got ${task.refs.length})`
    );
  }
  if (task.videos.length > spec.maxVideos) {
    throw new Error(
      `Model ${task.model} allows at most ${spec.maxVideos} reference videos (got ${task.videos.length})`
    );
  }
  if (task.audios.length > spec.maxAudios) {
    throw new Error(
      `Model ${task.model} allows at most ${spec.maxAudios} reference audios (got ${task.audios.length})`
    );
  }
  const total = task.refs.length + task.videos.length + task.audios.length;
  if (total > spec.maxFilesTotal) {
    throw new Error(`Total reference files must be <= ${spec.maxFilesTotal}, got ${total}`);
  }
  if (task.audios.length > 0 && task.refs.length === 0) {
    throw new Error("Audio reference requires at least one reference image.");
  }
  const mode = task.referenceMode;
  if (mode === "start_frame" && task.refs.length !== 1) {
    throw new Error("reference_mode=start_frame requires exactly 1 image.");
  }
  if (mode === "start_end" && task.refs.length !== 2) {
    throw new Error("reference_mode=start_end requires exactly 2 images.");
  }
  if (mode === "start_end" && task.videos.length > 0) {
    throw new Error("reference_mode=start_end cannot be combined with reference videos.");
  }
  // Local video/audio paths are not auto-uploaded (only URLs) — validate later at request build
}

// ─── sora2 multipart path ───────────────────────────────────────────

async function createSora2Task(task: ResolvedTask): Promise<{ taskId: string; raw: CreateResponse }> {
  const apiKey = getApiKey();
  const url = `${getBaseUrl()}/v1/videos`;
  const form = new FormData();
  form.append("model", task.model);
  form.append("prompt", task.prompt);
  form.append("seconds", task.seconds || SORA2_SECONDS);
  form.append("size", task.size || SORA2_SIZE);
  const { blob, filename } = await loadReferenceBlob(task.refs[0]!);
  form.append("input_reference", blob, filename);

  const res = await fetch(url, {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}` },
    body: form,
  });
  const text = await res.text();
  let body: CreateResponse;
  try {
    body = JSON.parse(text) as CreateResponse;
  } catch {
    throw new Error(`pidoi sora2 create failed: ${res.status} ${res.statusText} - ${text}`);
  }
  if (!res.ok) throw new Error(`pidoi sora2 create failed: ${res.status} ${res.statusText} - ${text}`);
  return { taskId: pickTaskId(body), raw: body };
}

async function getGenerationStatus(taskId: string): Promise<GenerationsEnvelope> {
  const apiKey = getApiKey();
  const url = `${getBaseUrl()}/v1/video/generations/${encodeURIComponent(taskId)}`;
  const res = await fetch(url, {
    method: "GET",
    headers: { Authorization: `Bearer ${apiKey}` },
  });
  const text = await res.text();
  let body: GenerationsEnvelope;
  try {
    body = JSON.parse(text) as GenerationsEnvelope;
  } catch {
    throw new Error(`pidoi generations status failed: ${res.status} ${res.statusText} - ${text}`);
  }
  if (!res.ok) throw new Error(`pidoi generations status failed: ${res.status} ${res.statusText} - ${text}`);
  return body;
}

function sora2Success(outer?: string, inner?: string): boolean {
  return outer === "SUCCESS" || inner === "completed";
}
function sora2Failed(outer?: string, inner?: string): boolean {
  return outer === "FAILED" || outer === "FAIL" || inner === "failed";
}

// ─── Seedance JSON path ─────────────────────────────────────────────

function assertRemoteMediaUrl(kind: string, value: string): void {
  if (value.startsWith("http://") || value.startsWith("https://") || value.startsWith("data:")) return;
  // local path
  throw new Error(
    `${kind} must be a public HTTP(S) URL (or data URI for images). Local path not auto-uploaded: ${value}`
  );
}

async function buildSeedanceBody(task: ResolvedTask): Promise<Record<string, unknown>> {
  const spec = parseSeedanceSpec(task.model);
  const resolution = (task.resolution || spec.resolutionHint || "720p").toLowerCase();
  const body: Record<string, unknown> = {
    model: task.model,
    prompt: task.prompt,
    aspect_ratio: task.aspectRatio,
    resolution,
    seconds: String(task.seconds),
  };

  const images = await Promise.all(task.refs.map((r) => toImageDataOrUrl(r)));
  if (images.length === 1) {
    body.image_url = images[0];
  } else if (images.length > 1) {
    // Prefer first as image_url + rest as reference_image_urls when start_frame uses single;
    // for multi-ref / start_end put all in reference_image_urls (docs show both patterns).
    if (task.referenceMode === "start_frame") {
      body.image_url = images[0];
    } else if (task.referenceMode === "start_end") {
      body.reference_image_urls = images;
    } else {
      body.image_url = images[0];
      body.reference_image_urls = images.slice(1);
    }
  }

  if (task.videos.length === 1) {
    assertRemoteMediaUrl("reference_video", task.videos[0]!);
    body.reference_video = task.videos[0];
  } else if (task.videos.length > 1) {
    for (const v of task.videos) assertRemoteMediaUrl("reference_videos", v);
    body.reference_videos = task.videos;
  }

  if (task.audios.length === 1) {
    assertRemoteMediaUrl("audio_url", task.audios[0]!);
    body.audio_url = task.audios[0];
  } else if (task.audios.length > 1) {
    for (const a of task.audios) assertRemoteMediaUrl("audio_urls", a);
    body.audio_urls = task.audios;
  }

  if (task.referenceMode && task.referenceMode !== "auto") {
    body.video_config = { reference_mode: task.referenceMode as ReferenceMode };
  } else if (task.referenceMode === "auto") {
    body.video_config = { reference_mode: "auto" };
  }

  return body;
}

async function createSeedanceTask(task: ResolvedTask): Promise<{ taskId: string; raw: CreateResponse }> {
  const apiKey = getApiKey();
  const url = `${getBaseUrl()}/v1/videos`;
  const payload = await buildSeedanceBody(task);
  const res = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });
  const text = await res.text();
  let body: CreateResponse;
  try {
    body = JSON.parse(text) as CreateResponse;
  } catch {
    throw new Error(`pidoi seedance create failed: ${res.status} ${res.statusText} - ${text}`);
  }
  if (!res.ok) throw new Error(`pidoi seedance create failed: ${res.status} ${res.statusText} - ${text}`);
  return { taskId: pickTaskId(body), raw: body };
}

async function getVideoStatus(taskId: string): Promise<VideoStatus> {
  const apiKey = getApiKey();
  const url = `${getBaseUrl()}/v1/videos/${encodeURIComponent(taskId)}`;
  const res = await fetch(url, {
    method: "GET",
    headers: { Authorization: `Bearer ${apiKey}` },
  });
  const text = await res.text();
  let body: VideoStatus;
  try {
    body = JSON.parse(text) as VideoStatus;
  } catch {
    throw new Error(`pidoi video status failed: ${res.status} ${res.statusText} - ${text}`);
  }
  if (!res.ok) throw new Error(`pidoi video status failed: ${res.status} ${res.statusText} - ${text}`);
  return body;
}

function seedanceSuccess(status?: string): boolean {
  const s = (status || "").toLowerCase();
  return s === "completed" || s === "success";
}
function seedanceFailed(status?: string): boolean {
  const s = (status || "").toLowerCase();
  return s === "failed" || s === "fail" || s === "error";
}
function seedanceRunning(status?: string): boolean {
  const s = (status || "").toLowerCase();
  return s === "queued" || s === "processing" || s === "in_progress" || s === "pending" || s === "";
}

export async function downloadVideo(url: string, withAuth = false): Promise<Uint8Array> {
  const headers: Record<string, string> = {};
  if (withAuth || url.includes("/v1/videos/") || url.includes("pidoi.com")) {
    headers.Authorization = `Bearer ${getApiKey()}`;
  }
  const res = await fetch(url, { headers });
  if (!res.ok) throw new Error(`Failed to download video: ${res.status} ${res.statusText}`);
  return new Uint8Array(await res.arrayBuffer());
}

async function saveOutput(outputPath: string, data: Uint8Array): Promise<string> {
  const out = path.resolve(outputPath);
  await mkdir(path.dirname(out), { recursive: true });
  await writeFile(out, data);
  return out;
}

async function generateSora2(
  task: ResolvedTask,
  opts: { poll: number; timeout: number; json: boolean }
): Promise<GenerateVideoResult> {
  const resolved: ResolvedTask = {
    ...task,
    seconds: task.seconds || SORA2_SECONDS,
    size: task.size || SORA2_SIZE,
  };
  const { taskId } = await createSora2Task(resolved);
  if (!opts.json) {
    console.log(`Using pidoi / ${resolved.model} (sora2 multipart)`);
    console.log(`Task created: ${taskId}`);
  }

  const started = Date.now();
  let lastProgress = "";

  while (true) {
    if (Date.now() - started > opts.timeout) {
      throw new Error(`pidoi sora2 timed out after ${opts.timeout}ms (task_id=${taskId})`);
    }
    const status = await getGenerationStatus(taskId);
    const outer = status.data?.status;
    const inner = status.data?.data?.status;
    const progress =
      status.data?.progress !== undefined && status.data?.progress !== null && status.data?.progress !== ""
        ? String(status.data.progress)
        : status.data?.data?.progress !== undefined
          ? `${status.data.data.progress}%`
          : "";

    if (!opts.json && progress && progress !== lastProgress) {
      lastProgress = progress;
      console.log(`status=${outer ?? "?"} inner=${inner ?? "?"} progress=${progress}`);
    } else if (!opts.json) {
      process.stdout.write(`status=${outer ?? "?"} inner=${inner ?? "?"} \r`);
    }

    if (sora2Success(outer, inner)) {
      const resultUrl = status.data?.result_url || status.data?.data?.video_url;
      if (!resultUrl) throw new Error(`pidoi sora2 success but missing result_url: ${JSON.stringify(status)}`);
      if (!opts.json) console.log(`\nDownloading video from ${resultUrl}...`);
      const videoData = await downloadVideo(resultUrl, false);
      const saved = await saveOutput(resolved.outputPath, videoData);
      return {
        provider: "pidoi",
        model: resolved.model,
        taskId,
        resultUrl,
        savedVideo: saved,
        progress: progress || "100%",
        raw: status,
      };
    }
    if (sora2Failed(outer, inner)) {
      throw new Error(
        `pidoi sora2 failed (task_id=${taskId}): ${status.data?.error || status.message || JSON.stringify(status)}`
      );
    }
    await new Promise((r) => setTimeout(r, opts.poll));
  }
}

async function generateSeedance(
  task: ResolvedTask,
  opts: { poll: number; timeout: number; json: boolean }
): Promise<GenerateVideoResult> {
  const spec = parseSeedanceSpec(task.model);
  const resolved: ResolvedTask = {
    ...task,
    seconds: String(task.seconds || "10"),
    aspectRatio: task.aspectRatio || "16:9",
    resolution: (task.resolution || spec.resolutionHint || "720p").toLowerCase(),
  };

  const { taskId } = await createSeedanceTask(resolved);
  if (!opts.json) {
    console.log(`Using pidoi / ${resolved.model} (seedance JSON, code=${spec.code})`);
    console.log(`Task created: ${taskId}`);
  }

  const started = Date.now();
  let lastProgress = "";

  while (true) {
    if (Date.now() - started > opts.timeout) {
      throw new Error(`pidoi seedance timed out after ${opts.timeout}ms (task_id=${taskId})`);
    }
    const status = await getVideoStatus(taskId);
    const st = status.status;
    const progress =
      status.progress !== undefined && status.progress !== null ? String(status.progress) : "";

    if (!opts.json && progress && progress !== lastProgress) {
      lastProgress = progress;
      console.log(`status=${st ?? "?"} progress=${progress}`);
    } else if (!opts.json) {
      process.stdout.write(`status=${st ?? "?"} progress=${progress || "?"} \r`);
    }

    if (seedanceSuccess(st)) {
      let resultUrl = status.video_url || `${getBaseUrl()}/v1/videos/${taskId}/content`;
      if (!opts.json) console.log(`\nDownloading video from ${resultUrl}...`);
      const videoData = await downloadVideo(resultUrl, true);
      const saved = await saveOutput(resolved.outputPath, videoData);
      return {
        provider: "pidoi",
        model: resolved.model,
        taskId,
        resultUrl,
        savedVideo: saved,
        progress: progress || "100",
        raw: status,
      };
    }
    if (seedanceFailed(st)) {
      throw new Error(
        `pidoi seedance failed (task_id=${taskId}): ${status.failure_reason || status.error || JSON.stringify(status)}`
      );
    }
    if (!seedanceRunning(st) && st) {
      // unknown status — keep polling a bit but surface it
      if (!opts.json) console.log(`unknown status=${st}, continue polling...`);
    }
    await new Promise((r) => setTimeout(r, opts.poll));
  }
}

export async function generateVideo(
  task: ResolvedTask,
  opts: { poll: number; timeout: number; json: boolean }
): Promise<GenerateVideoResult> {
  validateTask(task);
  const family = detectFamily(task.model);
  if (family === "seedance") return generateSeedance(task, opts);
  return generateSora2(task, opts);
}

export const id = "pidoi" as const;
