---
name: douyin-video-fetch
description: "下载抖音视频信息和视频文件。只要用户提到“抖音视频链接”“抖音分享链接”“下载这个抖音”“抓抖音直链”“导出抖音视频文件”“获取 aweme/detail / 封面 / 音频 / 播放地址”这类场景，就应该使用这个 skill。它适用于抖音视频页和分享链接，会通过浏览器抓取 aweme 详情接口，输出结构化信息，并可直接把视频下载到本地。"
---

# 抖音视频抓取与下载

## Script Directory

**Important**: All scripts are located inside this skill directory.

**Agent Execution Instructions**:
1. Determine this `SKILL.md` file's directory path as `SKILL_DIR`
2. Script path = `${SKILL_DIR}/scripts/fetch_douyin_video.py`
3. Replace all `${SKILL_DIR}` placeholders in this document with the actual installed path

这个 skill 负责两件事：

1. 根据抖音视频页链接或分享链接，抓取作品结构化信息
2. 在需要时直接把视频文件下载到本地

## 何时使用

遇到这些请求时直接使用：

- “把这个抖音视频抓下来”
- “帮我下载这个抖音”
- “拿一下这条抖音的标题、作者、封面、音频、直链”
- “解析这个抖音分享链接”
- “根据抖音链接拿 aweme_id / play_url / download_url”

## 默认流程

1. 先输入一个抖音视频页链接或分享链接。
2. 脚本用浏览器打开页面并监听 `aweme/detail` 响应。
3. 输出标准化 JSON，包括 `aweme_id`、标题、作者、封面、音频、播放地址、下载地址。
4. 如果指定 `--download`，再把视频下载到本地。

## 执行脚本

```bash
python3 ${SKILL_DIR}/scripts/fetch_douyin_video.py \
  --url "https://www.douyin.com/video/7624937951562091782" \
  --json
```

下载视频：

```bash
python3 ${SKILL_DIR}/scripts/fetch_douyin_video.py \
  --url "https://www.douyin.com/video/7624937951562091782" \
  --download \
  --output "/tmp/douyin-7624937951562091782.mp4"
```

保存原始详情 JSON：

```bash
python3 ${SKILL_DIR}/scripts/fetch_douyin_video.py \
  --url "https://v.douyin.com/xxxxxx/" \
  --raw "/tmp/douyin-detail.json"
```

## 参数

- `--url <url>` / `--share-url <url>`: 抖音视频页链接或分享链接，必填
- `--download`: 下载视频文件
- `--output <path>`: 下载到指定文件路径；如果不传，默认写到 `/tmp/douyin-<aweme_id>.mp4`
- `--raw <path>`: 保存原始 `aweme/detail` JSON
- `--json`: 输出结构化 JSON（默认开启）
- `--timeout <seconds>`: 页面与响应等待时间，默认 30 秒
- `-h` / `--help`: 显示帮助

## 输出字段

标准化输出包含这些重点字段：

- `input_url`
- `resolved_url`
- `page_url`
- `aweme_id`
- `desc`
- `author`
- `cover_url`
- `audio_url`
- `play_url`
- `download_url`
- `duration_ms`
- `width`
- `height`
- `downloaded_path`

## 依赖

- Python 3
- `playwright`
- 本机可用的 Chrome / Chromium

如果环境里没有 `playwright`，先安装：

```bash
pip install playwright
playwright install chromium
```

## 边界与失败处理

- 这个 skill 面向抖音视频页和分享链接，不处理账号主页、合集页、直播页。
- 如果页面被验证码拦住，但仍然抓不到 `aweme/detail`，要明确说明抓取失败，不要伪造结果。
- 视频直链有时存在防盗链，下载时必须带浏览器风格的 `User-Agent` 和 `Referer`。

## 推荐串联

如果用户接下来还要分析这个视频，优先把本 skill 输出的 `play_url` 或 `download_url` 交给 `video-analysis` skill 使用。
