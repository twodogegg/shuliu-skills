import json
import sys
from pathlib import Path


SCRIPT_DIR = Path(__file__).resolve().parents[1] / "scripts"
sys.path.insert(0, str(SCRIPT_DIR))

import scrape_wechat_mp  # noqa: E402


HTML = """<!doctype html>
<html>
<head>
  <meta property="og:title" content="测试标题">
  <meta name="description" content="测试摘要">
</head>
<body>
  <a id="js_name">测试作者</a>
  <em id="publish_time">2026-05-13</em>
  <div id="js_content">
    <p>第一段正文</p>
    <h2>小标题</h2>
    <p>第二段正文</p>
    <img data-src="https://mmbiz.qpic.cn/test.png" alt="示例图">
  </div>
</body>
</html>
"""


def test_markdown_mode_only_writes_content_outputs(tmp_path, monkeypatch, capsys):
    monkeypatch.setattr(scrape_wechat_mp, "fetch_text", lambda url: HTML)
    monkeypatch.setattr(
        sys,
        "argv",
        [
            "scrape_wechat_mp.py",
            "https://mp.weixin.qq.com/s/example",
            "--mode",
            "markdown",
            "--output-dir",
            str(tmp_path),
        ],
    )

    scrape_wechat_mp.main()

    payload = json.loads(capsys.readouterr().out)
    output_dir = Path(payload["output_dir"])

    assert payload["status"] == "ok"
    assert payload["mode"] == "markdown"
    assert (output_dir / "content.md").exists()
    assert (output_dir / "content.json").exists()
    assert not (output_dir / "article.html").exists()
    assert not (output_dir / "report.md").exists()
    assert not (output_dir / "urls.json").exists()
    assert not (output_dir / "assets").exists()
    assert not (output_dir / "snippets").exists()

    markdown = (output_dir / "content.md").read_text(encoding="utf-8")
    assert "# 测试标题" in markdown
    assert "第一段正文" in markdown
    assert "![示例图](https://mmbiz.qpic.cn/test.png)" in markdown


def test_markdown_only_alias_selects_markdown_mode(tmp_path, monkeypatch, capsys):
    monkeypatch.setattr(scrape_wechat_mp, "fetch_text", lambda url: HTML)
    monkeypatch.setattr(
        sys,
        "argv",
        [
            "scrape_wechat_mp.py",
            "https://mp.weixin.qq.com/s/example",
            "--markdown-only",
            "--output-dir",
            str(tmp_path),
        ],
    )

    scrape_wechat_mp.main()

    payload = json.loads(capsys.readouterr().out)
    output_dir = Path(payload["output_dir"])

    assert payload["mode"] == "markdown"
    assert (output_dir / "content.md").exists()
    assert not (output_dir / "assets").exists()
