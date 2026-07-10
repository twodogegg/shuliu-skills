# Repository Guidelines

## Project Structure & Module Organization
This repository is a Claude Code skills marketplace currently focused on:
- `banana-proxy`: Gemini image generation via Banana proxy.
- `geek-image`: GeekAI image generation via geekai.co.
- `ecommerce-images`: Workflow skill to generate ecommerce product main/detail images by orchestrating existing image generation skills.
- `multi-image-consistency`: Prompt workflow skill for multi-image generation projects that need strong cross-image consistency.
- `sora-video`: Sora video generation via lnapi.com.
- `douyin-share-info`: Fetch Douyin basic info from share URLs via TikHub Web API.
- `douyin-video-fetch`: Fetch Douyin video detail data from video/share URLs and optionally download the video file.
- `video-analysis`: Analyze public video URLs through GeekAI's OpenAI-compatible video chat API.
- `video-viral-analysis`: Analyze short-video viral potential, performance data, bottlenecks, and reusable content templates.
- `wechat-mp-scraper`: Scrape public WeChat article pages, export HTML/content/assets, and analyze animation clues.
- `feishu-user-auth`: Feishu user OAuth/device-flow authorization, scope top-up, and token reuse.
- `feishu-bitable`: Feishu Bitable operations for records, fields, views, permissions, formulas, and links.
- `feishu-approval`: Feishu native approval documentation skill covering approval definitions, form controls, external options, approval instances, and troubleshooting.
- `feishu-card`: Feishu interactive card documentation skill covering card JSON structure, sending, callbacks, and updates.
- `xhs-text2image`: Xiaohongshu text-to-image automation skill for logged-in creator sessions, theme switching, and bundled theme preview assets.
- `skills-manager`: Skills CLI management helper for listing, finding, installing, removing, updating, restoring, and syncing skills, including local-path installs.
- `newapi`: User-side NewAPI skill for models, groups, balance, tokens, and secure token application flows.
- `newapi-admin`: Admin-side NewAPI backend management skill for channels, users, groups, quotas, logs, auth, and system options.
- `short-drama`: End-to-end vertical short-drama workflow for planning, characters, episode writing, review, compliance, localization, and export.

- `.claude-plugin/marketplace.json`: marketplace metadata, plugin groups, and skill registration.
- `skills/banana-proxy/SKILL.md`: user-facing skill contract and usage docs.
- `skills/banana-proxy/scripts/main.ts`: CLI entrypoint for prompt parsing, env loading, single/batch generation.
- `skills/banana-proxy/scripts/providers/google.ts`: Banana proxy Gemini provider implementation.
- `skills/banana-proxy/scripts/types.ts`: shared TypeScript types.
- `skills/geek-image/SKILL.md`: user-facing skill contract and usage docs.
- `skills/geek-image/scripts/main.ts`: CLI entrypoint for GeekAI image generation.
- `skills/geek-image/scripts/providers/geekai.ts`: GeekAI provider implementation.
- `skills/geek-image/scripts/types.ts`: shared TypeScript types.
- `skills/ecommerce-images/SKILL.md`: user-facing skill contract and usage docs for ecommerce images.
- `skills/multi-image-consistency/SKILL.md`: user-facing skill contract for style-anchor and matched-prompt workflows.
- `skills/multi-image-consistency/references/*.md`: output template and consistency playbook for multi-image prompt sets.
- `skills/sora-video/SKILL.md`: user-facing skill contract.
- `skills/sora-video/scripts/main.ts`: CLI entrypoint.
- `skills/sora-video/scripts/providers/lnapi.ts`: Lnapi.com provider implementation.
- `skills/douyin-share-info/SKILL.md`: user-facing skill contract and extraction rules for Douyin share parsing.
- `skills/douyin-share-info/scripts/main.ts`: CLI entrypoint for TikHub API calls and normalized output.
- `skills/douyin-video-fetch/SKILL.md`: user-facing skill contract for fetching Douyin video info and downloading files.
- `skills/douyin-video-fetch/scripts/fetch_douyin_video.py`: Python CLI entrypoint for browser-based Douyin detail capture and download.
- `skills/video-analysis/SKILL.md`: user-facing skill contract for GeekAI/OpenAI-compatible video analysis.
- `skills/video-analysis/scripts/analyze_video.py`: Python CLI entrypoint for public video URL analysis and transcript-style prompting.
- `skills/video-viral-analysis/SKILL.md`: user-facing skill contract for data-aware short-video viral analysis.
- `skills/wechat-mp-scraper/SKILL.md`: user-facing skill contract for WeChat public-account article scraping.
- `skills/wechat-mp-scraper/scripts/scrape_wechat_mp.py`: Python CLI entrypoint for HTML/content/resource extraction.
- `skills/wechat-mp-scraper/references/output-format.md`: output field reference for generated report/content/resource files.
- `skills/wechat-mp-scraper/examples/hermes-openclaw/content.md`: checked-in sample Markdown export with local image assets for viewer compatibility checks.
- `skills/feishu-user-auth/SKILL.md`: user-facing skill contract and Feishu auth workflow.
- `skills/feishu-user-auth/scripts/run-auth.js`: CLI entrypoint for auth/system-token/refresh/show/remove flows.
- `skills/feishu-user-auth/scripts/src/*.js`: OAuth, token store, and scope resolution implementation.
- `skills/feishu-user-auth/config.json`: local skill config template (`appId`, `appSecret`, `brand`).
- `skills/feishu-bitable/SKILL.md`: user-facing skill contract for Feishu Bitable workflows.
- `skills/feishu-bitable/references/fields.md`: field type and `property` reference guide for Bitable field operations.
- `skills/feishu-approval/SKILL.md`: user-facing skill contract for Feishu native approval workflows.
- `skills/feishu-approval/references/*.md`: approval definition, form control, external option, instance, and troubleshooting references.
- `skills/feishu-card/SKILL.md`: user-facing skill contract for Feishu interactive card workflows.
- `skills/feishu-card/references/*.json`: reusable card templates for alert, briefing, and skill-test messages.
- `skills/xhs-text2image/SKILL.md`: user-facing skill contract for Xiaohongshu text-to-image generation, theme updates, and preview catalog routing.
- `skills/xhs-text2image/scripts/xhs_text2image.py`: Python CLI entrypoint for create/update/download/status/themes/catalog flows.
- `skills/xhs-text2image/theme_catalog/`: bundled overview image, manifest, and per-theme sample images for fast customer previews.
- `skills/skills-manager/SKILL.md`: user-facing skill contract for managing installed skills through the `skills` CLI.
- `skills/newapi/SKILL.md`: user-facing skill contract for user-side NewAPI queries and secure token workflows.
- `skills/newapi/docs/*.md`: action routing, setup, and help docs for the `newapi` skill.
- `skills/newapi/scripts/*.js`: runtime helpers for NewAPI API calls, token copying, secure config injection, and command execution.
- `skills/newapi-admin/SKILL.md`: user-facing skill contract for NewAPI backend administration.
- `skills/newapi-admin/references/*.md|json`: backend endpoint coverage and auth summary references for `newapi-admin`.
- `skills/newapi-admin/scripts/api.js`: CLI wrapper for authenticated NewAPI admin API access.
- `skills/short-drama/SKILL.md`: compact workflow entry and stage routing for short-drama creation.
- `skills/short-drama/agents/openai.yaml`: Codex-facing display metadata and default prompt.
- `skills/short-drama/references/*.md`: project workflow, screenplay formats, genre, opening, rhythm, hook, paywall, satisfaction, villain, and compliance guidance.
- `README.md` / `README.zh.md`: install and update instructions.
- `CHANGELOG.md` / `CHANGELOG.zh.md`: release notes.

## Build, Test, and Development Commands
No build step is required; scripts run directly with Bun.

- Install skill from GitHub:
  - `npx skills add https://github.com/twodogegg/shuliu-skills --skill banana-proxy`
  - `npx skills add https://github.com/twodogegg/shuliu-skills --skill geek-image`
  - `npx skills add https://github.com/twodogegg/shuliu-skills --skill ecommerce-images`
  - `npx skills add https://github.com/twodogegg/shuliu-skills --skill multi-image-consistency`
  - `npx skills add https://github.com/twodogegg/shuliu-skills --skill sora-video`
  - `npx skills add https://github.com/twodogegg/shuliu-skills --skill douyin-share-info`
  - `npx skills add https://github.com/twodogegg/shuliu-skills --skill douyin-video-fetch`
  - `npx skills add https://github.com/twodogegg/shuliu-skills --skill video-analysis`
  - `npx skills add https://github.com/twodogegg/shuliu-skills --skill video-viral-analysis`
  - `npx skills add https://github.com/twodogegg/shuliu-skills --skill wechat-mp-scraper`
  - `npx skills add https://github.com/twodogegg/shuliu-skills --skill feishu-user-auth`
  - `npx skills add https://github.com/twodogegg/shuliu-skills --skill feishu-bitable`
  - `npx skills add https://github.com/twodogegg/shuliu-skills --skill feishu-approval`
  - `npx skills add https://github.com/twodogegg/shuliu-skills --skill feishu-card`
  - `npx skills add https://github.com/twodogegg/shuliu-skills --skill xhs-text2image`
  - `npx skills add https://github.com/twodogegg/shuliu-skills --skill skills-manager`
  - `npx skills add https://github.com/twodogegg/shuliu-skills --skill newapi`
  - `npx skills add https://github.com/twodogegg/shuliu-skills --skill newapi-admin`
  - `npx skills add https://github.com/twodogegg/shuliu-skills --skill short-drama`
- Run local generation:
  - `npx -y bun skills/banana-proxy/scripts/main.ts --prompt "A cat" --image out.jpg`
  - `npx -y bun skills/geek-image/scripts/main.ts --prompt "A cat" --image out.png`
- Run local video generation:
  - `npx -y bun skills/sora-video/scripts/main.ts --prompt "A running dog" --output video.mp4`
- Run local Douyin share parsing:
  - `npx -y bun skills/douyin-share-info/scripts/main.ts --share-url "https://v.douyin.com/xxxx/" --json`
- Run local Douyin video fetch/download:
  - `python3 skills/douyin-video-fetch/scripts/fetch_douyin_video.py video --url "https://www.douyin.com/video/7624937951562091782"`
- Run local video analysis:
  - `python3 skills/video-analysis/scripts/analyze_video.py --video-url "https://example.com/video.mp4" --model "qwen3.6-plus"`
- Use local viral analysis skill:
  - Load `skills/video-viral-analysis/SKILL.md` and analyze with available video content plus optional playback/interaction data.
- Run local WeChat article scraping:
  - `python3 skills/wechat-mp-scraper/scripts/scrape_wechat_mp.py "https://mp.weixin.qq.com/s/xxxx" --output-dir ~/wechat-mp-scraper-runs`
- Run local WeChat article Markdown-only export:
  - `python3 skills/wechat-mp-scraper/scripts/scrape_wechat_mp.py "https://mp.weixin.qq.com/s/xxxx" --mode markdown --output-dir ~/wechat-mp-scraper-runs`
- Run local Feishu user auth flow:
  - Installed skill usage in a project: `./.agents/skills/feishu-user-auth/bin/feishu-auth.js auth`
  - Installed skill usage after `-g`: `~/.agents/skills/feishu-user-auth/bin/feishu-auth.js auth`
  - Repo-local debugging from repository root: `node skills/feishu-user-auth/scripts/run-auth.js auth`
  - Repo-local debugging from repository root: `node skills/feishu-user-auth/scripts/run-auth.js system-token`
  - Repo-local debugging from repository root: `node skills/feishu-user-auth/scripts/run-auth.js show-token`
- Run Feishu system-token retrieval for card sending:
  - Preferred: `feishu-auth system-token`
  - Installed skill path fallback: `./.agents/skills/feishu-user-auth/bin/feishu-auth.js system-token`
  - Installed skill path fallback after `-g`: `~/.agents/skills/feishu-user-auth/bin/feishu-auth.js system-token`
- Run local Xiaohongshu text-to-image generation:
  - `python3 skills/xhs-text2image/scripts/xhs_text2image.py create --port 9444 --text "小红书主题测试" --theme 科技`
  - `python3 skills/xhs-text2image/scripts/xhs_text2image.py catalog --port 9444 --text "小红书主题测试"`
- Run local NewAPI user-side actions:
  - `node skills/newapi/scripts/api.js models`
  - `node skills/newapi/scripts/api.js balance`
  - `node skills/newapi/scripts/inject-key.js --scan /path/to/config.json`
  - `node skills/newapi/scripts/exec-token.js <token-id> openai api models.list`
- Run local NewAPI admin API calls:
  - `node skills/newapi-admin/scripts/api.js GET /api/channel/`
  - `node skills/newapi-admin/scripts/api.js GET /api/pricing`
- Batch generation:
  - `npx -y bun skills/banana-proxy/scripts/main.ts --batch jobs.jsonl --concurrency 4`
- Validate tracked changes before commit:
  - `git status --short`

## Coding Style & Naming Conventions
- Language: TypeScript (ESM), Node built-ins, async/await.
- Indentation: 2 spaces; keep code and docs ASCII unless non-ASCII is required.
- Naming:
  - skill folder: kebab-case (e.g., `banana-proxy`)
  - script files: lowercase (`main.ts`, `types.ts`)
  - types/interfaces: PascalCase (`CliArgs`)
  - variables/functions: camelCase
- Keep CLI flags stable (`--prompt`, `--image`, `--batch`, `--concurrency`).
- For `douyin-share-info`, keep API extraction paths stable:
  - cover: `data.aweme_detail.video.origin_cover.url_list[0]`
  - audio: `data.aweme_detail.music.play_url.url_list[0]`
  - video: `data.aweme_detail.video.bit_rate[i].play_addr.url_list[0]`

## Testing Guidelines
There is no formal test suite yet. Validate behavior with smoke tests:

1. Run one single-image command and confirm output file creation.
2. Run one GeekAI single-image command and confirm output file creation.
3. Run one batch JSONL command and confirm mixed success/failure handling.
4. Verify required env var behavior (`LNAPI_KEY` and `GEEKAI_API_KEY` missing should fail clearly).
5. Run one Douyin share-url command and confirm normalized JSON fields are present.
6. Verify required env var behavior (`TIKHUB_API_KEY` missing should fail clearly).
7. Run one Douyin video-fetch command against a real video URL and confirm `aweme_id`, `play_url`, `statistics.view_count`, and optional `downloaded_paths` are present.
8. Run one video-analysis command against a public video URL and confirm `content` plus `usage` are returned.
9. Run one video-viral-analysis pass with data and one without data; confirm the output switches between data attribution and content-only prediction.
10. Run one Xiaohongshu `create` command against a logged-in browser session and confirm `download_path` is returned.
11. Run one Xiaohongshu `catalog` command and confirm `theme_catalog/overview.jpg` plus per-theme images are created.
12. Validate `skills/short-drama` with the Codex `skill-creator` `quick_validate.py` script and confirm every referenced Markdown file exists.

When adding tests later, place them under each skill path (for example `skills/banana-proxy/tests/` or `skills/douyin-share-info/tests/`) and name files `*.test.ts`.

## Commit & Pull Request Guidelines
- Use Conventional Commits as seen in history:
  - `feat(skills): ...`
  - `docs(readme): ...`
- Keep commits scoped and atomic (docs vs scripts vs marketplace config).
- **Tag on every commit**: each commit must create and push a Git tag (for example: `v0.1.3` or `release-2026-02-17-1`).
- **Changelog required**: every code change must update both `CHANGELOG.md` and `CHANGELOG.zh.md` with what changed in that update.
- **Sync AGENTS.md on skill changes**: if a new skill is added or skill structure/path changes, update `AGENTS.md` in the same change set.
- PRs should include:
  - purpose and summary of changes
  - affected files/paths
  - sample command output or screenshots when behavior changes
  - changelog update if user-facing behavior changes

### Release Checklist (Required)
1. Update code and docs.
2. Update `CHANGELOG.md` and `CHANGELOG.zh.md`.
3. If skills or skill structure changed, update `AGENTS.md`.
4. Commit with Conventional Commit message.
5. Create tag for that commit and push commit + tag.

## Security & Configuration Tips
- Never hardcode secrets; use `LNAPI_KEY`.
- Never hardcode secrets; use `LNAPI_KEY`, `GEEKAI_API_KEY`, and `TIKHUB_API_KEY`.
- Never commit real Feishu credentials or token cache; keep `skills/feishu-user-auth/config.json` as template values only and store runtime tokens under `~/.feishu-auth/`.
- Review `marketplace.json` version and skill paths before release.
- Keep provider base URL and API behavior changes documented in `SKILL.md` and changelogs.
