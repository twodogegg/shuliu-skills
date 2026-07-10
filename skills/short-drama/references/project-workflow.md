# 项目工作流与文件规范

## 目录

- [项目目录](#项目目录)
- [状态文件](#状态文件)
- [恢复与更新规则](#恢复与更新规则)
- [阶段产物](#阶段产物)
- [旧命令兼容](#旧命令兼容)

## 项目目录

将创作产物保存在用户当前项目目录，不要写入 skill 目录：

```text
{项目目录}/
├── .drama-state.json
├── creative-plan.md
├── characters.md
├── episode-directory.md
├── episodes/
│   ├── ep001.md
│   └── ...
├── reviews/
│   ├── ep001-review.md
│   └── ...
├── compliance-report.md
└── export/
    └── {剧名}-完整剧本.md
```

只创建当前任务需要的目录和文件。

## 状态文件

使用以下结构保存创作状态：

```json
{
  "currentStep": "start",
  "genre": [],
  "audience": "",
  "tone": "",
  "endingType": "",
  "totalEpisodes": 0,
  "completedEpisodes": [],
  "language": "zh-CN",
  "mode": "domestic",
  "dramaTitle": ""
}
```

`currentStep` 使用 `start`、`plan`、`characters`、`outline`、`episode`、`review`、`export` 之一。读取旧状态时兼容 `episodes`，写回时规范为 `episode`。

## 恢复与更新规则

1. 优先读取状态文件，再检查对应产物是否真实存在。
2. 状态与文件冲突时，以文件事实为准，并向用户说明修正。
3. 写完单集后，将集数加入 `completedEpisodes`，去重并按升序排列。
4. 变更题材、主角、结局或总集数时，列出受影响的下游产物。
5. 未经用户同意，不覆盖与新设定冲突的大量已完成剧集。
6. 文件不存在时新建；文件存在时只修改当前请求涉及的部分。

## 阶段产物

### 创作方案

`creative-plan.md` 至少包含剧名、背景、故事线、核心冲突、三幕结构、节奏、付费卡点、爽点矩阵、结局和伏笔回收。

### 角色档案

`characters.md` 至少包含主要角色档案、关系图、角色弧线、感情线、关键场景和反派体系。

### 分集目录

`episode-directory.md` 每集使用统一字段：

```text
第{N}集：{标题} —— {核心冲突或爽点}｜钩子：{类型} {🔥/💰}
```

文件末尾统计 🔥、💰 和各钩子类型的数量及占比。

### 单集剧本

将第 N 集保存为 `episodes/ep{NNN}.md`，集数用三位数补零。格式读取 [screenplay-formats.md](screenplay-formats.md)。

### 审查报告

将第 N 集报告保存为 `reviews/ep{NNN}-review.md`，包含评分、证据、问题等级和修改建议。批量审查可另生成汇总，但不要替代单集报告。

### 合规报告

`compliance-report.md` 至少包含审核范围、红线问题、高风险问题、通过项和修改优先级。

### 整剧导出

`export/{剧名}-完整剧本.md` 按以下顺序组织：

1. 剧名与元信息
2. 故事梗概
3. 主要角色
4. 已完成分集剧本
5. 完成度和总字数

## 旧命令兼容

把旧命令视为意图别名，不依赖斜杠命令系统：

| 命令 | 意图 |
|---|---|
| `/start` | 选题立项 |
| `/plan` | 故事策划 |
| `/characters` | 角色设计 |
| `/outline` | 分集大纲 |
| `/episode N` | 创作第 N 集 |
| `/review N` | 审查第 N 集 |
| `/compliance` | 合规审核 |
| `/overseas` | 切换海外模式 |
| `/export` | 导出整剧 |
