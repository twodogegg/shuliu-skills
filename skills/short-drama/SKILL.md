---
name: short-drama
description: 专业微短剧剧本创作工作流，覆盖选题立项、故事策划、角色设计、分集大纲、单集剧本、质量审查、内容合规、海外本地化与整剧导出。用户要创作或续写 50–100 集短剧、检查短剧质量、制作国内或海外竖屏短剧，或使用 /start、/plan、/characters、/outline、/episode、/review、/compliance、/overseas、/export 等旧命令时使用。
---

# 微短剧剧本创作

## 核心流程

1. 检查当前项目目录中的 `.drama-state.json` 和已有创作文件，恢复进度。
2. 识别用户当前意图；同时兼容自然语言和旧式斜杠命令。
3. 只读取当前阶段需要的参考文档，不要一次加载全部 references。
4. 检查阶段依赖。缺少会实质改变创作方向的信息时先询问；其余情况直接继续。
5. 生成或更新对应文件，并同步更新 `.drama-state.json`。
6. 告知用户本次生成的文件、当前进度和合理的下一步。

开始新项目、恢复项目或处理文件结构时，读取 [project-workflow.md](references/project-workflow.md)。

## 意图路由

| 意图 | 旧命令 | 主要输出 | 必须读取 |
|---|---|---|---|
| 选题立项 | `/start` | `.drama-state.json` | [genre-guide.md](references/genre-guide.md) |
| 故事策划 | `/plan` | `creative-plan.md` | [opening-rules.md](references/opening-rules.md)、[paywall-design.md](references/paywall-design.md)、[rhythm-curve.md](references/rhythm-curve.md)、[satisfaction-matrix.md](references/satisfaction-matrix.md) |
| 角色设计 | `/characters` | `characters.md` | [villain-design.md](references/villain-design.md) |
| 分集大纲 | `/outline` | `episode-directory.md` | [paywall-design.md](references/paywall-design.md)、[rhythm-curve.md](references/rhythm-curve.md)、[hook-design.md](references/hook-design.md) |
| 单集创作 | `/episode {N}` | `episodes/ep{NNN}.md` | [screenplay-formats.md](references/screenplay-formats.md)、[rhythm-curve.md](references/rhythm-curve.md)、[satisfaction-matrix.md](references/satisfaction-matrix.md)、[hook-design.md](references/hook-design.md)；第 1 集另读 [opening-rules.md](references/opening-rules.md) |
| 质量审查 | `/review {N}` | `reviews/ep{NNN}-review.md` | [rhythm-curve.md](references/rhythm-curve.md)、[satisfaction-matrix.md](references/satisfaction-matrix.md)、[hook-design.md](references/hook-design.md) |
| 合规审核 | `/compliance` | `compliance-report.md` | [compliance-checklist.md](references/compliance-checklist.md) |
| 海外模式 | `/overseas` | 更新状态及后续内容 | [genre-guide.md](references/genre-guide.md)、[screenplay-formats.md](references/screenplay-formats.md) |
| 整剧导出 | `/export` | `export/{剧名}-完整剧本.md` | [project-workflow.md](references/project-workflow.md) |

## 立项

展示题材并确认以下信息：

- 题材组合，最多优先组合两个主类型
- 目标受众：男频、女频或全年龄
- 故事基调：爽燃、甜虐、搞笑、暗黑或温情
- 结局类型：大团圆、开放式、反转式或悲剧
- 集数规模：50–60、60–80、80–100 或用户指定
- 输出语言与市场：国内中文或海外英文

用户选择英文时，自动切换为海外模式。确认后写入状态文件；不要在方向尚未确定时生成整套大纲。

## 故事策划

生成并保存：

1. 三个剧名备选及说明
2. 时空背景、社会环境与阶层关系
3. 一句话故事线和核心冲突
4. 三幕结构及集数范围
5. 全剧节奏、高低谷和关键高潮
6. 付费卡点的位置、类型和悬念
7. 爽点类型与分布
8. 主线、感情线及伏笔回收方式

让用户确认会影响全剧的核心设定后再进入角色设计。

## 角色设计

为每个主要角色定义姓名、年龄、外貌、性格、公开身份、真实身份、动机、冲突、爽点功能和语言特征。补充：

- Mermaid 角色关系图
- 主要角色弧线
- 感情线关键节点
- 首次冲突、身份揭露、感情转折和终极对决预设
- 与题材匹配的分层反派体系

保持角色行为、能力与动机可解释，不要只用标签代替人物。

## 分集大纲

覆盖全部集数，并为每集写明集数、标题、核心冲突或爽点、钩子类型和标记：

- 用 🔥 标记重大转折、高潮或揭秘集，占全剧约 25%–35%。
- 用 💰 标记付费卡点集，占全剧约 10%–15%。
- 前 10 集至少安排 3 个 🔥 和 2 个 💰。
- 让大纲体现完整三幕结构和阶段性节奏变化。

生成后提醒用户通读全剧目录；发现节奏断层时先修订大纲再写分集。

## 单集创作

支持单集、范围和下一集三种请求，例如 `/episode 1`、`/episode 5-8`、`/episode next`。写作前：

1. 读取角色档案、分集目录和必要的前文。
2. 对齐本集在三幕结构、爽点和付费卡点中的作用。
3. 使用当前模式对应的剧本格式。
4. 写完后检查与前后集、角色设定和伏笔是否一致。

每集安排 3–5 个场次；中文不少于 800 字，英文不少于 600 词。至少使用三种景别，给台词补充必要的动作或语气，并以明确钩子结束。付费卡点集使用强悬念，第 1 集在前 30 秒建立冲突或欲望。

批量创作时逐集校验连续性，不要让后续集数覆盖前一集制造的事实。

## 质量审查

按节奏、爽点、台词、格式、连贯性五个维度分别评 1–10 分，并提供证据：

- 45–50：优秀，可直接导出
- 35–44：良好，建议微调
- 25–34：及格，需要修改
- 25 以下：不合格，建议重写

将问题分成必须修改和优化建议，给出可执行的修改方案；不要只给分数。

## 合规审核

逐集定位红线、高风险内容和价值观问题，注明集数、场次、风险原因和修改建议。国内模式按国内规则审核；海外模式同时检查目标市场的文化、法律和平台风险。合规结论不能代替专业法律意见。

## 海外模式

切换后同步更新 `language` 和 `mode`，并在后续内容中：

- 使用英文与好莱坞场景格式。
- 本地化人物、法律、社交场景和文化符号。
- 保留核心戏剧冲突，不逐字翻译中式语境。
- 优先采用目标市场熟悉的竖屏短剧元素。

已有中文内容默认不自动重写，除非用户明确要求转换。

## 导出

按集数顺序合并已完成内容，包含元信息、故事梗概、主要角色和分集剧本。统计已完成集数与总字数，并明确标注未完成范围。不要把缺失剧集伪装成已完成内容。

## 创作约束

- 渐进式推进，允许用户随时回改上游设定。
- 上游内容变化后，指出受影响的下游文件并按用户授权更新。
- 优先写可拍摄的动作、场景和台词，避免抽象心理叙述。
- 保持角色语言区分度、因果链和伏笔可回溯。
- 不虚构平台数据、审核结论或法律保证。
