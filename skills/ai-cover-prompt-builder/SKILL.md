---
name: ai-cover-prompt-builder
description: build reusable image-generation prompts for chinese youtube-style ai tutorial covers. use when the user wants a saved cover or thumbnail prompt, especially with fixed creator/persona images, reference cover images, notion-style covers, dopamine clickbait covers, or ai tool tutorial thumbnail styles. this skill writes prompt files for another image-generation tool and does not directly generate images.
---

# AI Cover Prompt Builder

## Overview

Create reusable image-generation prompts for Chinese YouTube covers and thumbnails. This skill outputs prompt text and saves it as a `.md` or `.txt` file. It does not generate images.

## Workflow

1. Identify the user's topic, title, subtitle or promise line, style preference, and output filename. Infer sensible defaults when the request is clear enough.
2. Read `assets/README.md` for the user's plain-language asset notes.
3. Use files in `assets/character/` as fixed creator or persona references when present.
4. Use files in `assets/reference-images/` as style, layout, icon, app UI, or thumbnail references when present.
5. Select a style from `references/style-presets.md`. If unspecified, use `clean-tech-tutorial`.
6. Use `references/prompt-templates.md` to compose the final prompt.
7. Save the prompt file. Include the main prompt, negative prompt, and short production notes.
8. Reply with the saved file path, the selected style, and a brief note on which reference folders were used.

## Asset rules

- Do not require JSON configuration.
- Treat `assets/README.md` as the configuration file. It may be informal Markdown or plain notes.
- Preserve the fixed character identity when the README or user says the character is fixed.
- Use reference images for direction, not exact copying.
- If user instructions conflict with asset notes, follow the latest user instruction.
- Do not overload the prompt with every reference image. Prefer the most relevant character reference and 1 to 3 visual references.

## Prompt quality rules

- Keep thumbnail text simple: one main title, one subtitle, and at most one badge unless the user asks for more.
- Include composition, text hierarchy, color palette, character placement, asset references, and negative prompt.
- Prefer sharp visible background objects such as a laptop screen, app interface, Notion workspace, or tool dashboard over vague blurry glow.
- Recommend manual typesetting for final Chinese text if the image model produces distorted characters.
- Do not generate the image unless the user separately asks another image-generation tool to do it.

## Output file format

Use this structure:

```markdown
# Cover Prompt

## Inputs
- Style: [style]
- Main title: [title]
- Subtitle: [subtitle]
- Badge: [badge]

## References Used
- Character: [folder or file notes]
- Visual references: [folder or file notes]

## Prompt
[prompt]

## Negative Prompt
[negative prompt]

## Production Notes
[short notes for generation and manual cleanup]
```
