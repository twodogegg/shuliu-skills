# pidoi 上游（双协议）

Base URL：`https://pidoi.com`（`PIDOI_BASE_URL` 可覆盖）  
鉴权：`Authorization: Bearer $PIDOI_API_KEY`

pidoi 上至少有两套视频协议，本 skill 按 **model 自动分流**：

| Family | 模型示例 | 创建 | 查询 | 下载 |
|--------|----------|------|------|------|
| **sora2** | `sora2` | `POST /v1/videos` **multipart** + `input_reference` | `GET /v1/video/generations/{id}` | `result_url`（可能第三方 CDN） |
| **seedance** | `sora-431-*` / `sora-v3-933-*` | `POST /v1/videos` **JSON** | `GET /v1/videos/{id}` | `video_url` 或 `/v1/videos/{id}/content`（需 Bearer） |

> 不记录真实 API Key。Seedance 渠道按业务侧叫「特价渠道」，**不是**官方 Seedance API 文档。

---

## A. sora2（图生视频 multipart）

- model 线上名：`sora2`（不是 OpenAI `sora-2`）
- 字段：`model` `prompt` `seconds`（4/8）`size`（如 `1280x720`）`input_reference`
- 状态：外层 `NOT_START|IN_PROGRESS|SUCCESS` + 内层 `queued|in_progress|completed|failed`
- 成功：`outer===SUCCESS || inner===completed`，读 `data.result_url`

详见历史实测与双层 status 说明（原 Sora2 文档）。

---

## B. Seedance 特价渠道（JSON）

### 核心理解：model 名即规格

| 模型 | 档位 | 分辨率 | 图 | 视频 | 音频 |
|------|------|--------|----|------|------|
| `sora-431-720P` | 满血 | 720p | 4 | 3 | 1 |
| `sora-431-fast-480p` | fast | 480p | 4 | 3 | 1 |
| `sora-431-fast-720p` | fast | 720p | 4 | 3 | 1 |
| `sora-v3-933-fast` | fast | 720p | 9 | 3 | 3 |
| `sora-v3-933-pro` | 满血 | 720p | 9 | 3 | 3 |

`431` = 4 图 / 3 视频 / 1 音频；`933` = 9 图 / 3 视频 / 3 音频。  
不要再额外传 `431`/`933` 参数。`resolution` / `seconds` 仍要单独传，并与模型名一致。

### 创建

```
POST /v1/videos
Content-Type: application/json
```

通用字段：`model` `prompt` `aspect_ratio` `resolution` `seconds`（`"10"` / `"15"`）

参考素材：

| 字段 | 说明 |
|------|------|
| `image_url` | 单图：URL / data URI / 纯 base64 |
| `reference_image_urls` | 多图数组 |
| `reference_video` / `reference_videos` | 参考视频 URL |
| `audio_url` / `audio_urls` | 参考音频 URL（必须同时有图） |
| `video_config.reference_mode` | `auto` / `start_frame` / `start_end` |

### reference_mode

- `start_frame`：正好 1 张图
- `start_end`：正好 2 张图，且不能与参考视频同用
- 全能参考：无需开关，图/视频/音频同传即可

### 查询与下载

```
GET /v1/videos/{task_id}
```

状态：`queued` | `processing` | `completed` | `failed`（progress 数字）

完成后：

```
GET /v1/videos/{video_id}/content
Authorization: Bearer ...
```

或使用返回的 `video_url`（同样建议带鉴权下载）。

### 比例 / 格式

- 比例：`16:9` `9:16` `4:3` `3:4` `1:1` `21:9`
- 图：JPEG PNG WebP；视频：MP4 MOV WebM；音频：MP3 WAV M4A AAC OGG（无 FLAC）
- 参考视频/音频单条 2–15s，总长 ≤15s；文件总数 ≤15

### 接入建议

1. 用 model 做规格入口，前端按 431/933 限制上传数。
2. `seconds` 传字符串 `"10"`/`"15"`。
3. `resolution` 与模型名一致（`*-480p` → `480p`）。
4. 完成后尽快转存 `/content`。
5. 本 skill：本地图会转 data URI；**参考视频/音频仅支持公网 URL**（不自动 base64 上传大文件）。

### CLI 映射

```bash
--model sora-v3-933-pro --ar 16:9 --resolution 720p --seconds 10
--ref a.jpg --ref b.jpg --reference-mode start_end
--video https://.../ref.mp4 --audio https://.../ref.mp3
```
