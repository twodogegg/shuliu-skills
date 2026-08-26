# Changelog

### Changes
- Fix `issue-to-pr` YAML frontmatter by quoting the description containing colons and non-ASCII punctuation, so the skill can be parsed and installed locally by the `skills` CLI.
- Strengthen `issue-to-pr`: when an issue contains images, screenshots, video frames, or attachments, inspect them in practice and record the reproduction evidence; require PRs to explain why the change was made and its expected impact.
- Add `issue-to-pr` for the end-to-end GitHub issue workflow: claim and understand an issue, create an isolated branch, implement the fix or feature, validate it, commit, push, and open a focused pull request; register a new `development-tools` plugin group and bump the marketplace version to `0.2.30`.
- Add a `short-drama-poster` preset, reusable 9:16 prompt template, and visual rules to `ai-cover-prompt-builder`, covering romance, fantasy comeback, rule-thriller, and racing drama posters with safe character guidance.
- Add `apifox-doc-import` for converting local or online Markdown, TXT, HTML, PDF, and DOCX sources into validated OpenAPI 3.0 and importing them through Apifox CLI using explicit or saved preferences.
- Add deterministic OpenAPI completeness metrics and register `./skills/apifox-doc-import` in the new `apifox-tools` plugin group; bump the marketplace version to `0.2.29`.
- Strengthen `apifox-doc-import` with pre-import collision checks and post-import verification for environments and endpoint authentication bindings.
- Prefer documentation-site `.md`, `llms.txt`, and published OpenAPI files before browser extraction.
- Change `apifox-doc-import` delivery semantics to load Apifox project, branch, and API-folder preferences from `~/.shuliu-skills/apifox-doc-import/EXTEND.md`, request and optionally save missing values, and require successful post-import readback for completion.
- Require `apifox-doc-import` to create at least one Apifox project Markdown usage guide with every interface import and verify its name, content, and folder by readback.
- Add parameter-constraint coverage rules and metrics to `apifox-doc-import`, requiring preservation and post-import verification of required, enum, range, media format/size/dimension/duration, dependency, and mutual-exclusion rules.
- Add the `visual-style-extractor` skill for extracting reusable visual rules from reference images and producing copy-ready generation or precise-edit prompts.
- Register `./skills/visual-style-extractor` in `image-generation-skills` and bump the marketplace version to `0.2.28`.
- Remove the `sora-video`, `banana-proxy`, `geek-image`, `feishu-card`, `xhs-text2image`, and `feishu-user-auth` skills.
- Remove the empty `video-generation-skills` and `xiaohongshu-tools` plugin groups, prune the remaining marketplace registrations, and bump the marketplace version to `0.2.27`.
- Update `ecommerce-images` to use `baoyu-image-gen` directly after removing `banana-proxy`.
- Add the `short-drama` skill for end-to-end vertical drama development across topic selection, planning, characters, episode outlines, screenplay writing, review, compliance, overseas localization, and export.
- Add the `short-drama-tools` plugin group, register `./skills/short-drama`, and bump `.claude-plugin/marketplace.json` metadata version to `0.2.26`.
- Add new skill `newapi` for user-side NewAPI model, group, balance, token, and secure token-application workflows.
- Add new skill `newapi-admin` for NewAPI backend administration across channels, users, groups, pricing, logs, auth, and system options.
- Register `./skills/newapi` and `./skills/newapi-admin` in a new `newapi-tools` plugin group and bump `.claude-plugin/marketplace.json` metadata version to `0.2.25`.
- Add new skill `video-viral-analysis` for data-aware short-video viral analysis, bottleneck diagnosis, and reusable template extraction.
- Register `./skills/video-viral-analysis` in the `video-analysis-tools` plugin group.
- Add normalized `statistics` output to `douyin-video-fetch`, including Douyin playback count from `aweme_detail.hot_list.view_count` plus comment, like, collect, share, recommend, and admire counts.
- Add new skill `multi-image-consistency` for building a style anchor and matched prompt sets for multi-image generation projects.
- Register `./skills/multi-image-consistency` in the `image-generation-skills` plugin group and bump `.claude-plugin/marketplace.json` metadata version to `0.2.23`.
- Add a Markdown-only mode to `wechat-mp-scraper` via `--mode markdown` / `--markdown-only`, exporting only `content.md` and `content.json` without asset downloads or animation reports.
- Restore and add the `skills-manager` skill for managing installed skills through the `skills` CLI, including local-path installs and Chinese action phrases.
- Update `douyin-video-fetch` to a subcommand CLI (`video`, `audio`, `cover`, `all`) and add direct download support for audio and cover assets.
- Normalize Douyin `jingxuan?modal_id=...` and `jingxuan.douyin.com/m/video/...` inputs into standard video-page fetches before capturing `aweme/detail`.
- Bump `.claude-plugin/marketplace.json` metadata version to `0.2.22`.
- Add new skill `douyin-video-fetch` for browser-based Douyin video detail capture and optional file download from video/share URLs.
- Add new skill `video-analysis` for public video analysis via GeekAI's OpenAI-compatible video chat API.
- Register `./skills/douyin-video-fetch` in the existing `douyin-tools` plugin group.
- Register `./skills/video-analysis` in a new `video-analysis-tools` plugin group and bump `.claude-plugin/marketplace.json` metadata version to `0.2.21`.
- Refactor `feishu-user-auth` from single-tenant config to a pure multi-tenant config model with top-level `tenants` and optional `defaultTenant`.
- Add `--tenant <key>` selection for all config-dependent `feishu-auth` commands, while allowing fallback to `defaultTenant` when configured.
- Keep token storage keyed by real `appId` so existing app-bound token reuse semantics remain intact.
- Add checked-in sample output under `skills/wechat-mp-scraper/examples/hermes-openclaw/` with `content.md` and referenced local images for Markdown viewer compatibility checks.
- Add new skill `xhs-text2image` for Xiaohongshu Creator text-to-image automation, theme switching, and bundled customer preview assets.
- Add `skills/xhs-text2image/theme_catalog/` with a generated overview image, manifest, and per-theme sample images.
- Register `./skills/xhs-text2image` in a new `xiaohongshu-tools` plugin group and bump `.claude-plugin/marketplace.json` metadata version to `0.2.18`.
- Add new skill `wechat-mp-scraper` for scraping public WeChat public-account article pages, exporting HTML/content/assets, and extracting animation clues.
- Register `./skills/wechat-mp-scraper` in a new `wechat-tools` plugin group and bump `.claude-plugin/marketplace.json` metadata version to `0.2.20`.

### Documentation
- Document `apifox-doc-import` installation, online-document handling, safety boundaries, validation, and repository structure.
- Update `README.md`, `README.zh.md`, and `AGENTS.md` with installation, usage, structure, and validation guidance for `visual-style-extractor`.
- Remove the deleted skills from `README.md`, `README.zh.md`, and `AGENTS.md`, and refresh the remaining plugin descriptions and validation guidance.
- Update `README.md`, `README.zh.md`, and `AGENTS.md` with installation, usage, validation, and repository guidance for `short-drama`.
- Update `README.md`, `README.zh.md`, and `AGENTS.md` with install and usage guidance for `newapi` and `newapi-admin`.
- Ignore skill-local `.env` and `.session.json` files in `.gitignore` to avoid committing local credentials and sessions.
- Update `skills/douyin-video-fetch/SKILL.md` and `AGENTS.md` with statistics output and `video-viral-analysis` guidance.
- Update `README.md`, `README.zh.md`, and `AGENTS.md` with install and usage guidance for `multi-image-consistency`.
- Document the `wechat-mp-scraper` Markdown-only export mode in the skill docs, README files, and local command guidance.
- Update `AGENTS.md` with install and repository guidance for `skills-manager`.
- Update `skills/douyin-video-fetch/SKILL.md`, `README.md`, `README.zh.md`, and `AGENTS.md` for the new subcommand-based usage and asset-download examples.
- Refresh `skills/feishu-approval/` with a new compact entry skill plus expanded reference coverage for approval definitions, instances, task actions, and token/ID handling details.
- Refresh `skills/feishu-bitable/SKILL.md` with richer record-writing guidance, a fuller request example, and clearer field-inspection reminders.
- Update `README.md`, `README.zh.md`, and `AGENTS.md` with install and usage guidance for `douyin-video-fetch` and `video-analysis`.
- Update `skills/feishu-user-auth/SKILL.md`, `skills/feishu-user-auth/config.json`, and CLI help text to document tenant-based usage and the new config shape.
- Update `skills/wechat-mp-scraper/SKILL.md` and `AGENTS.md` to document the checked-in sample export path.
- Update `README.md`, `README.zh.md`, and `AGENTS.md` with install and usage guidance for `xhs-text2image`.
- Update `README.md`, `README.zh.md`, and `AGENTS.md` with install and usage guidance for `wechat-mp-scraper`.

## 0.2.17 - 2026-03-28

### Features
- Add new documentation-first skill `feishu-card` for Feishu interactive cards, including card JSON structure, `interactive` message sending, callback payloads, and message updates.
- Add `skills/feishu-card/references/` with reusable alert, morning-briefing, and skill-test card templates.
- Register `./skills/feishu-card` in the `feishu-tools` plugin group and bump `.claude-plugin/marketplace.json` metadata version to `0.2.17`.

### Documentation
- Update `skills/feishu-card/SKILL.md` to document the correct token flow via `feishu-auth system-token` and clarify that callers must extract only the returned `accessToken`.
- Update `README.md`, `README.zh.md`, and `AGENTS.md` to include install and usage guidance for `feishu-card`.

## 0.2.16 - 2026-03-23

### Documentation
- Expand `feishu-approval` skill coverage to include approval file upload for image and attachment controls.
- Add `skills/feishu-approval/references/file-upload.md` with upload flow, request fields, limits, response usage, and instance value examples.
- Update `skills/feishu-approval/SKILL.md` and `skills/feishu-approval/references/instance.md` so the skill routes file-upload questions correctly and explains how uploaded file `code` is used in approval instances.

## 0.2.15 - 2026-03-21

### Documentation
- Update `skills/feishu-bitable/SKILL.md` with two practical modeling guidelines for Feishu Bitable:
- use integer fields for quantity values to avoid unnecessary decimals
- prefer views to separate statuses while keeping the total number of views small and manageable

## 0.2.14 - 2026-03-20

### Changes
- Fix `feishu-user-auth` config path resolution so `storeDir` and `legacyStoreDir` support `~/...` home-directory paths.
- Remove the repo-specific `storeDir` override from `skills/feishu-user-auth/config.json` so distributed installs default to `~/.feishu-auth`.
- Bump `.claude-plugin/marketplace.json` metadata version to `0.2.14`.

### Documentation
- Update `skills/feishu-user-auth/SKILL.md` to describe user-home defaults instead of a repository-relative storage path.
- Update `README.md`, `README.zh.md`, `AGENTS.md`, and `skills/feishu-user-auth/SKILL.md` to document the actual installed bin paths (`.agents/skills/.../bin/feishu-auth.js`) for both project-local and global installs, plus an optional PATH symlink flow.

## 0.2.13 - 2026-03-20

### Features
- Add new documentation-first skill `feishu-approval` for Feishu native approval definitions, form controls, external options, approval instances, and troubleshooting.
- Register `./skills/feishu-approval` in the `feishu-tools` plugin group and bump marketplace metadata version to `0.2.13`.

### Documentation
- Update `README.md` and `README.zh.md` with install and usage guidance for `feishu-approval`.
- Update `AGENTS.md` to include the new skill paths and repository conventions.

## 0.2.12 - 2026-03-20

### Features
- Add new skill `feishu-bitable` for Feishu Bitable record CRUD, field management, views, permissions, formulas, and linked-table workflows.
- Add field reference guide under `skills/feishu-bitable/references/fields.md` for `type / ui_type / property` decisions.
- Register `./skills/feishu-bitable` in the `feishu-tools` plugin group and bump marketplace metadata version to `0.2.12`.

### Documentation
- Update `README.md` and `README.zh.md` with install and usage guidance for `feishu-bitable`.
- Update `AGENTS.md` to include the new skill paths and repository conventions.

## 0.2.11 - 2026-03-20

### Features
- Add new skill `feishu-user-auth` for Feishu user OAuth/device-flow authorization, token reuse, and scope top-up.
- Add runnable scripts under `skills/feishu-user-auth/scripts/` for `auth`, `system-token`, `show-token`, and `refresh-token`.
- Add `feishu-tools` plugin group in `.claude-plugin/marketplace.json` and register `./skills/feishu-user-auth`.

### Documentation
- Update `README.md` and `README.zh.md` with install/usage instructions for `feishu-user-auth`.
- Update `AGENTS.md` to include the new skill paths, commands, and release/security guidance.

## 0.2.9 - 2026-02-25

### Features
- Add new skill `sora-video` for generating videos using Sora via lnapi.com.
- Supports text-to-video and image-to-video generation.
- Supports polling for video completion and automatic download.

### Documentation
- Register `sora-video` in `.claude-plugin/marketplace.json` under new plugin `video-generation-skills`.

## 0.2.8 - 2026-02-23

### Changes
- Update default aspect ratios in `ecommerce-images`: main image defaults to `1:1`, detail images default to `3:4`.
- Allow explicit override through `ar`.
- Bump `.claude-plugin/marketplace.json` metadata version to `0.2.8`.

## 0.2.7 - 2026-02-23

### Changes
- Update `.gitignore` to ignore local `skills-lock.json` and avoid committing machine-specific lock data.
- Bump `.claude-plugin/marketplace.json` metadata version to `0.2.7`.

## 0.2.6 - 2026-02-23

### Changes
- Refactor `ecommerce-images` into a no-code workflow skill (remove `skills/ecommerce-images/scripts/main.ts`).
- Set provider strategy for `ecommerce-images` to use `banana-proxy` by default and fallback to `baoyu-image-gen` on failure.
- Keep `main` / `detail` / `both` generation modes and style ID extension slots in workflow docs.
- Update detail-image behavior to set generation: ask users for required detail image count before running in `detail`/`both` modes.
- Switch style interaction to human-readable style names only.

### Documentation
- Update `AGENTS.md` to align with no-script `ecommerce-images` structure.
- Update `README.md` and `README.zh.md` to include `ecommerce-images` installation and usage guidance.

## 0.2.5 - 2026-02-23

### Features
- Add new skill `ecommerce-images` for generating ecommerce product main and detail images using prompt templates and `banana-proxy`.

## 0.2.4 - 2026-02-23

### Changes
- Remove GeekAI fallback provider from `banana-proxy`; use only lnapi.com (LNAPI_KEY) as primary provider.
- Delete `skills/banana-proxy/scripts/providers/geekai.ts`.
- Simplify `generateWithRetry` to retry primary provider only (no fallback).

## 0.2.3 - 2026-02-23

### Changes
- Change local env directory for `banana-proxy` from `.baoyu-skills/.env` to `.shuliu-skills/.env` (both project and home paths).
- Update CLI help text to reflect the new env file load order.

## 0.2.2 - 2026-02-23

### Changes
- Change default GeekAI fallback model from `bananan-2` to `nano-banana-2` for `banana-proxy`.
- Keep actual output format from provider response (no forced PNG), and save with matched extension.

## 0.2.1 - 2026-02-23

### Features
- Add GeekAI image fallback provider to `banana-proxy`.
- Keep Banana Gemini as primary provider and automatically fallback to GeekAI model `bananan-2` when primary generation fails after retry.
- Add new provider implementation: `skills/banana-proxy/scripts/providers/geekai.ts`.

### Documentation
- Update `skills/banana-proxy/SKILL.md` to describe primary/fallback behavior and new env vars.
- Update `README.md` and `README.zh.md` with `GEEKAI_API_KEY` / `GEEKAI_IMAGE_MODEL` usage.

## 0.2.0 - 2026-02-17

### Features
- Add new skill `douyin-share-info` for fetching Douyin basic video info by share URL via TikHub Douyin Web API.
- Add CLI script `skills/douyin-share-info/scripts/main.ts` with normalized JSON output fields.
- Implement fixed extraction rules:
  - cover: `data.aweme_detail.video.origin_cover.url_list[0]`
  - audio: `data.aweme_detail.music.play_url.url_list[0]`
  - video: `data.aweme_detail.video.bit_rate[i].play_addr.url_list[0]` (pick first available by array order)

### Documentation
- Register `douyin-share-info` in `.claude-plugin/marketplace.json` under plugin `douyin-tools`.
- Update `README.md` and `README.zh.md` with install and usage instructions for `douyin-share-info`.
- Update `AGENTS.md` to reflect multi-skill repository structure and `douyin-share-info` conventions.

## 0.1.1 - 2026-02-17

### Documentation
- Add `AGENTS.md` contributor guide.
- Define mandatory release rules: tag every commit, update both changelogs for every change, and sync `AGENTS.md` when skills or skill structure changes.

## 0.1.0 - 2026-02-17

### Features
- Initialize local `shuliu-skills` marketplace repository structure.
- Add `banana-proxy` skill with scripts and documentation.
- Add `.claude-plugin/marketplace.json` with `image-generation-skills` plugin category.
- Add README and README.zh with install, update marketplace directory, and skill index.
