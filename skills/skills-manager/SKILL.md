---
name: skills-manager
description: 管理当前项目中的 skills，包括查看、查找、安装、卸载、升级、初始化、从本地路径安装和同步；当用户提到安装 skill、删除 skill、升级 skills、查看已安装 skills、安装本地 skill、创建新 skill 时使用。也适用于中文表达，如“安装这个 skill”“把本地 skills 装上”“查看有哪些 skills”。
argument-hint: "<action> [target] [options]"
disable-model-invocation: true
allowed-tools: Bash
---

You are managing skills through the `skills` CLI.

Default behavior:
- Default scope is project scope.
- Default agents are: `claude-code codex`.
- Only use global scope (`-g`) when the user explicitly asks for global install, list, remove, or update.
- Only override the default agents when the user explicitly names different agents.

Intent handling:
- If the user is asking how to do something, explain the command and do not execute it.
- If the user explicitly asks you to perform the action, run the command.
- Understand both English and Chinese action words.

Map common phrases to actions:
- list / ls / 查看 / 看看 / 列出 / 有哪些 -> list
- find / search / 查找 / 搜索 -> find
- add / install / 装 / 安装 -> add
- remove / uninstall / delete / 删 / 删除 / 卸载 -> remove
- update / upgrade / 升级 / 更新 -> update
- init / create / 创建 skill / 新建 skill -> init
- restore / 恢复 -> experimental_install
- sync / 同步 -> experimental_sync

Rules:
1. Never install, remove, or update skills unless the user explicitly asked.
2. Do not guess package names, skill names, local paths, or agent names.
3. Prefer project scope by default.
4. When an action supports agents, default to `-a claude-code codex`.
5. For remove actions, make sure the target skill is explicit.
6. For local installation, accept a filesystem path such as `./my-skill`, `./skills`, or `/absolute/path/to/skills` as the source.
7. Use `--list` when the source directory may contain multiple skills and the user wants to see what is available before installing.
8. Return the exact command that was run and a short result summary.

Command patterns:

List installed skills:
- project default:
  `npx skills ls -a claude-code codex --json`
- global:
  `npx skills ls -g -a claude-code codex --json`

Find skills:
- `npx skills find <query>`

Install/add from repository or URL:
- project default:
  `npx skills add <package> -a claude-code codex`
- global:
  `npx skills add <package> -g -a claude-code codex`
- specific skills:
  `npx skills add <package> -s <skill_names> -a claude-code codex`

Install/add from local path:
- single local skill directory:
  `npx skills add ./my-local-skill -a claude-code codex`
- local directory that may contain multiple skills, list first:
  `npx skills add ./my-skills --list`
- install a named skill from a local directory:
  `npx skills add ./my-skills -s <skill_name> -a claude-code codex`

Remove/uninstall:
- project default:
  `npx skills remove <skill> -a claude-code codex`
- global:
  `npx skills remove -g <skill> -a claude-code codex`

Update/upgrade:
- project default:
  `npx skills update`
- global:
  `npx skills update -g`
- specific skills:
  `npx skills update <skill_names>`

Initialize a new skill:
- `npx skills init <name>`
- Do not use `npx skills init --help` as a discovery command; it can behave like a real init invocation.

Restore from lock file:
- `npx skills experimental_install`

Sync installed packages:
- `npx skills experimental_sync -a claude-code codex`

Workflow:
1. Identify whether the user wants explanation only or wants execution.
2. Identify the action.
3. Detect whether the user explicitly asked for global scope.
4. Detect whether the user explicitly provided custom agents.
5. If no custom agents are provided for an agent-aware command, use `claude-code codex`.
6. If the source is a local path and the user is unsure what is inside it, prefer showing `--list` first.
7. Run the minimal command needed.
8. Return the command and outcome.

Output format:
## Command
`...`

## Result
- ...

## Next
- ...
