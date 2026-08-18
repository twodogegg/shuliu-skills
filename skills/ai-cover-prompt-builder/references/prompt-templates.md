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

## 竖版短剧海报提示词模板

```text
为中文微短剧制作一张 9:16 竖版海报，电影级人物摄影与精致短剧宣发视觉。

题材与冲突：[题材；一句话冲突]
主标题（后期手动排版）："[主标题]"
副标题或钩子（后期手动排版）："[副标题或钩子]"
风格：short-drama-poster，[都市情感 / 逆袭玄幻 / 规则悬疑 / 赛车热血] 子方向。

人物与关系：
- 主角：[外形、情绪、衣着、与其他角色的关系]，位于[前景 / 中景 / 视觉中心]。
- 配角：[人数不超过 3、各自的关系和情绪]，用对视、背离、守护或对峙形成明确三角关系。

画面：
- 9:16 竖版，人物面部清晰，在手机缩略图尺寸仍能一眼读出冲突。
- 使用前、中、后景分层；主角最大最清楚，背景是可辨识的关键场景或类型符号。
- 主标题预留上方或下方约四分之一的干净区域，采用[字形材质与配色]；不要堆叠小字、角标或无关图标。
- 场景：[地点、时间、关键道具或超现实元素]；光线：[暖金电影光 / 金红魔法光 / 冷蓝霓虹与警示红 / 晴天硬光]。
- 所有角色均为衣着得体的成年人；画面只表现剧情张力，不包含裸露、性暗示或露骨姿势。

输出：人物身份稳定、情绪可信、戏剧冲突强、画面清晰且可供后期排版的短剧宣传海报底图。
```

## 竖版短剧海报负面提示词

```text
低清晰度，模糊五官，人物重复，畸形手指，额外肢体，年龄不明或未成年角色，裸露，透视衣物，性暗示姿势，露骨内容，错误文字，随机文字，文字过多，标题不可读，画面拥挤，缺少人物关系，平淡表情，杂乱背景，水印，变形 logo
```

## 规则悬疑短剧示例

```text
为中文规则悬疑微短剧制作一张 9:16 竖版海报，电影级人物摄影与都市惊悚氛围。主标题（后期手动排版）：“夜班禁令”。副标题（后期手动排版）：“违反规则的人，都会消失”。风格：short-drama-poster，规则悬疑子方向。前景是一位衣着利落的成年女主，回头望向镜头，神情警觉；中景是一位成年男主站在地铁站闸机旁，隔着玻璃与她对视；背景是空旷的末班地铁、失焦的警示牌和异常闪烁的红灯。冷蓝黑夜为底色，警示红只用于闸机警报与标题留白区域。上方保留四分之一干净空间，预备破损的白红粗体标题。人物关系清晰，车站透视强烈，紧张而克制，所有角色衣着得体，不含裸露或性暗示。
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
