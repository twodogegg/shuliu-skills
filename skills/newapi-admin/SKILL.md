---
name: newapi-admin
description: Manage the user's NewAPI backend at api.darl.cn. Use when the user asks to inspect or modify NewAPI backend resources such as channels, models, tokens, users, groups, quotas, logs, options, auth, payments, 2FA, OAuth, setup, or any admin API in the imported NewAPI project.
---

# NewAPI Admin

用于管理用户的 NewAPI 后台管理 API。覆盖导入项目里的全部后台端点。

## 配置

脚本读取 skill 目录下的 `.env`：

- `NEWAPI_ADMIN_BASE_URL`
- `NEWAPI_ADMIN_USERNAME`
- `NEWAPI_ADMIN_PASSWORD`
- `NEWAPI_ADMIN_USER_ID`
- `NEWAPI_ADMIN_ACCESS_TOKEN`

不要在聊天里输出密码、session、access token、渠道 key。

## 使用

优先使用脚本，不要手写 curl。脚本会自动登录、缓存 session、补 `New-Api-User`：

```bash
node "$CLAUDE_SKILL_DIR/scripts/api.js" GET /api/channel/
node "$CLAUDE_SKILL_DIR/scripts/api.js" GET /api/user/self
node "$CLAUDE_SKILL_DIR/scripts/api.js" GET /api/user/models
node "$CLAUDE_SKILL_DIR/scripts/api.js" POST /api/channel/test '{"id":3,"model":"gpt-image-2"}'
```

在 Codex 中如果没有 `CLAUDE_SKILL_DIR`，使用 skill 实际路径：

```bash
node /Users/goudan/.agents/skills/newapi-admin/scripts/api.js GET /api/channel/
```

## 常用管理流程

### 新建分组、设置倍率、绑定渠道

用于用户要求“创建分组/价格改为 0/把某个渠道接到该分组”。

1. 先只读查询当前状态：

```bash
node "$CLAUDE_SKILL_DIR/scripts/api.js" GET /api/group/
node "$CLAUDE_SKILL_DIR/scripts/api.js" GET /api/pricing
node "$CLAUDE_SKILL_DIR/scripts/api.js" GET /api/channel/
```

2. 从 `/api/pricing` 的 `group_ratio` 和 `usable_group` 取现有配置，保留原值后追加新分组：
   - `GroupRatio` 控制分组存在与倍率，例如 `{"team":0}` 表示 `team` 分组倍率为 0。
   - `UserUsableGroups` 控制用户侧可用分组描述，例如 `{"team":"team分组"}`。

3. 用通用设置接口写入，payload 形状是 `{ "key": "...", "value": "JSON字符串" }`：

```bash
node "$CLAUDE_SKILL_DIR/scripts/api.js" PUT /api/option/ '{"key":"GroupRatio","value":"{\"default\":1,\"team\":0}"}'
node "$CLAUDE_SKILL_DIR/scripts/api.js" PUT /api/option/ '{"key":"UserUsableGroups","value":"{\"default\":\"默认分组\",\"team\":\"team分组\"}"}'
```

4. 绑定渠道时先 `GET /api/channel/{id}` 或从 `/api/channel/` 找到完整对象，只改 `group` 字段，保留其它字段后 `PUT /api/channel/`。
5. 复查 `/api/group/`、`/api/pricing`、`/api/channel/{id}`，确认分组存在、倍率正确、渠道 `group` 已变更。

### 注意事项

- `/api/group/` 没有创建接口；分组来自 `GroupRatio` 配置。
- `/api/ratio_config` 可能返回“倍率配置接口未启用”，这不是阻塞；优先用 `/api/pricing` 获取当前倍率，再用 `/api/option/` 更新。
- `GET /api/option/` 经过脚本时可能把 `key` 字段脱敏成 `***`，不要依赖它识别 option 名；必要时参考 NewAPI 源码确认键名。
- 更新渠道必须保留完整渠道对象，只做最小字段改动，避免清空 key、settings、models 等配置。

## 端点范围

项目里包含这些后台模块：

- 系统
- 用户登陆注册
- OAuth
- 用户管理
- 充值
- 两步验证
- 安全验证
- 渠道管理
- 令牌管理
- 兑换码
- 日志
- 数据统计
- 分组
- 任务
- 供应商
- 模型管理
- 系统设置

权限分级按接口描述判断：

- `无需鉴权`
- `User权限`
- `Admin权限`
- `Root权限`
- `TokenAuth`

## 安全

- 响应里如含 `key`、`session`、`token`、`Authorization`，脚本会做基础脱敏。
- 不要把 `.env` 内容贴给用户。
- 只在用户明确要求时修改后台资源。
