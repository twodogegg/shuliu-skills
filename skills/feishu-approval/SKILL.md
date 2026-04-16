---
name: feishu-approval
description: 飞书原生审批操作。审批定义、表单控件、外部选项、文件上传、审批实例、任务动作、错误排查。
required_permissions:
  - approval:approval
  - approval:approval:readonly
  - approval:instance
  - approval:instance:readonly
  - approval:instance:write
---

# 飞书原生审批

通过 Approval API 处理审批定义、表单控件、外部选项、实例创建和任务动作。优先保持主技能简洁；只有在任务明确涉及某一类细节时，再读取对应的 `references/*.md`。

**Base URL**: `https://open.feishu.cn/open-apis/approval/v4`

**关键参数**:
- `approval_code`: 审批定义编码
- `instance_code`: 审批实例编码
- `task_id`: 审批任务 ID
- `user_id_type`: 常见为 `open_id | union_id | user_id`

---

## 审批定义

| API | 端点 | 说明 |
|-----|------|------|
| 创建/更新审批定义 | `POST /approvals` | 传已有 `approval_code` 时为全量覆盖 |
| 查询审批定义 | `GET /approvals/{approval_code}` | 看定义、节点、表单结构 |

⚠️ `POST /approvals` 不是 patch 更新；带上已有 `approval_code` 时，会把原定义整体替换。

**高频提醒**：
- 审批定义里的 `approval_name`、控件 `name`、说明文字、选项文案等，涉及国际化时都要用 `@i18n@` key
- `@i18n@xxx` 必须在 `i18n_resources.texts` 里补对应 value
- API 并不支持所有审批后台控件；遇到 `formula`、`mutableGroup`、`serialNumber`、`tripGroup` 等，优先提醒“审批后台处理”

当任务涉及下面任一场景时，再读取 [`references/definition.md`](references/definition.md)：
- 审批定义整体结构
- `approval_code` 获取或复用
- `viewers` / `node_list` / `settings`
- 创建或覆盖更新审批定义

---

## 表单控件

审批定义里的 `form.form_content` 描述的是“控件定义”，不是用户提交值。

**先给最小可用片段**：
- `type`
- `id`
- `name`
- 必填配置
- 对应 `@i18n@` key

⚠️ **定义 form 和实例 form 不是同一种 JSON**：
- 定义 `form.form_content`：控件元信息和配置
- 实例 `form`：用户实际提交的值

如果用户把控件定义 JSON 直接拿去创建实例，或把实例 `value` 结构塞进定义，必须明确指出结构错位。

当任务涉及下面任一场景时，再读取 [`references/form-controls.md`](references/form-controls.md)：
- `form.form_content` 怎么写
- 控件 `type` / `id` / `name` / `required`
- 某个控件支持哪些字段
- 某个控件为什么创建定义失败

---

## 外部选项

| 场景 | 说明 |
|-----|------|
| 单选/多选控件使用外部数据源 | 走 `externalData` |
| 创建实例时选择外部选项 | `value` 传选项 ID，不传中文文案 |

**高频提醒**：
- `checkboxV2` / `radioV2` 这类外部选项场景，实例里 `value` 传外部选项接口返回的 `options[*].id`
- `option.key` 也传这个 ID
- `option.text` 传外部选项接口返回的 i18n key，不要直接传中文
- 实例详情能回显中文，不代表创建实例时应该传中文

**常用实例值结构**：
```json
{
  "id": "project_customer",
  "type": "checkboxV2",
  "value": ["recxxxx"],
  "option": [
    {
      "key": "recxxxx",
      "text": "@i18n@customers_recxxxx"
    }
  ]
}
```

当任务涉及下面任一场景时，再读取 [`references/external-options.md`](references/external-options.md)：
- `externalData` 怎么配置
- 外部选项接口返回格式
- 联动参数怎么传
- 选项加密/签名/校验问题

---

## 文件上传

| 场景 | 说明 |
|-----|------|
| 图片控件 | 先上传文件，再把返回 `code` 写进实例 |
| 附件控件 | 先上传文件，再把返回 `code` 写进实例 |

⚠️ 不能直接把本地路径、文件名或下载 URL 塞进审批实例的 `value`。

**对应流程**：
1. 调用审批文件上传接口
2. 拿到返回的文件 `code`
3. 在实例表单对应控件里传这个 `code`

当任务涉及下面任一场景时，再读取 [`references/file-upload.md`](references/file-upload.md)：
- 图片上传
- 附件上传
- 上传接口参数
- 实例里图片/附件控件的 `value` 结构

---

## 审批实例

| API | 端点 | 说明 |
|-----|------|------|
| 创建审批实例 | `POST /instances` | 发起审批 |
| 查询审批实例 | `GET /instances/{instance_code}` | 看表单、任务、时间线 |

**高频提醒**：
- 创建实例时，`form` 写的是控件值，不是 `form_content`
- 创建实例、任务动作、文件上传，优先使用应用自己的 `tenant_access_token`
- `user access token` 在实例创建里常见报错：`99991668 user access token not support`
- 如果要以某个用户身份发起，通常是在请求体里传 `user_id/open_id`，不是切成用户 token

**联系人控件常用结构**：
```json
{
  "id": "contact_user",
  "type": "contact",
  "value": ["5da97a23"],
  "open_ids": ["ou_xxx"]
}
```

**对应接口**：
- `POST /open-apis/approval/v4/instances`
- `GET /open-apis/approval/v4/instances/{instance_code}`
- 常用查询参数：`user_id_type=open_id|union_id|user_id`

当任务涉及下面任一场景时，再读取 [`references/instance.md`](references/instance.md)：
- 创建审批实例
- `instance_code`
- 自选审批人
- 实例 `form` 值格式
- 联系人、明细、外部选项类控件怎么传值

---

## 任务动作

| 动作 | API 语义 | 关键 ID |
|-----|----------|---------|
| `cancel` | 撤回审批实例，整单作废 | `approval_code`、`instance_code`、提交人 |
| `reject` | 当前审批人拒绝当前任务 | `approval_code`、`instance_code`、`task_id` |
| `specified_rollback` | 退回到已审批节点 | `task_id`、`task_def_key_list` |
| `resubmit` | 发起人修改后重新提交 | `task_id` 或实例上下文 |

⚠️ “撤回”“驳回”“退回”不是同一个动作：
- 想整单作废，用 `cancel`
- 想让当前审批人拒绝，用 `reject`
- 想退回上一节点或指定节点，用 `specified_rollback`

**高频提醒**：
- `reject_option = 1` 才是“驳回发起人后可编辑重提”的关键
- 做 `approve` / `reject` / `specified_rollback` / `resubmit` 之前，先查实例详情拿当前 `task_id`
- `specified_rollback` 还要从 `timeline` 找可回退节点的 `task_def_key`

当任务涉及下面任一场景时，再读取 [`references/task-actions.md`](references/task-actions.md)：
- 撤回实例
- 拒绝审批任务
- 指定回退
- 重新提交
- `reject_option`
- `task_id` / `task_def_key` 获取

---

## 排障

**先检查这几项**：
- 当前 `app_id/app_secret` 是否和审批定义属于同一个应用
- `open_id/user_id` 是否来自当前应用作用域
- `tenant_access_token` 是否正确
- `approval_code`、`instance_code`、`task_id` 是否取自同一条审批链路
- 用户传的是“定义结构”还是“实例值结构”

⚠️ **用户 ID 是应用作用域的**：
- 同一个人，在不同飞书应用下的 `open_id` / `user_id` 可能不同
- 报 `1390001 用户不存在请求的租户内` 或 `1390001 user id not found` 时，优先排查“跨应用复用用户 ID”

当任务涉及下面任一场景时，再读取 [`references/troubleshooting.md`](references/troubleshooting.md)：
- 错误码排查
- 字段校验失败
- `approval_code` / `instance_code` / `task_id` 混淆
- 定义结构与实例结构混淆

---

## 最佳实践

1. 先区分用户问的是“审批定义”还是“审批实例”，再决定读哪个 reference。
2. 优先给最小可用 JSON 片段，不先长篇讲概念。
3. 用户说“打回”“撤销”“驳回”时，先做动作映射，再给接口。
4. 创建实例、任务动作、文件上传优先使用 `tenant_access_token`。
5. 先查实例详情再做任务动作，不要猜 `task_id`。
6. 外部选项控件创建实例时传选项 ID，不传中文显示文案。
7. 图片和附件控件必须先上传，再写返回 `code`。
8. 遇到不支持的控件，直接提示转审批后台配置，不要硬编 API JSON。
