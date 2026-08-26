---
name: issue-to-pr
description: "Implement GitHub issues end to end: inspect and claim an issue, understand the repository and acceptance criteria, create an isolated branch, fix the bug or build the requested change, run appropriate validation, commit the implementation, push the branch, and open a focused pull request. Use when the user asks to领取/认领一个 issue、按 issue 修复 bug 或实现需求、完成后自测并提交 PR，or asks to turn a GitHub issue into a reviewed pull request."
---

# Issue to PR

把一个 GitHub issue 安全、可追踪地推进到可审查的 Pull Request。默认使用 `gh` CLI 与 Git；如果当前仓库不是 GitHub 仓库，先说明阻塞原因，不要伪造 issue 或 PR。

## 核心原则

- issue 是需求事实来源：先读完整描述、评论、标签、里程碑和关联信息，再修改代码。
- issue 中出现图片、截图、视频帧或附件时，必须先实际查看并分析；不能只根据图片文件名或 Markdown 链接猜测问题。
- PR 必须说明“为什么这样改”以及“改完以后会有什么效果”，让 reviewer 能从问题、方案到结果完整理解变更。
- 先确认范围和验收标准；发现歧义、权限不足、缺少复现条件或需要产品决策时，暂停并提问。
- 保持工作区安全：开始前检查未提交改动；不要覆盖或混入用户已有改动。
- 一项 issue 使用一个独立分支；不要直接在 `main` / `master` 上开发。
- 先验证再提交，提交信息和 PR 必须关联 issue；不自动合并 PR。
- 不提交 secrets、`.env`、生成物、调试日志或与 issue 无关的格式化改动。

## 标准流程

### 1. 检查仓库与工作区

```bash
git status --short --branch
git remote -v
gh repo view --json nameWithOwner,defaultBranchRef
```

- 识别默认分支和当前分支。
- 如果工作区有改动，逐项记录；除非能明确隔离，否则先让用户处理。
- 先同步默认分支（不覆盖本地改动）：

```bash
git fetch origin
git switch <default-branch>
git pull --ff-only origin <default-branch>
```

### 2. 定位并领取 issue

用户给出编号或 URL 时直接使用；否则列出开放 issue，让用户选择，不要擅自挑选：

```bash
gh issue view <number> --comments
# 在用户明确要求领取后
 gh issue edit <number> --add-assignee @me
```

读取并总结：标题、背景、复现步骤、期望行为、验收标准、标签、评论中的约束、关联 PR/issue。检查是否已有进行中的 PR 或重复实现：

```bash
gh issue list --state all --search "<关键词>"
gh pr list --state all --search "<关键词>"
```

领取失败时记录权限错误，但仍需先征得用户确认再继续实现。

#### Issue 图片和附件

如果 issue 正文或评论包含图片/截图：

1. 找出所有图片链接、附件链接和 Markdown 图片引用，不要遗漏评论里的图片。
2. 优先使用 `gh issue view <number> --comments` 获取原始内容；必要时用 `gh api` 获取完整 issue/comments 数据。
3. 将可访问的图片下载到临时目录（不要放进仓库），再用图片查看工具或 `functions.read` 读取分析。若图片需要登录、已失效或无法访问，明确报告并请求用户提供图片。
4. 记录图片中的关键事实：页面/模块、错误提示、状态、布局、尺寸、数据、复现前后差异，以及图片与文字描述的对应关系。
5. 不要把临时下载文件、截图或带隐私信息的附件提交到 Git；必要时在本地脱敏后再用于测试。

图片分析结果应进入实施计划和验证标准。例如：截图显示按钮被遮挡，就需要验证不同窗口尺寸下按钮仍可见且可点击；截图显示接口错误，就需要核对错误码、请求参数和日志链路。

#### 不完整的 Issue

当图片是复现问题的必要证据时，如果图片无法读取、链接失效、需要权限或内容不清晰，应在实现前暂停，不要凭猜测修改代码。可以先完成不依赖图片的代码调查，但不能宣称已经理解或修复完整问题。


### 3. 建立实施计划

在修改前给出简短计划，至少包含：

- 根因或需求理解
- 拟修改文件/模块
- 验收标准到验证命令的映射
- 风险、兼容性和不做的范围

然后创建分支，名称应可读并包含 issue 编号，例如：

```bash
git switch -c fix/123-short-description
# 或 feat/123-short-description
```

### 4. 理解代码并实现

- 先阅读项目指引（`AGENTS.md`、`README`、贡献指南、测试说明）和相关模块。
- 通过搜索调用链、配置、数据结构和现有测试定位最小改动点。
- 优先复用项目现有模式；不要为了小 issue 顺手重构无关代码。
- bug 修复应尽量增加回归测试；需求实现应覆盖成功、失败、边界和兼容路径。
- 保持变更可解释，必要时同步用户文档、类型定义、迁移文件和 changelog。

### 5. 自验证与审查

按项目已有命令运行格式检查、类型检查、单元/集成测试和构建；若没有测试，至少执行可重复的 smoke test。验证失败不能包装成成功，需修复或在 PR 中明确说明。

```bash
git diff --check
git diff --stat
git diff
# 使用项目实际命令，例如 npm test / pnpm test / pytest / go test ./...
```

逐项核对 issue 验收标准，并检查：安全性、错误处理、日志、性能、向后兼容、测试覆盖和是否有无关改动。提交前再次查看：

```bash
git status --short
git diff --cached
```

### 6. 提交代码

只暂存本 issue 相关文件，使用 Conventional Commit，并在正文或 footer 关联 issue：

```bash
git add <相关文件>
git commit -m "fix: <简短描述>"
# 或使用正文：
git commit -m "feat: <简短描述>" -m "Refs #123"
```

不要使用 `--no-verify` 绕过检查，除非用户明确要求并记录原因。

### 7. 推送并发起 PR

提交成功且验证完成后：

```bash
git push -u origin <branch>
gh pr create --base <default-branch> --head <branch> \
  --title "fix: <描述>" \
  --body-file /tmp/pr-body.md
```

PR 正文至少包含：

```markdown
## Summary
- 做了什么

## Why
- issue 的根因或需求背景是什么
- 为什么选择这个实现方案
- 为什么没有采用其他明显方案（如适用）

## Expected Impact
- 用户或系统行为会发生什么变化
- 修复/需求完成后可观察到的效果
- 性能、兼容性、数据或运维方面的影响

## Issue
Closes #123

## Validation
- `命令` — 通过/结果
- `命令` — 通过/结果

## Notes
- 风险、兼容性、未覆盖项或需要 reviewer 关注的地方
```

`Summary` 只描述改了什么；`Why` 必须回答为什么改；`Expected Impact` 必须回答改完后大概有什么效果。不要只写“修复问题”“优化体验”这类不可验证的描述，应尽量引用 issue 的复现现象、验收标准和实际测试结果。

PR 创建后读取并核对：

```bash
gh pr view <pr-number> --json url,title,state,headRefName,baseRefName,body
```

## 最终汇报格式

用中文报告：

1. issue 编号、是否成功领取
2. 分支名
3. 变更摘要和关键文件
4. 实际执行的验证命令及结果
5. commit hash 和 commit message
6. PR URL、状态，以及剩余风险/待 reviewer 决策项

如果任一步骤失败，明确写出失败命令、错误原因、已完成部分和下一步，不要声称“已完成”。
