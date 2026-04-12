#!/usr/bin/env python3
from __future__ import annotations
import argparse
import json
import os
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


def parse_args():
    parser = argparse.ArgumentParser(description="抓取抖音视频详情并可下载视频文件")
    parser.add_argument("--url", "--share-url", dest="url", required=True, help="抖音视频页链接或分享链接")
    parser.add_argument("--download", action="store_true", help="下载视频文件")
    parser.add_argument("--output", help="下载文件路径，默认 /tmp/douyin-<aweme_id>.mp4")
    parser.add_argument("--raw", help="保存原始 aweme/detail JSON")
    parser.add_argument("--json", action="store_true", dest="json_output", default=True, help="输出 JSON")
    parser.add_argument("--timeout", type=int, default=30, help="超时时间，单位秒，默认 30")
    return parser.parse_args()


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
    return None


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


def normalize_output(input_url: str, resolved_url: str, page_url: str, detail: dict) -> dict:
    aweme = detail.get("aweme_detail") or {}
    video = aweme.get("video") or {}
    music = aweme.get("music") or {}
    author = aweme.get("author") or {}
    play_url, download_url = extract_video_urls(video)

    return {
        "input_url": input_url,
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
        "downloaded_path": None,
    }


def fetch_detail(input_url: str, timeout_seconds: int) -> tuple[str, str, dict]:
    resolved_url = follow_redirects(input_url)
    target_aweme_id = extract_aweme_id(resolved_url)
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

    return resolved_url, page_url, captured["detail"]


def ensure_parent(path: Path):
    path.parent.mkdir(parents=True, exist_ok=True)


def download_video(url: str, referer: str, output_path: Path):
    ensure_parent(output_path)
    request = urllib.request.Request(url, headers={"User-Agent": UA, "Referer": referer})
    with urllib.request.urlopen(request, timeout=60) as response:
        with output_path.open("wb") as fh:
            fh.write(response.read())


def main():
    args = parse_args()
    resolved_url, page_url, detail = fetch_detail(args.url, args.timeout)
    output = normalize_output(args.url, resolved_url, page_url, detail)

    if args.raw:
        raw_path = Path(args.raw).expanduser()
        ensure_parent(raw_path)
        raw_path.write_text(json.dumps(detail, ensure_ascii=False, indent=2), encoding="utf-8")

    if args.download:
        download_url = output.get("play_url") or output.get("download_url")
        if not download_url:
            raise RuntimeError("详情里没有可下载的视频地址")
        aweme_id = output.get("aweme_id") or "unknown"
        output_path = Path(args.output).expanduser() if args.output else Path(f"/tmp/douyin-{aweme_id}.mp4")
        download_video(download_url, page_url or "https://www.douyin.com/", output_path)
        output["downloaded_path"] = str(output_path)

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
