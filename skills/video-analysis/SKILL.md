---
name: video-analysis
description: "分析视频内容。只要用户提到“分析视频”“理解视频”“转录视频口播”“总结视频观点”“给视频做摘要/金句/封面标题”“用 GeekAI 分析视频”“把这个视频丢给模型”这类场景，就应该使用这个 skill。它适用于公网可访问的视频 URL，支持直接调用 GeekAI 的 OpenAI 兼容视频接口，也支持读取 `douyin-video-fetch` 输出的 JSON 自动接上游视频地址。"
---

# 视频分析

## Script Directory

**Important**: All scripts are located inside this skill directory.

**Agent Execution Instructions**:
1. Determine this `SKILL.md` file's directory path as `SKILL_DIR`
2. Script path = `${SKILL_DIR}/scripts/analyze_video.py`
3. Replace all `${SKILL_DIR}` placeholders in this document with the actual installed path

这个 skill 负责把公网可访问的视频 URL 送进 GeekAI/OpenAI 兼容视频接口，并返回结构化分析结果。

## 何时使用

遇到这些需求时直接使用：

- “分析这个视频”
- “转录这段视频”
- “提炼这条视频的核心观点和金句”
- “用 qwen3.6-plus / Gemini 分析视频”
- “把这个视频丢给 GeekAI”

## 默认流程

1. 优先接收公网视频 URL。
2. 如果用户给的是 `douyin-video-fetch` 的输出 JSON，就自动从里面取 `play_url` 或 `download_url`。
3. 调用 `https://geekai.co/api/v1/chat/completions`。
4. 返回模型原文和 token 用量摘要。

## 执行脚本

直接传视频 URL：

```bash
python3 ${SKILL_DIR}/scripts/analyze_video.py \
  --video-url "https://example.com/video.mp4" \
  --model "qwen3.6-plus"
```

读取 `douyin-video-fetch` 输出：

```bash
python3 ${SKILL_DIR}/scripts/analyze_video.py \
  --video-info-json "/tmp/douyin-detail.json" \
  --model "qwen3.6-plus"
```

自定义分析问题：

```bash
python3 ${SKILL_DIR}/scripts/analyze_video.py \
  --video-url "https://example.com/video.mp4" \
  --prompt "请详细分析这段视频的核心观点，转录主要口播内容，并给出 3 个封面标题。"
```

## 参数

- `--video-url <url>` / `--url <url>`: 公网可访问的视频 URL
- `--video-info-json <path>`: 读取上游 JSON，自动取视频地址
- `--video-file <path>`: 本地视频文件路径；当前只做存在性检查并给出清晰报错，不做自动上传
- `--model <id>`: 模型名，默认 `qwen3.6-plus`
- `--prompt <text>`: 用户问题
- `--system <text>`: 可选 system prompt
- `--raw <path>`: 保存原始接口响应 JSON
- `--base-url <url>`: API Base URL，默认 `https://geekai.co/api/v1`
- `--json`: 输出 JSON（默认开启）
- `-h` / `--help`: 显示帮助

## 环境变量

- `GEEKAI_API_KEY`：必填
- `GEEKAI_BASE_URL`：可选，默认 `https://geekai.co/api/v1`

## 输出字段

- `video_url`
- `model`
- `prompt`
- `content`
- `usage`
- `id`
- `finish_reason`

## 当前边界

根据 GeekAI 当前文档，视频分析接口要求 `type: "video_url"`，即公网可访问的 URL。

这意味着：

- 直接传公网视频 URL：支持
- 读取 `douyin-video-fetch` 产出的直链：脚本支持自动读取，但抖音热链可能被第三方模型服务拦截下载
- 直接上传本地大视频文件：当前不支持

如果用户只给了本地视频文件，先明确说明这一点，并建议先把视频放到一个稳定公网地址。
如果用户给的是抖音直链而接口返回 “Failed to download multimodal content”，明确说明这是抖音热链限制，建议改用自有 CDN、对象存储或其他稳定外链。

## 推荐默认问题

如果用户没有给具体问题，默认使用这段：

“请详细分析这段视频的核心观点、逐段转录主要口播内容，并给出 1) 30字摘要 2) 3个关键金句 3) 适合做短视频封面的标题。”
