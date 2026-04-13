#!/usr/bin/env python3
from __future__ import annotations

import argparse
import json
import re
import sys
import urllib.error
import urllib.parse
import urllib.request
from pathlib import Path

from playwright.sync_api import sync_playwright


UA = (
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) "
    "AppleWebKit/537.36 (KHTML, like Gecko) "
    "Chrome/146.0.0.0 Safari/537.36"
)

VIDEO_PAGE_TEMPLATE = "https://www.douyin.com/video/{aweme_id}"
DEFAULT_OUTPUT_DIR = Path("/tmp")
ASSET_EXTENSIONS = {
    "video": ".mp4",
    "audio": ".mp3",
    "cover": ".jpg",
}
COMMAND_HELP = {
    "video": "抓取详情并下载视频文件",
    "audio": "抓取详情并下载音频文件",
    "cover": "抓取详情并下载封面文件",
    "all": "抓取详情并下载视频、音频、封面",
}


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(
        description="抓取抖音视频详情，并按子命令提取视频、音频、封面或全部资源",
        epilog=(
            "示例:\n"
            "  fetch_douyin_video.py video --url \"https://www.douyin.com/video/7624937951562091782\"\n"
            "  fetch_douyin_video.py audio --url \"https://www.douyin.com/jingxuan?modal_id=7603361114428050722\"\n"
            "  fetch_douyin_video.py all --url \"https://v.douyin.com/xxxxxx/\" --output-dir /tmp/douyin-assets"
        ),
        formatter_class=argparse.RawTextHelpFormatter,
    )
    subparsers = parser.add_subparsers(dest="command", required=True, metavar="{video,audio,cover,all}")

    for command in ("video", "audio", "cover", "all"):
        subparser = subparsers.add_parser(
            command,
            help=COMMAND_HELP[command],
            description=COMMAND_HELP[command],
            formatter_class=argparse.RawTextHelpFormatter,
        )
        subparser.add_argument("--url", "--share-url", dest="url", required=True, help="抖音视频页链接、精选页链接或分享链接")
        if command == "all":
            subparser.add_argument(
                "--output-dir",
                help="下载目录，默认 /tmp，文件名自动生成为 douyin-<aweme_id>.<ext>",
            )
        else:
            subparser.add_argument(
                "--output",
                help=f"下载文件路径，默认 /tmp/douyin-<aweme_id>{ASSET_EXTENSIONS[command]}",
            )
        subparser.add_argument("--raw", help="保存原始 aweme/detail JSON")
        subparser.add_argument("--json", action="store_true", dest="json_output", default=True, help="输出 JSON")
        subparser.add_argument("--timeout", type=int, default=30, help="超时时间，单位秒，默认 30")
    return parser


def parse_args():
    return build_parser().parse_args()


def follow_redirects(url: str) -> str:
    request = urllib.request.Request(url, headers={"User-Agent": UA})
    try:
        with urllib.request.urlopen(request, timeout=15) as response:
            return response.geturl()
    except Exception:
        return url


def extract_aweme_id(url: str) -> str | None:
    match = re.search(r"/video/(\d+)", url)
    if match:
        return match.group(1)
    match = re.search(r"modal_id=(\d+)", url)
    if match:
        return match.group(1)
    return None


def normalize_input_url(url: str) -> str:
    parsed = urllib.parse.urlparse(url)
    query = urllib.parse.parse_qs(parsed.query)
    modal_id = query.get("modal_id", [None])[0]
    if modal_id and str(modal_id).isdigit():
        return VIDEO_PAGE_TEMPLATE.format(aweme_id=modal_id)

    aweme_id = extract_aweme_id(parsed.path)
    if aweme_id:
        return VIDEO_PAGE_TEMPLATE.format(aweme_id=aweme_id)

    return url


def pick_first_url(value):
    if not isinstance(value, list):
        return None
    for item in value:
        if isinstance(item, str) and item.strip():
            return item.strip()
    return None


def extract_video_urls(video: dict) -> tuple[str | None, str | None]:
    play_candidates = [
        video.get("play_addr_h264"),
        video.get("play_addr"),
        video.get("play_addr_265"),
    ]
    for candidate in play_candidates:
        if isinstance(candidate, dict):
            picked = pick_first_url(candidate.get("url_list"))
            if picked:
                play_url = picked
                break
    else:
        play_url = None

    download_url = None
    candidate = video.get("download_addr")
    if isinstance(candidate, dict):
        download_url = pick_first_url(candidate.get("url_list"))

    return play_url, download_url


def normalize_output(input_url: str, normalized_url: str, resolved_url: str, page_url: str, detail: dict) -> dict:
    aweme = detail.get("aweme_detail") or {}
    video = aweme.get("video") or {}
    music = aweme.get("music") or {}
    author = aweme.get("author") or {}
    play_url, download_url = extract_video_urls(video)

    return {
        "input_url": input_url,
        "normalized_url": normalized_url,
        "resolved_url": resolved_url,
        "page_url": page_url,
        "aweme_id": aweme.get("aweme_id"),
        "desc": aweme.get("desc"),
        "author": {
            "uid": author.get("uid"),
            "sec_uid": author.get("sec_uid"),
            "unique_id": author.get("unique_id"),
            "nickname": author.get("nickname"),
        },
        "cover_url": pick_first_url((video.get("origin_cover") or {}).get("url_list")),
        "audio_url": pick_first_url((music.get("play_url") or {}).get("url_list")),
        "play_url": play_url,
        "download_url": download_url,
        "duration_ms": video.get("duration"),
        "width": (video.get("play_addr") or {}).get("width") or (video.get("play_addr_h264") or {}).get("width"),
        "height": (video.get("play_addr") or {}).get("height") or (video.get("play_addr_h264") or {}).get("height"),
        "downloaded_paths": {},
    }


def fetch_detail(input_url: str, timeout_seconds: int) -> tuple[str, str, str, dict]:
    normalized_url = normalize_input_url(input_url)
    resolved_url = normalize_input_url(follow_redirects(normalized_url))
    target_aweme_id = extract_aweme_id(resolved_url) or extract_aweme_id(normalized_url)
    captured = {"detail": None}

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True, channel="chrome")
        page = browser.new_page(user_agent=UA)

        def handle_response(response):
            nonlocal target_aweme_id
            url = response.url
            if "/aweme/v1/web/aweme/detail/" not in url or response.status != 200:
                return
            if target_aweme_id and f"aweme_id={target_aweme_id}" not in url:
                return
            try:
                payload = response.json()
            except Exception:
                return
            aweme = (payload or {}).get("aweme_detail") or {}
            aweme_id = aweme.get("aweme_id")
            if aweme_id and not target_aweme_id:
                target_aweme_id = aweme_id
            if target_aweme_id and aweme_id != target_aweme_id:
                return
            captured["detail"] = payload

        page.on("response", handle_response)
        page.goto(resolved_url, wait_until="domcontentloaded", timeout=timeout_seconds * 1000)
        page.wait_for_timeout(min(timeout_seconds, 10) * 1000)
        page_url = page.url
        body_text = page.locator("body").inner_text()
        browser.close()

    if not captured["detail"]:
        if "验证码中间页" in body_text:
            raise RuntimeError("页面进入验证码中间页，未抓到 aweme/detail 响应")
        raise RuntimeError("未抓到抖音 aweme/detail 响应")

    return normalized_url, resolved_url, page_url, captured["detail"]


def ensure_parent(path: Path):
    path.parent.mkdir(parents=True, exist_ok=True)


def download_file(url: str, referer: str, output_path: Path):
    ensure_parent(output_path)
    request = urllib.request.Request(url, headers={"User-Agent": UA, "Referer": referer})
    with urllib.request.urlopen(request, timeout=60) as response:
        with output_path.open("wb") as fh:
            fh.write(response.read())


def build_download_plan(command: str, aweme_id: str, output: str | None, output_dir: str | None = None) -> dict[str, Path]:
    prefix = f"douyin-{aweme_id}"
    if command == "all":
        target_dir = Path(output_dir).expanduser() if output_dir else DEFAULT_OUTPUT_DIR
        return {
            "video": target_dir / f"{prefix}{ASSET_EXTENSIONS['video']}",
            "audio": target_dir / f"{prefix}{ASSET_EXTENSIONS['audio']}",
            "cover": target_dir / f"{prefix}{ASSET_EXTENSIONS['cover']}",
        }

    if output:
        return {command: Path(output).expanduser()}

    return {command: DEFAULT_OUTPUT_DIR / f"{prefix}{ASSET_EXTENSIONS[command]}"}


def collect_download_sources(output: dict) -> dict[str, str | None]:
    return {
        "video": output.get("play_url") or output.get("download_url"),
        "audio": output.get("audio_url"),
        "cover": output.get("cover_url"),
    }


def download_assets(command: str, output: dict, page_url: str, args) -> None:
    aweme_id = output.get("aweme_id") or "unknown"
    plan = build_download_plan(command, aweme_id, getattr(args, "output", None), getattr(args, "output_dir", None))
    sources = collect_download_sources(output)

    for asset_type, path in plan.items():
        source_url = sources.get(asset_type)
        if not source_url:
            raise RuntimeError(f"详情里没有可下载的{asset_type}地址")
        download_file(source_url, page_url or "https://www.douyin.com/", path)
        output["downloaded_paths"][asset_type] = str(path)


def main():
    args = parse_args()
    normalized_url, resolved_url, page_url, detail = fetch_detail(args.url, args.timeout)
    output = normalize_output(args.url, normalized_url, resolved_url, page_url, detail)

    if args.raw:
        raw_path = Path(args.raw).expanduser()
        ensure_parent(raw_path)
        raw_path.write_text(json.dumps(detail, ensure_ascii=False, indent=2), encoding="utf-8")

    download_assets(args.command, output, page_url, args)

    if args.json_output:
        print(json.dumps(output, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    try:
        main()
    except urllib.error.HTTPError as exc:
        print(json.dumps({"ok": False, "error": f"HTTP {exc.code}: {exc.reason}"}), file=sys.stderr)
        sys.exit(1)
    except Exception as exc:
        print(json.dumps({"ok": False, "error": str(exc)}, ensure_ascii=False), file=sys.stderr)
        sys.exit(1)
