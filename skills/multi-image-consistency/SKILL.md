---
name: multi-image-consistency
description: generate coordinated prompts for tasks that require multiple images with strong cross-image consistency. use when the user provides a prd, script, storyboard, creative brief, campaign plan, comic outline, manga chapter, storyboard script, or other full planning document and wants a sequence or set of images rather than a single image. especially useful for websites, apps, comics, manhua, manga, storyboards, scene sequences, character sheets, poster series, and illustration sets. produce a style anchor prompt first, then produce follow-on prompts that preserve the same visual identity, characters, settings, tone, and continuity.
---

Build prompt sets for multi-image generation with consistency as the main goal.

## Core rule
Always create a **style anchor** first. Do not treat each requested image as an independent generation.

The style anchor is the canonical source for the shared visual language of the whole set. Every later prompt must either:
- reference the style anchor explicitly when the image tool supports reference images, or
- restate the same anchor facts in text when reference images are not supported.

## Workflow

### 1) Read and classify the source material
Extract the project's:
- medium or artifact type
- audience and purpose
- number of images required
- sequence or page/shot order
- fixed entities: characters, products, props, locations, UI shell, brand assets
- style cues: genre, rendering style, mood, palette, era, lighting
- continuity constraints

Classify the project into one of these broad types:
- product/ui screens
- comic, manga, manhua, or webtoon
- storyboard or animatic frames
- poster or campaign series
- illustration series
- character or environment design pack
- other sequential image project

If image count is missing but the source material clearly implies sections, infer a reasonable count and say so briefly.

### 2) Choose the consistency dimensions based on the project type
Do not use the same consistency checklist for every project. Adapt it.

#### Product or UI screens
Prioritize:
- brand name and wording
- layout shell
- navigation structure
- color palette
- typography feel
- card, table, and button style
- interaction language
- density level
- recurring metrics, labels, and UI modules

#### Comic / manga / manhua / webtoon
Prioritize:
- character face, hair, body type, age cues
- outfit and signature accessories
- environment and world details
- art style and line quality
- panel rhythm and reading flow when relevant
- camera distance and shot variety
- emotional continuity
- prop continuity
- time-of-day continuity

#### Storyboard / cinematic frames
Prioritize:
- subject identity
- location continuity
- lens and camera language
- lighting continuity
- blocking and action progression
- shot order
- key props and spatial relationships

#### Poster / campaign / illustration series
Prioritize:
- visual motif
- palette
- composition system
- brand or campaign lockups
- recurring subjects
- lighting and mood
- typography treatment when present

### 3) Build the consistency bible
Before writing prompts, create a compact internal “consistency bible” with the facts that must persist.

Include only the facts that matter. Typical fields:
- project title or working label
- visual style summary
- subject roster
- world / setting summary
- palette and mood
- recurring objects
- non-negotiable continuity rules
- aspect ratio and framing rule
- what is allowed to vary from image to image

Use this bible to write every prompt.

### 4) Create the style anchor prompt
Write one prompt for the first image that establishes the whole project's visual language.

The style anchor should:
- be image 1 of the set
- clearly establish style, characters or system, setting, lighting, palette, and composition language
- feel like the definitive reference image for the rest of the sequence
- include enough detail that later prompts can point back to it

If useful, label it `Master Prompt / Style Anchor`.

### 5) Create the follow-on prompts
For each remaining image:
- keep the anchor facts stable
- change only what is needed for that specific frame, page, screen, or scene
- preserve continuity from the previous image when the set is sequential
- keep terminology stable across prompts
- avoid accidentally redesigning characters, UI, props, or environments

When the target system supports reference images, explicitly start follow-on prompts with wording similar to:
- `Image A is the style anchor... preserve the same visual language...`
- `Use the first image as the continuity reference...`

When the target system does not support reference images, start with a short **anchor recap** that repeats the crucial facts in the same order each time.

### 6) Output structure
Default output format:

1. `Project Type`
2. `Consistency Priorities`
3. `Style Anchor Summary`
4. `Prompt 1: Style Anchor`
5. `Prompt 2...N`
6. `Reference-image version` if applicable
7. `Text-only continuity version` if applicable

The prompts themselves are the primary deliverable.

## Prompt-writing rules
- Prefer concrete visual language over vague adjectives.
- Keep names, descriptors, and labels consistent across prompts.
- Reuse exact wording for important persistent details.
- State what changes in the current image and what remains fixed.
- For sequential stories, maintain narrative continuity from one image to the next.
- For UI, keep repeated modules and shell structure stable.
- For comics and storyboards, specify camera angle, shot size, action beat, and emotional beat.
- For poster or illustration series, specify the repeating motif and what variant is introduced in the current image.

## Genre-specific output hints
For comics, manga, manhua, and storyboards, use a compact prompt formula:
`shared style + character continuity + environment continuity + shot description + action beat + mood + composition notes`

For product or UI work, use a compact prompt formula:
`shared design system + fixed shell + page purpose + required modules + realistic content + implementation-ready fidelity`

For character packs, use a compact prompt formula:
`shared style + subject identity + pose/outfit variation + stable facial features + stable palette + sheet purpose`

## When the source material is under-specified
If the user provides a full plan but some visual details are missing, infer reasonable defaults that fit the medium and state the assumptions briefly before the prompts.
Do not block on minor missing details.

## Avoid
- generating all images as if they are unrelated one-off prompts
- changing style adjectives casually from prompt to prompt
- redesigning the main subject between images
- mixing multiple incompatible aesthetics unless the brief explicitly asks for that
- outputting only a page list without the actual prompts

## Supporting references
For output format guidance, see `references/output-template.md`.
For project-type consistency heuristics, see `references/consistency-playbook.md`.
