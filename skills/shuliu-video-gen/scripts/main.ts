import path from "node:path";
import process from "node:process";
import { homedir } from "node:os";
import { mkdir, readFile } from "node:fs/promises";
import type {
  BatchTaskInput,
  CliArgs,
  GenerateVideoResult,
  Provider,
  ReferenceMode,
  ResolvedTask,
} from "./types";
import * as pidoi from "./providers/pidoi";
import * as lk888 from "./providers/lk888";

const PROVIDERS = {
  pidoi,
  lk888,
} as const;

const DEFAULT_POLL_MS = 8000;
const DEFAULT_TIMEOUT_MS = 70 * 60 * 1000;
const DEFAULT_CONCURRENCY = 2;

function printUsage(): void {
  console.log(`Usage:
  # pidoi sora2 (multipart, image-to-video, 4/8s)
  npx -y bun scripts/main.ts --provider pidoi --model sora2 \\
    --prompt "..." --ref first.png --seconds 4 --size 1280x720 --output out.mp4

  # pidoi Seedance special channel (JSON, text/multi-ref)
  npx -y bun scripts/main.ts --provider pidoi --model sora-v3-933-pro \\
    --prompt "雨夜霓虹街道" --ar 16:9 --resolution 720p --seconds 10 --output out.mp4

  npx -y bun scripts/main.ts --provider pidoi --model sora-431-fast-720p \\
    --prompt "..." --ref a.jpg --ref b.jpg --reference-mode start_end \\
    --ar 16:9 --resolution 720p --seconds 10 --output out.mp4

  # lk888 Grok
  npx -y bun scripts/main.ts --provider lk888 --model grok-video-3.5 \\
    --prompt "..." --ref first.png --seconds 6 --ar 16:9 --resolution 720p --output out.mp4

  npx -y bun scripts/main.ts --batch jobs.jsonl --concurrency 2

Options:
  -p, --prompt <text>         Prompt text
  --promptfiles <files...>    Read prompt from files (concatenated)
  --ref <path|url>            Reference image (repeatable). Alias: --image
  --video <url>               Reference video URL (repeatable; Seedance)
  --audio <url>               Reference audio URL (repeatable; Seedance)
  --reference-mode <mode>     auto | start_frame | start_end (Seedance)
  --output <path>             Output video path (required in single mode)
  --batch <file>              Batch tasks (.json array or .jsonl)
  --concurrency <n>           Parallel workers for --batch (default: 2)
  --provider pidoi|lk888      Force provider
  -m, --model <id>            Model id or alias
  --seconds <n>               Duration (sora2: 4/8; Seedance: 10/15; lk888: 1-15)
  --size <WxH>                Pixel size for sora2 (default: 1280x720)
  --ar <ratio>                Aspect ratio (Seedance/lk888)
  --resolution 480p|720p      Resolution (Seedance/lk888)
  --notify-url <url>          Optional webhook for lk888
  --poll <ms>                 Poll interval (default: 8000)
  --timeout <ms>              Max wait (default: 4200000 = 70min)
  --json                      JSON output
  -h, --help                  Show help

pidoi models:
  sora2                       Classic I2V multipart (needs --ref)
  sora-431-720P               Seedance 4图/3视频/1音频 720p 满血
  sora-431-fast-480p          Seedance fast 480p
  sora-431-fast-720p          Seedance fast 720p
  sora-v3-933-fast            Seedance 9图/3视频/3音频 fast
  sora-v3-933-pro             Seedance 9图/3视频/3音频 pro

Environment:
  PIDOI_API_KEY / PIDOI_BASE_URL / PIDOI_VIDEO_MODEL
  LK888_API_KEY / LK888_BASE_URL / LK888_VIDEO_MODEL
  SHULIU_VIDEO_PROVIDER / SHULIU_VIDEO_MODEL

Env file: CLI > process.env > <cwd>/.shuliu-skills/.env > ~/.shuliu-skills/.env`);
}

function parseArgs(argv: string[]): CliArgs {
  const out: CliArgs = {
    prompt: null,
    promptFiles: [],
    refs: [],
    videos: [],
    audios: [],
    referenceMode: null,
    output: null,
    provider: null,
    model: null,
    seconds: null,
    size: null,
    aspectRatio: null,
    resolution: null,
    notifyUrl: null,
    poll: DEFAULT_POLL_MS,
    timeout: DEFAULT_TIMEOUT_MS,
    batchPath: null,
    concurrency: DEFAULT_CONCURRENCY,
    json: false,
    help: false,
  };

  const positional: string[] = [];

  const takeMany = (i: number): { items: string[]; next: number } => {
    const items: string[] = [];
    let j = i + 1;
    while (j < argv.length) {
      const v = argv[j]!;
      if (v.startsWith("-")) break;
      items.push(v);
      j++;
    }
    return { items, next: j - 1 };
  };

  for (let i = 0; i < argv.length; i++) {
    const a = argv[i]!;

    if (a === "--help" || a === "-h") {
      out.help = true;
      continue;
    }
    if (a === "--json") {
      out.json = true;
      continue;
    }
    if (a === "--prompt" || a === "-p") {
      const v = argv[++i];
      if (!v) throw new Error(`Missing value for ${a}`);
      out.prompt = v;
      continue;
    }
    if (a === "--promptfiles") {
      const { items, next } = takeMany(i);
      if (items.length === 0) throw new Error("Missing files for --promptfiles");
      out.promptFiles.push(...items);
      i = next;
      continue;
    }
    if (a === "--ref" || a === "--image") {
      const v = argv[++i];
      if (!v) throw new Error(`Missing value for ${a}`);
      out.refs.push(v);
      continue;
    }
    if (a === "--video") {
      const v = argv[++i];
      if (!v) throw new Error("Missing value for --video");
      out.videos.push(v);
      continue;
    }
    if (a === "--audio") {
      const v = argv[++i];
      if (!v) throw new Error("Missing value for --audio");
      out.audios.push(v);
      continue;
    }
    if (a === "--reference-mode") {
      const v = argv[++i] as ReferenceMode | undefined;
      if (v !== "auto" && v !== "start_frame" && v !== "start_end") {
        throw new Error(`Invalid --reference-mode: ${v}`);
      }
      out.referenceMode = v;
      continue;
    }
    if (a === "--output") {
      const v = argv[++i];
      if (!v) throw new Error("Missing value for --output");
      out.output = v;
      continue;
    }
    if (a === "--batch") {
      const v = argv[++i];
      if (!v) throw new Error("Missing value for --batch");
      out.batchPath = v;
      continue;
    }
    if (a === "--concurrency") {
      const v = Number(argv[++i]);
      if (!Number.isInteger(v) || v <= 0) throw new Error("Invalid --concurrency");
      out.concurrency = v;
      continue;
    }
    if (a === "--provider") {
      const v = argv[++i];
      if (v !== "pidoi" && v !== "lk888") throw new Error(`Invalid provider: ${v}`);
      out.provider = v;
      continue;
    }
    if (a === "--model" || a === "-m") {
      const v = argv[++i];
      if (!v) throw new Error(`Missing value for ${a}`);
      out.model = v;
      continue;
    }
    if (a === "--seconds") {
      const v = argv[++i];
      if (!v) throw new Error("Missing value for --seconds");
      out.seconds = v;
      continue;
    }
    if (a === "--size") {
      const v = argv[++i];
      if (!v) throw new Error("Missing value for --size");
      out.size = v;
      continue;
    }
    if (a === "--ar") {
      const v = argv[++i];
      if (!v) throw new Error("Missing value for --ar");
      out.aspectRatio = v;
      continue;
    }
    if (a === "--resolution") {
      const v = argv[++i];
      if (!v) throw new Error("Missing value for --resolution");
      out.resolution = v;
      continue;
    }
    if (a === "--notify-url") {
      const v = argv[++i];
      if (!v) throw new Error("Missing value for --notify-url");
      out.notifyUrl = v;
      continue;
    }
    if (a === "--poll") {
      const v = Number(argv[++i]);
      if (!Number.isInteger(v) || v <= 0) throw new Error("Invalid --poll");
      out.poll = v;
      continue;
    }
    if (a === "--timeout") {
      const v = Number(argv[++i]);
      if (!Number.isInteger(v) || v <= 0) throw new Error("Invalid --timeout");
      out.timeout = v;
      continue;
    }
    if (a.startsWith("-")) throw new Error(`Unknown option: ${a}`);
    positional.push(a);
  }

  if (!out.prompt && out.promptFiles.length === 0 && positional.length > 0) {
    out.prompt = positional.join(" ");
  }

  return out;
}

async function loadEnvFile(p: string): Promise<Record<string, string>> {
  try {
    const content = await readFile(p, "utf8");
    const env: Record<string, string> = {};
    for (const line of content.split("\n")) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const idx = trimmed.indexOf("=");
      if (idx === -1) continue;
      const key = trimmed.slice(0, idx).trim();
      let val = trimmed.slice(idx + 1).trim();
      if (
        (val.startsWith('"') && val.endsWith('"')) ||
        (val.startsWith("'") && val.endsWith("'"))
      ) {
        val = val.slice(1, -1);
      }
      env[key] = val;
    }
    return env;
  } catch {
    return {};
  }
}

async function loadEnv(): Promise<void> {
  const home = homedir();
  const cwd = process.cwd();
  const homeEnv = await loadEnvFile(path.join(home, ".shuliu-skills", ".env"));
  const cwdEnv = await loadEnvFile(path.join(cwd, ".shuliu-skills", ".env"));
  for (const [k, v] of Object.entries(homeEnv)) {
    if (!process.env[k]) process.env[k] = v;
  }
  for (const [k, v] of Object.entries(cwdEnv)) {
    if (!process.env[k]) process.env[k] = v;
  }
}

async function readPromptFromFiles(files: string[]): Promise<string> {
  const parts: string[] = [];
  for (const f of files) parts.push(await readFile(f, "utf8"));
  return parts.join("\n\n");
}

async function readPromptFromStdin(): Promise<string | null> {
  if (process.stdin.isTTY) return null;
  try {
    const t = await Bun.stdin.text();
    const v = t.trim();
    return v.length > 0 ? v : null;
  } catch {
    return null;
  }
}

function modelLooksLike(provider: Provider, model: string | null): boolean {
  if (!model) return false;
  const m = model.toLowerCase();
  if (provider === "pidoi") {
    return m.includes("sora") || m.includes("431") || m.includes("933") || m.includes("seedance");
  }
  return m.includes("grok") || m.includes("imagine-video");
}

function selectProvider(args: {
  provider: Provider | null;
  model: string | null;
  aspectRatio: string | null;
  resolution: string | null;
  size: string | null;
  videos?: string[];
  audios?: string[];
}): Provider {
  if (args.provider) return args.provider;

  if (modelLooksLike("pidoi", args.model) && !modelLooksLike("lk888", args.model)) return "pidoi";
  if (modelLooksLike("lk888", args.model) && !modelLooksLike("pidoi", args.model)) return "lk888";

  const envProvider = process.env.SHULIU_VIDEO_PROVIDER as Provider | undefined;
  if (envProvider === "pidoi" || envProvider === "lk888") return envProvider;

  const hasPidoi = Boolean(process.env.PIDOI_API_KEY);
  const hasLk888 = Boolean(process.env.LK888_API_KEY);

  if (hasPidoi && !hasLk888) return "pidoi";
  if (hasLk888 && !hasPidoi) return "lk888";
  if (hasPidoi && hasLk888) {
    if ((args.videos && args.videos.length) || (args.audios && args.audios.length)) return "pidoi";
    if (args.size) return "pidoi";
    if (args.aspectRatio || args.resolution) {
      // both support ar/resolution; prefer pidoi if model looks seedance-ish else lk888 only when only one ref style
      return "pidoi";
    }
    return "pidoi";
  }

  throw new Error(
    "No video provider available. Set PIDOI_API_KEY and/or LK888_API_KEY, or pass --provider."
  );
}

function defaultSeconds(provider: Provider, model: string): string {
  if (provider === "lk888") return "6";
  if (pidoi.detectFamily(model) === "seedance") return "10";
  return "4";
}

function defaultSize(provider: Provider, model: string): string | null {
  if (provider === "pidoi" && pidoi.detectFamily(model) === "sora2") return "1280x720";
  return null;
}

function defaultAr(provider: Provider, model: string): string | null {
  if (provider === "lk888") return "16:9";
  if (provider === "pidoi" && pidoi.detectFamily(model) === "seedance") return "16:9";
  return null;
}

function defaultResolution(provider: Provider, model: string): string | null {
  if (provider === "lk888") return "720p";
  if (provider === "pidoi" && pidoi.detectFamily(model) === "seedance") {
    return pidoi.parseSeedanceSpec(model).resolutionHint || "720p";
  }
  return null;
}

function resolveModel(provider: Provider, model: string | null): string {
  return PROVIDERS[provider].resolveModel(model);
}

function buildTask(
  provider: Provider,
  prompt: string,
  args: {
    refs: string[];
    videos: string[];
    audios: string[];
    referenceMode: ReferenceMode | null;
    output: string | null;
    outputPath?: string;
    model: string | null;
    seconds: string | null;
    size: string | null;
    aspectRatio: string | null;
    resolution: string | null;
    notifyUrl: string | null;
  }
): ResolvedTask {
  const outputPath = args.outputPath || args.output;
  if (!outputPath) throw new Error("Output path is required");
  const model = resolveModel(provider, args.model);
  return {
    prompt,
    refs: args.refs,
    videos: args.videos,
    audios: args.audios,
    referenceMode: args.referenceMode,
    outputPath,
    provider,
    model,
    seconds: args.seconds || defaultSeconds(provider, model),
    size: args.size || defaultSize(provider, model),
    aspectRatio: args.aspectRatio || defaultAr(provider, model),
    resolution: args.resolution || defaultResolution(provider, model),
    notifyUrl: args.notifyUrl,
  };
}

async function runOne(
  task: ResolvedTask,
  opts: { poll: number; timeout: number; json: boolean }
): Promise<GenerateVideoResult> {
  const mod = PROVIDERS[task.provider];
  mod.validateTask?.(task);
  return mod.generateVideo(task, opts);
}

async function parseBatchFile(filePath: string): Promise<BatchTaskInput[]> {
  const content = await readFile(filePath, "utf8");
  const trimmed = content.trim();
  if (!trimmed) return [];

  if (filePath.endsWith(".jsonl") || (!trimmed.startsWith("[") && !trimmed.startsWith("{"))) {
    const tasks: BatchTaskInput[] = [];
    for (const line of content.split("\n")) {
      const t = line.trim();
      if (!t || t.startsWith("#")) continue;
      tasks.push(JSON.parse(t) as BatchTaskInput);
    }
    return tasks;
  }

  const parsed = JSON.parse(trimmed) as BatchTaskInput[] | { tasks: BatchTaskInput[] };
  if (Array.isArray(parsed)) return parsed;
  if (parsed && Array.isArray(parsed.tasks)) return parsed.tasks;
  throw new Error("Batch file must be a JSON array, {tasks:[]}, or JSONL");
}

function batchRefs(row: BatchTaskInput, fallback: string[]): string[] {
  if (row.refs?.length) return row.refs;
  if (row.images?.length) return row.images;
  if (row.ref) return [row.ref];
  if (row.image) return [row.image];
  return fallback;
}

async function runBatch(args: CliArgs): Promise<void> {
  if (!args.batchPath) throw new Error("batch path missing");
  const inputs = await parseBatchFile(args.batchPath);
  if (inputs.length === 0) throw new Error("No tasks in batch file");

  type Item = { index: number; task: ResolvedTask };
  const items: Item[] = [];

  for (let i = 0; i < inputs.length; i++) {
    const row = inputs[i]!;
    let prompt = row.prompt || null;
    if (!prompt && row.promptFile) prompt = await readFile(row.promptFile, "utf8");
    if (!prompt) throw new Error(`Batch task #${i + 1}: prompt or promptFile required`);
    if (!row.output) throw new Error(`Batch task #${i + 1}: output required`);

    const refs = batchRefs(row, args.refs);
    const videos = row.videos || args.videos;
    const audios = row.audios || args.audios;

    const provider = selectProvider({
      provider: row.provider || args.provider,
      model: row.model || args.model,
      aspectRatio: row.ar || args.aspectRatio,
      resolution: row.resolution || args.resolution,
      size: row.size || args.size,
      videos,
      audios,
    });

    const task = buildTask(provider, prompt, {
      refs,
      videos,
      audios,
      referenceMode: row.referenceMode || args.referenceMode,
      output: row.output,
      model: row.model || args.model,
      seconds: row.seconds != null ? String(row.seconds) : args.seconds,
      size: row.size || args.size,
      aspectRatio: row.ar || args.aspectRatio,
      resolution: row.resolution || args.resolution,
      notifyUrl: row.notifyUrl || args.notifyUrl,
    });
    items.push({ index: i, task });
  }

  const results: Array<{ index: number; ok: boolean; result?: GenerateVideoResult; error?: string }> =
    [];
  let cursor = 0;
  const workers = Math.min(args.concurrency, items.length);

  async function worker(): Promise<void> {
    while (true) {
      const idx = cursor++;
      if (idx >= items.length) return;
      const item = items[idx]!;
      try {
        if (!args.json) {
          console.log(
            `\n[${item.index + 1}/${items.length}] ${item.task.provider}/${item.task.model} → ${item.task.outputPath}`
          );
        }
        const result = await runOne(item.task, {
          poll: args.poll,
          timeout: args.timeout,
          json: args.json,
        });
        results.push({ index: item.index, ok: true, result });
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        results.push({ index: item.index, ok: false, error: msg });
        if (!args.json) console.error(`[${item.index + 1}] failed: ${msg}`);
      }
    }
  }

  await Promise.all(Array.from({ length: workers }, () => worker()));
  results.sort((a, b) => a.index - b.index);

  const success = results.filter((r) => r.ok).length;
  const failed = results.length - success;

  if (args.json) {
    console.log(JSON.stringify({ success, failed, results }, null, 2));
  } else {
    console.log(`\nBatch done: ${success} ok, ${failed} failed`);
  }
  if (failed > 0) process.exitCode = 1;
}

async function main(): Promise<void> {
  const args = parseArgs(process.argv.slice(2));
  if (args.help) {
    printUsage();
    return;
  }

  await loadEnv();

  if (args.batchPath) {
    await runBatch(args);
    return;
  }

  let prompt: string | null = args.prompt;
  if (!prompt && args.promptFiles.length > 0) prompt = await readPromptFromFiles(args.promptFiles);
  if (!prompt) prompt = await readPromptFromStdin();

  if (!prompt) {
    console.error("Error: Prompt is required");
    printUsage();
    process.exitCode = 1;
    return;
  }
  if (!args.output) {
    console.error("Error: --output is required");
    printUsage();
    process.exitCode = 1;
    return;
  }

  const provider = selectProvider(args);
  const task = buildTask(provider, prompt, args);

  if (!args.json) {
    console.log(`Starting video generation...`);
    console.log(`Provider/Model: ${task.provider} / ${task.model}`);
    console.log(`Prompt: ${task.prompt.slice(0, 200)}${task.prompt.length > 200 ? "…" : ""}`);
    if (task.refs.length) console.log(`Refs(${task.refs.length}): ${task.refs.join(", ")}`);
    if (task.videos.length) console.log(`Videos: ${task.videos.join(", ")}`);
    if (task.audios.length) console.log(`Audios: ${task.audios.join(", ")}`);
    if (task.referenceMode) console.log(`reference_mode: ${task.referenceMode}`);
    console.log(
      `Params: seconds=${task.seconds}` +
        (task.size ? ` size=${task.size}` : "") +
        (task.aspectRatio ? ` ar=${task.aspectRatio}` : "") +
        (task.resolution ? ` resolution=${task.resolution}` : "")
    );
  }

  try {
    await mkdir(path.dirname(path.resolve(task.outputPath)), { recursive: true });
  } catch {
    // ignore
  }

  try {
    const result = await runOne(task, {
      poll: args.poll,
      timeout: args.timeout,
      json: args.json,
    });
    if (args.json) {
      console.log(JSON.stringify(result, null, 2));
    } else {
      console.log(`Video saved to: ${result.savedVideo}`);
      console.log(`Result URL: ${result.resultUrl}`);
    }
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    if (args.json) {
      console.log(JSON.stringify({ error: msg }, null, 2));
    } else {
      console.error(msg);
    }
    process.exitCode = 1;
  }
}

main().catch((e) => {
  const msg = e instanceof Error ? e.message : String(e);
  console.error(msg);
  process.exit(1);
});
