#!/usr/bin/env python3
from __future__ import annotations
import argparse
import json
import os
import sys
import urllib.error
import urllib.request
from pathlib import Path


DEFAULT_PROMPT = (
    "请详细分析这段视频的核心观点、逐段转录主要口播内容，并给出 "
    "1) 30字摘要 2) 3个关键金句 3) 适合做短视频封面的标题。"
)


def parse_args():
    parser = argparse.ArgumentParser(description="调用 GeekAI 视频接口分析视频")
    parser.add_argument("--video-url", "--url", dest="video_url", help="公网视频 URL")
    parser.add_argument("--video-info-json", help="读取上游 JSON 输出并自动选择视频地址")
    parser.add_argument("--video-file", help="本地视频文件路径。当前仅做检查，不自动上传")
    parser.add_argument("--model", default="qwen3.6-plus", help="模型名，默认 qwen3.6-plus")
    parser.add_argument("--prompt", default=DEFAULT_PROMPT, help="用户提示词")
    parser.add_argument("--system", help="system prompt")
    parser.add_argument("--raw", help="保存原始响应 JSON")
    parser.add_argument("--base-url", help="API Base URL，默认读取 GEEKAI_BASE_URL 或 https://geekai.co/api/v1")
    parser.add_argument("--json", action="store_true", dest="json_output", default=True, help="输出 JSON")
    return parser.parse_args()


def get_api_key() -> str:
    key = os.environ.get("GEEKAI_API_KEY", "").strip()
    if not key:
        raise RuntimeError("GEEKAI_API_KEY is required")
    return key


def get_base_url(cli_value: str | None) -> str:
    base = cli_value or os.environ.get("GEEKAI_BASE_URL") or "https://geekai.co/api/v1"
    return base.rstrip("/")


def load_video_url_from_json(path: str) -> str:
    payload = json.loads(Path(path).expanduser().read_text(encoding="utf-8"))
    aweme = None
    if isinstance(payload.get("data"), dict):
        aweme = (payload.get("data") or {}).get("aweme_detail") or {}
    elif isinstance(payload.get("aweme_detail"), dict):
        aweme = payload.get("aweme_detail") or {}

    if isinstance(aweme, dict):
        video = aweme.get("video") or {}
        play_candidates = [
            (video.get("play_addr_h264") or {}).get("url_list"),
            (video.get("play_addr") or {}).get("url_list"),
            (video.get("play_addr_265") or {}).get("url_list"),
            (video.get("download_addr") or {}).get("url_list"),
        ]
        for urls in play_candidates:
            if isinstance(urls, list):
                for item in urls:
                    if isinstance(item, str) and item.strip():
                        return item.strip()
    candidates = [
        payload.get("play_url"),
        payload.get("video_url"),
        payload.get("download_url"),
        payload.get("video_url_first_available"),
    ]
    for candidate in candidates:
        if isinstance(candidate, str) and candidate.strip():
            return candidate.strip()
    raise RuntimeError("video-info-json 中没有可用的视频 URL")


def resolve_video_url(args) -> str:
    if args.video_url:
        return args.video_url.strip()

    if args.video_info_json:
        return load_video_url_from_json(args.video_info_json)

    if args.video_file:
        path = Path(args.video_file).expanduser()
        if not path.exists():
            raise RuntimeError(f"本地视频文件不存在: {path}")
        raise RuntimeError("GeekAI 当前视频接口要求公网 video_url，本地文件直传暂未支持")

    raise RuntimeError("必须提供 --video-url、--video-info-json 或 --video-file")


def build_request_body(video_url: str, args) -> dict:
    messages = []
    if args.system:
        messages.append({"role": "system", "content": args.system})
    messages.append(
        {
            "role": "user",
            "content": [
                {"type": "text", "text": args.prompt},
                {"type": "video_url", "video_url": {"url": video_url}},
            ],
        }
    )
    return {
        "model": args.model,
        "messages": messages,
        "stream": False,
    }


def call_api(base_url: str, api_key: str, body: dict) -> dict:
    request = urllib.request.Request(
        f"{base_url}/chat/completions",
        data=json.dumps(body).encode("utf-8"),
        headers={
            "Content-Type": "application/json",
            "Authorization": f"Bearer {api_key}",
        },
        method="POST",
    )
    try:
        with urllib.request.urlopen(request, timeout=300) as response:
            return json.loads(response.read().decode("utf-8"))
    except urllib.error.HTTPError as exc:
        payload = exc.read().decode("utf-8", errors="ignore")
        try:
            parsed = json.loads(payload)
            message = parsed.get("message") or payload
        except Exception:
            message = payload or str(exc)
        if "Failed to download multimodal content" in message:
            raise RuntimeError(
                "上游模型服务无法下载这个视频 URL。常见原因是抖音直链/临时热链有防盗链限制。"
                "请改用稳定公网 URL，或先把视频上传到你自己的对象存储/CDN。"
            ) from exc
        raise RuntimeError(f"GeekAI API 请求失败: {message}") from exc


def simplify_response(video_url: str, body: dict, response: dict) -> dict:
    choice = ((response.get("choices") or [{}])[0]) if isinstance(response.get("choices"), list) else {}
    message = choice.get("message") or {}
    return {
        "id": response.get("id"),
        "model": response.get("model") or body.get("model"),
        "video_url": video_url,
        "prompt": body["messages"][-1]["content"][0]["text"],
        "content": message.get("content"),
        "finish_reason": choice.get("finish_reason"),
        "usage": response.get("usage"),
    }


def main():
    args = parse_args()
    api_key = get_api_key()
    video_url = resolve_video_url(args)
    base_url = get_base_url(args.base_url)
    body = build_request_body(video_url, args)
    response = call_api(base_url, api_key, body)
    simplified = simplify_response(video_url, body, response)

    if args.raw:
        raw_path = Path(args.raw).expanduser()
        raw_path.parent.mkdir(parents=True, exist_ok=True)
        raw_path.write_text(json.dumps(response, ensure_ascii=False, indent=2), encoding="utf-8")

    if args.json_output:
        print(json.dumps(simplified, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    try:
        main()
    except Exception as exc:
        print(json.dumps({"ok": False, "error": str(exc)}, ensure_ascii=False), file=sys.stderr)
        sys.exit(1)
