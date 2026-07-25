---
name: shuliu-video-gen
description: Generate videos via multi-provider APIs — pidoi (sora2 I2V + Seedance special-channel multi-ref) and lk888 Grok I2V. Use for 图生视频/文生视频/Sora2/Seedance/sora-431/sora-v3-933/Grok video, multi image/video/audio refs, start_frame/start_end, async poll and download mp4.
---

# Shuliu Video Generation

多上游视频生成 skill，风格对齐 baoyu-image-gen（CLI + provider 插件 + 轮询落盘）。

| Provider | 能力 |
|----------|------|
| **pidoi** | ① `sora2` 图生视频 multipart；② Seedance 特价渠道 JSON（`sora-431-*` / `sora-v3-933-*`，文生 / 多图 / 首尾帧 / 音视频参考） |
| **lk888** | Grok 图生视频（`grok-video-3.5` → `grok-imagine-video-1.5-preview`） |

## Script Directory

1. `SKILL_DIR` = 本 SKILL.md 所在目录  
2. 入口：`${SKILL_DIR}/scripts/main.ts`  
3. 运行：`bun` 或 `npx -y bun`

## Credentials

| 变量 | 用途 |
|------|------|
| `PIDOI_API_KEY` | pidoi.com（sora2 + Seedance） |
| `LK888_API_KEY` | api.lk888.ai |

可选：`PIDOI_BASE_URL`、`LK888_BASE_URL`、`PIDOI_VIDEO_MODEL`、`LK888_VIDEO_MODEL`、`SHULIU_VIDEO_PROVIDER`、`SHULIU_VIDEO_MODEL`。

加载：CLI > env > `<cwd>/.shuliu-skills/.env` > `~/.shuliu-skills/.env`。**禁止把真实 Key 写入仓库。**

## Usage

```bash
# 1) pidoi sora2 图生视频
npx -y bun ${SKILL_DIR}/scripts/main.ts \
  --provider pidoi --model sora2 \
  --prompt "Warm cinematic restaurant scene, subtle motion." \
  --ref reference.png --seconds 4 --size 1280x720 \
  --output out/sora2-4s.mp4

# 2) pidoi Seedance 文生视频
npx -y bun ${SKILL_DIR}/scripts/main.ts \
  --provider pidoi --model sora-v3-933-pro \
  --prompt "雨夜霓虹街道，镜头缓慢推进，电影感光影" \
  --ar 16:9 --resolution 720p --seconds 10 \
  --output out/seedance-t2v.mp4

# 3) Seedance 首尾帧
npx -y bun ${SKILL_DIR}/scripts/main.ts \
  --provider pidoi --model sora-431-720P \
  --prompt "从首帧平滑过渡到尾帧" \
  --ref start.jpg --ref end.jpg --reference-mode start_end \
  --ar 16:9 --resolution 720p --seconds 10 \
  --output out/start-end.mp4

# 4) Seedance 图+音频（视频/音频须公网 URL）
npx -y bun ${SKILL_DIR}/scripts/main.ts \
  --provider pidoi --model sora-431-fast-720p \
  --prompt "跟音频节奏运动" \
  --ref character.png --audio https://example.com/beat.mp3 \
  --ar 16:9 --resolution 720p --seconds 10 \
  --output out/img-audio.mp4

# 5) lk888 Grok
npx -y bun ${SKILL_DIR}/scripts/main.ts \
  --provider lk888 --model grok-video-3.5 \
  --prompt "Egret over lake, slow push-in." \
  --ref first.png --seconds 6 --ar 16:9 --resolution 720p \
  --output out/grok.mp4

# 批量 / JSON
npx -y bun ${SKILL_DIR}/scripts/main.ts --batch jobs.jsonl --concurrency 2
npx -y bun ${SKILL_DIR}/scripts/main.ts ... --json
```

## Options

| Option | Description |
|--------|-------------|
| `--prompt` / `--promptfiles` | 提示词 |
| `--ref` / `--image` | 参考图，可重复；本地路径自动转 data URI |
| `--video` | 参考视频 **URL**（Seedance，可重复） |
| `--audio` | 参考音频 **URL**（Seedance，可重复；必须同时有图） |
| `--reference-mode` | `auto` \| `start_frame` \| `start_end` |
| `--output` | 输出 mp4 |
| `--provider` | `pidoi` \| `lk888` |
| `--model` | 见下表 |
| `--seconds` | 时长 |
| `--size` | 仅 sora2，如 `1280x720` |
| `--ar` | Seedance / lk888 比例 |
| `--resolution` | `480p` / `720p` |
| `--notify-url` | lk888 webhook |
| `--poll` / `--timeout` | 轮询间隔 / 总超时（默认 70min） |
| `--batch` / `--concurrency` | 批量 |
| `--json` | 结构化输出 |

## pidoi 模型

| model | 协议 | 说明 |
|-------|------|------|
| `sora2` | multipart I2V | 需 1 张 `--ref`；`seconds` 4/8；`--size` |
| `sora-431-720P` | Seedance JSON | 4 图 / 3 视频 / 1 音频；720p；10/15s |
| `sora-431-fast-480p` | Seedance | fast 480p |
| `sora-431-fast-720p` | Seedance | fast 720p |
| `sora-v3-933-fast` | Seedance | 9 图 / 3 视频 / 3 音频 |
| `sora-v3-933-pro` | Seedance | 同上 pro |

model 名编码规格；`resolution`/`seconds` 仍要单独传且与模型一致。分流逻辑：`detectFamily(model)`。

## Agent 工作流

1. 确认 Key；缺密钥先提示配置。  
2. 按需求选 model：短 I2V 用 `sora2`；多参考/10–15s/文生用 Seedance；Grok 用 lk888。  
3. Seedance 文生可不传 `--ref`；sora2 / lk888 **必须** 1 张图。  
4. 首帧：`--reference-mode start_frame` + 1 图；首尾帧：`start_end` + 2 图。  
5. 视频/音频参考只接受公网 URL。  
6. 成功后使用本地 `--output`（CDN/`/content` 已转存）。  
7. 细节：`references/providers/pidoi.md`、`lk888.md`。

## Batch 示例

```json
{"prompt":"t2v","output":"out/a.mp4","provider":"pidoi","model":"sora-v3-933-pro","seconds":"10","ar":"16:9","resolution":"720p"}
{"prompt":"i2v","refs":["a.png"],"output":"out/b.mp4","provider":"pidoi","model":"sora2","seconds":"4","size":"1280x720"}
{"prompt":"start-end","refs":["s.jpg","e.jpg"],"referenceMode":"start_end","output":"out/c.mp4","provider":"pidoi","model":"sora-431-720P","seconds":"10","ar":"16:9","resolution":"720p"}
```

## Error Handling

- 缺 Key / 规格超限 / 缺 ref → 校验报错  
- Seedance 失败 → `status=failed` + failure_reason  
- sora2 → 双层 status 兼容  
- lk888 → `is_final` + `state`  
- 超时 `--timeout`；批量单条失败不阻断其他任务  

## References

| File | Content |
|------|---------|
| `references/providers/pidoi.md` | sora2 + Seedance 双协议 |
| `references/providers/lk888.md` | Grok 图生视频 |
