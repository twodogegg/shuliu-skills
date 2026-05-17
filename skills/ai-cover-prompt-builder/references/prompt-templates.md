# Prompt Templates

## Standard cover prompt template

```text
Create a 16:9 Chinese YouTube thumbnail for an AI tutorial video.

Use the character reference images from `assets/character/` as the fixed creator/persona reference. Preserve the same identity, face structure, hairstyle, and creator vibe unless the user asks otherwise.

Use the visual reference images from `assets/reference-images/` for style, composition, icons, app UI, colors, and layout direction. Do not copy them exactly.

Style preset: [style preset name and summary]

Main title text: "[main title]"
Subtitle text: "[subtitle]"
Badge text: "[badge]"

Composition:
- 16:9 YouTube thumbnail, mobile-readable.
- Put the creator on the right side or foreground, with crisp cutout and bright face lighting.
- Put the main title on the left or center-left with strong hierarchy.
- Include one clear visual focus: app screen, laptop UI, Notion workspace, AI dashboard, or tool card.
- Keep the background sharp and purposeful, not abstract blur.
- Use only a few supporting elements such as one arrow, one badge, or 1 to 3 icons.

Typography:
- Bold Chinese display typography.
- Keep text short and readable.
- Use thick shadow or outline only when it improves readability.

Output should feel like a high-CTR Chinese AI tutorial thumbnail, but not cluttered.
```

## Negative prompt template

```text
low resolution, blurry background, unreadable Chinese text, distorted text, random letters, too many words, overcrowded layout, too many icons, messy UI, distorted face, bad hands, extra fingers, watermark, logo distortion, flat boring composition, poor contrast
```

## clean-tech-tutorial example

```text
Create a 16:9 Chinese YouTube thumbnail for an AI tools tutorial. Use the fixed creator images from `assets/character/`. Use the reference images from `assets/reference-images/` for layout and UI direction. Style: clean-tech-tutorial. Dark sharp tech workspace, visible laptop screen with an AI chat interface, right-side creator portrait with bright face lighting and crisp outline. Left side medium-large title: "AI Tools Guide". Subtitle: "Easy for beginners". Badge: "2025 Update". Use black, purple, orange, white, and yellow. Keep the title readable but not oversized. Add one app icon and one curved arrow. Avoid clutter.
```

## notion-workspace example

```text
Create a 16:9 Chinese YouTube thumbnail for a Notion plus AI workflow video. Use the fixed creator images from `assets/character/`. Use the reference images from `assets/reference-images/` for Notion-like UI and cover composition. Style: notion-workspace. Show a clean Notion-style workspace with pages, cards, database panels, and a second-brain dashboard. Creator on the right, calm and smart expression. Main title: "Notion AI Workflow". Subtitle: "Build your second brain". Badge: "Productivity System". Use black, white, gray, muted purple, and one accent color. Organized, sharp, premium, not chaotic.
```

## dopamine-absurd-clickbait example

```text
Create a 16:9 Chinese YouTube thumbnail for a dramatic AI tricks video. Use the fixed creator images from `assets/character/`. Use the reference images from `assets/reference-images/` for color, style, icons, and layout direction. Style: dopamine-absurd-clickbait. Use a black background with huge yellow title blocks, red warning accents, white highlights, comic burst labels, arrows, lightning, and a big number. Creator on the right with shocked expression, pointing at the title. Main title: "30 AI Tricks". Subtitle: "Beginners can use them". Badge: "90% miss this". Exaggerated and absurd, but still readable on mobile. Do not add many tiny words.
```
