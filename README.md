# shuliu-skills

English | [中文](./README.zh.md)

Local skills marketplace following the `jimliu/baoyu-skills` structure.

## Claude Code Plugin Marketplace

Add this repository as a Claude Code plugin marketplace, then install the plugins you need.

### Install from inside Claude Code

```text
/plugin marketplace add twodogegg/shuliu-skills
```

Install one or more plugins:

```text
/plugin install image-generation-skills@shuliu-skills
/plugin install douyin-tools@shuliu-skills
/plugin install video-analysis-tools@shuliu-skills
/plugin install wechat-tools@shuliu-skills
/plugin install feishu-tools@shuliu-skills
/plugin install newapi-tools@shuliu-skills
/plugin install short-drama-tools@shuliu-skills
/plugin install apifox-tools@shuliu-skills
```

Run `/reload-plugins` after installation to load the newly installed plugins without restarting Claude Code.

You can also run the same operations directly from your terminal:

```bash
claude plugin marketplace add twodogegg/shuliu-skills
claude plugin install image-generation-skills@shuliu-skills
```

Use `/plugin` inside Claude Code to browse, enable, disable, update, or uninstall plugins from the marketplace.

## Installation

```bash
npx skills add https://github.com/twodogegg/shuliu-skills --skill ecommerce-images
npx skills add https://github.com/twodogegg/shuliu-skills --skill multi-image-consistency
npx skills add https://github.com/twodogegg/shuliu-skills --skill visual-style-extractor
npx skills add https://github.com/twodogegg/shuliu-skills --skill douyin-share-info
npx skills add https://github.com/twodogegg/shuliu-skills --skill douyin-video-fetch
npx skills add https://github.com/twodogegg/shuliu-skills --skill video-analysis
npx skills add https://github.com/twodogegg/shuliu-skills --skill wechat-mp-scraper
npx skills add https://github.com/twodogegg/shuliu-skills --skill feishu-bitable
npx skills add https://github.com/twodogegg/shuliu-skills --skill feishu-approval
npx skills add https://github.com/twodogegg/shuliu-skills --skill newapi
npx skills add https://github.com/twodogegg/shuliu-skills --skill newapi-admin
npx skills add https://github.com/twodogegg/shuliu-skills --skill short-drama
npx skills add https://github.com/twodogegg/shuliu-skills --skill apifox-doc-import
```

## Update Skill

When the skill is updated in this repository, reinstall the latest version:

```bash
npx skills add https://github.com/twodogegg/shuliu-skills --skill ecommerce-images
npx skills add https://github.com/twodogegg/shuliu-skills --skill multi-image-consistency
npx skills add https://github.com/twodogegg/shuliu-skills --skill visual-style-extractor
npx skills add https://github.com/twodogegg/shuliu-skills --skill douyin-share-info
npx skills add https://github.com/twodogegg/shuliu-skills --skill douyin-video-fetch
npx skills add https://github.com/twodogegg/shuliu-skills --skill video-analysis
npx skills add https://github.com/twodogegg/shuliu-skills --skill wechat-mp-scraper
npx skills add https://github.com/twodogegg/shuliu-skills --skill feishu-bitable
npx skills add https://github.com/twodogegg/shuliu-skills --skill feishu-approval
npx skills add https://github.com/twodogegg/shuliu-skills --skill newapi
npx skills add https://github.com/twodogegg/shuliu-skills --skill newapi-admin
npx skills add https://github.com/twodogegg/shuliu-skills --skill short-drama
npx skills add https://github.com/twodogegg/shuliu-skills --skill apifox-doc-import
```

## Available Plugins

| Plugin | Description | Skills |
|--------|-------------|--------|
| **image-generation-skills** | Image generation workflows | [ecommerce-images](#ecommerce-images), [multi-image-consistency](#multi-image-consistency), [visual-style-extractor](#visual-style-extractor) |
| **douyin-tools** | Douyin video parsing and download | [douyin-share-info](#douyin-share-info), [douyin-video-fetch](#douyin-video-fetch) |
| **video-analysis-tools** | Video analysis and transcript workflows | [video-analysis](#video-analysis) |
| **wechat-tools** | WeChat public account article scraping | [wechat-mp-scraper](#wechat-mp-scraper) |
| **feishu-tools** | Feishu native approval and Bitable operations | [feishu-bitable](#feishu-bitable), [feishu-approval](#feishu-approval) |
| **newapi-tools** | NewAPI end-user queries and admin management | [newapi](#newapi), [newapi-admin](#newapi-admin) |
| **short-drama-tools** | End-to-end vertical short-drama screenwriting workflow | [short-drama](#short-drama) |
| **apifox-tools** | Convert local or online documents into Apifox API definitions | [apifox-doc-import](#apifox-doc-import) |

## Available Skills

### douyin-share-info

Fetch Douyin basic info from share URL via TikHub Douyin Web API, and extract first cover/audio/video URL.

```bash
npx -y bun skills/douyin-share-info/scripts/main.ts --share-url "https://v.douyin.com/xxxx/" --json
```

Environment variable:

- `TIKHUB_API_KEY` (required)

### douyin-video-fetch

Browser-based Douyin video fetching for video pages, jingxuan pages, or share URLs, with subcommands for video, audio, cover, or all assets.

```bash
python3 skills/douyin-video-fetch/scripts/fetch_douyin_video.py \
  video \
  --url "https://www.douyin.com/video/7624937951562091782" \
  --output /tmp/douyin-7624937951562091782.mp4
```

Key output fields:

- `aweme_id`
- `desc`
- `author`
- `normalized_url`
- `cover_url`
- `audio_url`
- `play_url`
- `download_url`
- `downloaded_paths`

Additional examples:

```bash
python3 skills/douyin-video-fetch/scripts/fetch_douyin_video.py \
  audio \
  --url "https://www.douyin.com/jingxuan?modal_id=7603361114428050722" \
  --output /tmp/douyin-7603361114428050722.mp3
```

```bash
python3 skills/douyin-video-fetch/scripts/fetch_douyin_video.py \
  all \
  --url "https://v.douyin.com/xxxx/" \
  --output-dir /tmp/douyin-assets
```

### video-analysis

Send a public video URL into GeekAI's OpenAI-compatible video API and return analysis, transcript-style output, and usage stats.

```bash
python3 skills/video-analysis/scripts/analyze_video.py \
  --video-url "https://example.com/video.mp4" \
  --model "qwen3.6-plus"
```

It can also read the JSON output from `douyin-video-fetch`:

```bash
python3 skills/video-analysis/scripts/analyze_video.py \
  --video-info-json /tmp/douyin-detail.json
```

Environment variables:

- `GEEKAI_API_KEY` (required)
- `GEEKAI_BASE_URL` (optional, default `https://geekai.co/api/v1`)

Notes:

- The upstream model service must be able to fetch the video URL directly.
- Temporary Douyin hotlinks may be blocked for third-party fetches; if that happens, switch to a stable public URL.

### wechat-mp-scraper

Scrape and analyze publicly accessible WeChat public-account article pages.

```bash
python3 skills/wechat-mp-scraper/scripts/scrape_wechat_mp.py \
  "https://mp.weixin.qq.com/s/xxxx" \
  --output-dir ~/wechat-mp-scraper-runs
```

To export only article body Markdown and JSON without downloading assets:

```bash
python3 skills/wechat-mp-scraper/scripts/scrape_wechat_mp.py \
  "https://mp.weixin.qq.com/s/xxxx" \
  --mode markdown \
  --output-dir ~/wechat-mp-scraper-runs
```

Outputs include:

- `article.html`
- `content.md`
- `content.json`
- `report.md`
- `urls.json`
- downloaded assets and animation snippets

### ecommerce-images

Workflow skill for generating ecommerce product main images and detail images from a user-provided product image.

- Supports: `main` / `detail` / `both`
- Detail images are generated as a set, and the skill asks the user how many detail images are needed before execution
- Default aspect ratio: main image `1:1`, detail images `3:4`
- Uses `baoyu-image-gen`
- Supports human-friendly style names

Use this skill by asking in natural language, for example:
- "Generate ecommerce main image and detail image from `/path/product.png`"
- "Generate 5 detail images in specification-focused style"

### multi-image-consistency

Prompt workflow skill for multi-image projects that need visual continuity across a series.

- Creates a master style anchor first, then matched follow-on prompts
- Useful for UI screen sets, comics, storyboards, campaign series, character sheets, and illustration packs
- Preserves stable characters, settings, palette, typography feel, props, and visual language across images

Use this skill by providing a PRD, storyboard, script, campaign brief, or image list, for example:
- "Turn this storyboard into consistent image-generation prompts"
- "Build prompts for 8 matching product UI screenshots from this PRD"

### visual-style-extractor

Extract reusable visual rules from one or more reference images and turn them into copy-ready Chinese prompts.

- Separates replaceable subject content from reusable composition, color, lighting, material, typography, and mood
- Supports general style extraction, new-image prompts, multiple references, and precise edits that lock everything else
- Includes a static SVG icon and concise output examples

Use it with natural language, for example:

- "Extract the reusable style from this poster and make the subject replaceable"
- "Use image 1's composition and image 2's metal texture to write a prompt"
- "Change only the grass into a professional football pitch and keep everything else unchanged"

### feishu-bitable

Feishu Bitable workflow skill for records CRUD, field management, views, permissions, formulas, and linked tables.

- Use in natural language, for example:
  - "Create a new Bitable base and add me as a collaborator"
  - "Insert 20 records into this table"
  - "Add a currency field and a linked-record field"
- The skill keeps core guidance in `SKILL.md` and only reads `references/fields.md` when the task needs `type / ui_type / property` decisions.

### feishu-approval

Documentation-first skill for Feishu native approvals, covering approval definitions, form controls, external options, approval instances, and troubleshooting.

- Trigger it with natural language, for example:
  - "How should form_content be written for a Feishu approval definition?"
  - "Help me write a radioV2 control backed by external options"
  - "How do I pass dateInterval when creating an approval instance?"
- "What does approval code not found mean?"
- This skill intentionally ships without scripts and focuses on turning official approval docs into precise field explanations and ready-to-use JSON fragments.

### newapi

Documentation-and-script skill for the open-source `new-api` unified gateway.

- Covers user-side model, group, balance, and token operations
- Includes secure token utilities for clipboard copy, config injection, and command execution without exposing real `sk-` values
- Requires using the bundled scripts instead of handwritten `curl`

Common actions:

```bash
/newapi models
/newapi balance
/newapi tokens
/newapi create-token my-key --group=default
/newapi copy-token 12
/newapi apply-token 12 ~/.codex/auth.json
/newapi exec-token 12 openai api models.list
```

Notes:

- Read `skills/newapi/docs/setup.md` on first use
- Do not print token values in chat, logs, files, or shell arguments
- Use `scan-config` for best-effort redacted config inspection

### newapi-admin

Admin-side NewAPI backend management skill for channels, users, models, groups, quotas, logs, options, auth, and payments.

- Uses the bundled `scripts/api.js` wrapper for login, session reuse, masking, and `New-Api-User` header injection
- Intended for explicit backend administration tasks only
- Supports repository-local or installed-skill execution

Run examples:

```bash
node skills/newapi-admin/scripts/api.js GET /api/channel/
node skills/newapi-admin/scripts/api.js GET /api/user/self
node skills/newapi-admin/scripts/api.js GET /api/pricing
node skills/newapi-admin/scripts/api.js POST /api/channel/test '{"id":3,"model":"gpt-image-2"}'
```

Notes:

- Configure `NEWAPI_ADMIN_BASE_URL`, `NEWAPI_ADMIN_USERNAME`, `NEWAPI_ADMIN_PASSWORD`, `NEWAPI_ADMIN_USER_ID`, and optional `NEWAPI_ADMIN_ACCESS_TOKEN` in the skill-local `.env`
- Do not expose passwords, sessions, access tokens, or channel keys
- When editing channels, fetch the full object first and change only the minimum required fields

### short-drama

End-to-end vertical short-drama screenwriting workflow.

- Covers topic selection, story planning, character design, episode outlines, screenplay writing, quality review, compliance review, overseas localization, and full-script export
- Restores progress from project files and loads only the references required for the current stage
- Supports natural-language requests, `$short-drama`, and legacy aliases such as `/start`, `/plan`, and `/episode 1`

Example:

```text
Use $short-drama to create a 60-episode urban revenge drama for a female audience.
```

### apifox-doc-import

Convert Markdown, TXT, HTML, PDF, DOCX, or online documents into OpenAPI 3.0 plus at least one project Markdown usage guide, preserve required, enum, range, file, and combination constraints, and import both with Apifox CLI after completeness checks. Target project, branch, and Apifox API folder preferences are read from `~/.shuliu-skills/apifox-doc-import/EXTEND.md`; missing preferences are requested before offering to save them.

```text
Use $apifox-doc-import to convert this online PRD into an Apifox API document.
```
