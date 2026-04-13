---
name: douyin-video-fetch
description: "下载抖音视频信息以及视频、音频、封面文件。只要用户提到“抖音视频链接”“抖音分享链接”“下载这个抖音”“抓抖音直链”“导出抖音视频文件”“提取封面或音频”“获取 aweme/detail / 封面 / 音频 / 播放地址”这类场景，就应该使用这个 skill。"
---

# 抖音视频抓取与资源提取

## Script Directory

**Important**: All scripts are located inside this skill directory.

**Agent Execution Instructions**:
1. Determine this `SKILL.md` file's directory path as `SKILL_DIR`
2. Script path = `${SKILL_DIR}/scripts/fetch_douyin_video.py`
3. Replace all `${SKILL_DIR}` placeholders in this document with the actual installed path

这个 skill 负责两件事：

1. 根据抖音视频页、精选页或分享链接，抓取作品结构化信息
2. 直接把视频、音频、封面中的任意一种，或全部资源下载到本地

## 何时使用

遇到这些请求时直接使用：

- “把这个抖音视频抓下来”
- “帮我下载这个抖音的音频”
- “导出这条抖音的封面”
- “拿一下这条抖音的标题、作者、封面、音频、直链”
- “解析这个抖音分享链接”
- “根据抖音链接拿 aweme_id / play_url / download_url”

## 入口兼容

脚本会先把输入归一化成标准作品页，再用浏览器抓取 `aweme/detail`：

- 标准视频页：`https://www.douyin.com/video/<aweme_id>`
- 精选页：`https://www.douyin.com/jingxuan?modal_id=<aweme_id>`
- 精选移动页：`https://jingxuan.douyin.com/m/video/<aweme_id>`
- 分享链接：`https://v.douyin.com/...`

## 子命令

- `video`: 下载视频文件
- `audio`: 下载音频文件
- `cover`: 下载封面文件
- `all`: 一次性下载视频、音频、封面

所有子命令都会输出结构化 JSON，包含 `aweme_id`、标题、作者、封面、音频、播放地址，以及本次实际下载到本地的 `downloaded_paths`。

## 执行脚本

下载视频：

```bash
python3 ${SKILL_DIR}/scripts/fetch_douyin_video.py \
  video \
  --url "https://www.douyin.com/video/7624937951562091782" \
  --output "/tmp/douyin-7624937951562091782.mp4"
```

下载音频：

```bash
python3 ${SKILL_DIR}/scripts/fetch_douyin_video.py \
  audio \
  --url "https://www.douyin.com/jingxuan?modal_id=7603361114428050722" \
  --output "/tmp/douyin-7603361114428050722.mp3"
```

下载封面：

```bash
python3 ${SKILL_DIR}/scripts/fetch_douyin_video.py \
  cover \
  --url "https://jingxuan.douyin.com/m/video/7603361114428050722" \
  --output "/tmp/douyin-7603361114428050722.jpg"
```

一次性下载全部资源：

```bash
python3 ${SKILL_DIR}/scripts/fetch_douyin_video.py \
  all \
  --url "https://v.douyin.com/xxxxxx/" \
  --output-dir "/tmp/douyin-assets"
```

保存原始详情 JSON：

```bash
python3 ${SKILL_DIR}/scripts/fetch_douyin_video.py \
  video \
  --url "https://www.douyin.com/video/7624937951562091782" \
  --raw "/tmp/douyin-detail.json"
```

## 参数

公共参数：

- `--url <url>` / `--share-url <url>`: 抖音视频页、精选页或分享链接，必填
- `--raw <path>`: 保存原始 `aweme/detail` JSON
- `--json`: 输出结构化 JSON（默认开启）
- `--timeout <seconds>`: 页面与响应等待时间，默认 30 秒
- `-h` / `--help`: 显示顶层或子命令帮助

下载参数：

- `video --output <path>`: 下载视频到指定路径；默认 `/tmp/douyin-<aweme_id>.mp4`
- `audio --output <path>`: 下载音频到指定路径；默认 `/tmp/douyin-<aweme_id>.mp3`
- `cover --output <path>`: 下载封面到指定路径；默认 `/tmp/douyin-<aweme_id>.jpg`
- `all --output-dir <dir>`: 把三种资源下载到指定目录；默认 `/tmp`

## 输出字段

标准化输出包含这些重点字段：

- `input_url`
- `normalized_url`
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
- `downloaded_paths`

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

- 这个 skill 面向抖音视频页、精选页和分享链接，不处理账号主页、合集页、直播页。
- 如果页面被验证码拦住，但仍然抓不到 `aweme/detail`，要明确说明抓取失败，不要伪造结果。
- 视频、音频、封面下载都要带浏览器风格的 `User-Agent` 和 `Referer`。

## 推荐串联

如果用户接下来还要分析这个视频，优先把本 skill 输出的 `play_url` 或 `downloaded_paths.video` 交给 `video-analysis` skill 使用。
