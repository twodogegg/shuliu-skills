# 审批定义速查

本页用于回答审批定义本身的结构问题，对应飞书官方文档：

- 原生审批定义概述：`https://open.feishu.cn/document/server-docs/approval-v4/approval/overview-of-approval-resources.md`
- 创建审批定义：`https://open.feishu.cn/document/server-docs/approval-v4/approval/create.md`
- 查看指定审批定义：`https://open.feishu.cn/document/server-docs/approval-v4/approval/get.md`

## 先说最重要的限制

- 创建/更新审批定义使用的是 `tenant_access_token`
- `POST /approvals` 既能新建，也能更新
- 如果请求体里传已有 `approval_code`，是**全量覆盖更新**
- API 方式**不支持条件分支**
- 官方明确提醒：
  - 通过 API 创建的审批定义，**无法在审批后台或通过 API 停用、删除**
  - 对自建应用，官方并不推荐优先用 API 新建审批定义

## 基础概念

### `approval_code`

- 审批定义唯一编码
- 可用于查看定义、创建实例、做任务动作
- 获取方式：
  - 创建审批定义接口返回
  - 审批后台开发者模式 URL 里的 `definitionCode`

### `approval_name`

- 审批名称
- 传的是国际化 key，不是直接中文
- 必须以 `@i18n@` 开头
- 官方要求长度不少于 9 个字符

### `viewers`

- 定义“谁能从审批应用前台发起该审批”

### `form.form_content`

- 审批定义表单控件
- 是 JSON 数组序列化后的字符串
- 定义的是控件结构，不是实例值

### `node_list`

- 审批流程节点列表
- 第一个固定是 `START`
- 最后一个固定是 `END`

### 控件 ID / 自定义控件 ID

- `id`：控件唯一 ID
- `custom_id`：控件自定义 ID，可在审批后台开发者模式里配置

### 节点 ID / 自定义节点 ID

- 创建定义时你传的是 `id`
- 查询定义时会返回 `node_id` 和可选的 `custom_node_id`
- 后续实例创建里的 `node_approver_*` 常常要用这里的节点标识

## 官方接口

| API | 端点 | 说明 |
|-----|------|------|
| 创建/更新审批定义 | `POST /open-apis/approval/v4/approvals` | 传 `approval_code` 时为全量覆盖更新 |
| 查看指定审批定义 | `GET /open-apis/approval/v4/approvals/{approval_code}` | 查看表单、节点、可见范围、状态 |

**频率限制**：

- 创建/更新：`1000 次/分钟`、`50 次/秒`
- 查看：`100 次/分钟`

**权限**：

- 创建/更新：`approval:approval` 或 `approval:definition`
- 查看：`approval:approval` / `approval:approval:readonly` / `approval:definition`

**通用鉴权**：

- `Authorization: Bearer <tenant_access_token>`
- 创建/更新还需要：
  - `Content-Type: application/json; charset=utf-8`

## 创建审批定义请求体骨架

```json
{
  "approval_name": "@i18n@approval_name",
  "viewers": [
    {
      "viewer_type": "TENANT"
    }
  ],
  "form": {
    "form_content": "[{\"id\":\"widget_1\",\"name\":\"@i18n@widget_name\",\"type\":\"input\",\"required\":true}]"
  },
  "node_list": [
    {
      "id": "START"
    },
    {
      "id": "manager_node",
      "name": "@i18n@manager_node_name",
      "node_type": "AND",
      "approver": [
        {
          "type": "Personal",
          "user_id": "ou_xxx"
        }
      ]
    },
    {
      "id": "END"
    }
  ],
  "i18n_resources": [
    {
      "locale": "zh-CN",
      "is_default": true,
      "texts": [
        {
          "key": "@i18n@approval_name",
          "value": "测试审批"
        },
        {
          "key": "@i18n@widget_name",
          "value": "申请事由"
        },
        {
          "key": "@i18n@manager_node_name",
          "value": "直属主管审批"
        }
      ]
    }
  ]
}
```

## 创建/更新时的查询参数

### `user_id_type`

- 可选：`open_id | union_id | user_id`
- 默认 `open_id`
- 只要请求体里带用户 ID 字段，这个参数就决定它的类型

### `department_id_type`

- 可选：`department_id | open_department_id`
- 影响 `viewer_department_id` 这类部门字段的类型

## 高频字段

### 1. `approval_code`

- 不传：新建
- 传已有 code：全量覆盖更新

### 2. `description`

- 审批描述
- 和 `approval_name` 一样，传 `@i18n@` key

### 3. `viewers`

创建接口里官方支持：

- `TENANT`
- `DEPARTMENT`
- `USER`
- `NONE`

高频规则：

- `USER`：需要补 `viewer_user_id`
- `DEPARTMENT`：需要补 `viewer_department_id`
- `TENANT` / `NONE`：不用补用户或部门 ID
- 创建接口里列表最大长度 `200`

补充：

- 查看定义接口的返回 `viewers` 里，官方还可能返回 `ROLE`、`USER_GROUP`
- 这表示“查询结果比创建参数支持的可见人类型更丰富”，不要反过来以为创建接口也直接支持这两个类型

### 4. `form.form_content`

- 必填
- 是 JSON 数组压缩成字符串
- 每个控件至少关注：
  - `id`
  - `custom_id`
  - `name`
  - `type`
  - `required`

高频提醒：

- 定义里的 `form_content` 和实例里的 `form` 不是同一种 JSON
- 报控件参数错时，优先看：
  - 控件 `id`
  - 控件 `type`
  - 国际化 key 是否缺失

### 5. `node_list`

固定要求：

- 第一个节点必须是 `START`
- 最后一个节点必须是 `END`
- `START` 和 `END` 不需要 `name`、`node_type`、`approver`

中间审批节点高频字段：

- `id`
- `name`
- `node_type`
- `approver`
- `ccer`
- `privilege_field`
- `approver_chosen_multi`
- `approver_chosen_range`
- `starter_assignee`

### 6. `node_type`

官方可选：

- `AND`
- `OR`
- `SEQUENTIAL`

高频提醒：

- `SEQUENTIAL` 时，官方要求 `approver.type` 必须是 `Free`

### 7. `approver.type`

官方常用审批人类型：

- `Supervisor`
- `SupervisorTopDown`
- `DepartmentManager`
- `DepartmentManagerTopDown`
- `Personal`
- `Free`

规则：

- `Personal`：必须补 `user_id`
- 主管/部门负责人类：必须补 `level`
- `Free`：不用传 `user_id` 和 `level`

### 8. `ccer.type`

和 `approver.type` 类似，但高频差异是：

- 抄送人**不支持** `Free`

### 9. `privilege_field`

- 用来控制某节点下表单项的读写权限
- 字段：
  - `writable`
  - `readable`
- 里面填的是表单控件 ID，必须和 `form_content` 里的控件 `id` 一致

### 10. `approver_chosen_multi`

- 发起人自选审批人时，是否允许多选

### 11. `approver_chosen_range`

- 发起人自选审批人的可选范围

官方类型：

- `ALL`
- `PERSONAL`
- `ROLE`

规则：

- `ALL`：不用传 `id_list`
- `PERSONAL`：`id_list` 传用户 ID，类型受 `user_id_type` 影响
- `ROLE`：`id_list` 传角色 ID

### 12. `starter_assignee`

- 当审批人命中“提交人本人”时怎么处理

官方可选：

- `STARTER`
- `AUTO_PASS`
- `SUPERVISOR`
- `DEPARTMENT_MANAGER`

### 13. `settings`

高频设置：

- `revert_interval`
- `revert_option`
- `reject_option`
- `quick_approval_option`

高频结论：

- `revert_interval`：审批通过后允许撤回的秒数；`0` 表示不可撤回
- `revert_option`：
  - `0`：不支持审批通过第一个节点后撤回
  - `1`：支持
- `reject_option`：
  - `0`：拒绝后流程终止
  - `1`：退回发起人，可编辑后重新提交
- `quick_approval_option`：
  - `0`：禁用卡片快捷审批
  - `1`：启用

### 14. `config`

- 控制审批后台是否允许人手改这条定义

高频字段：

- `can_update_viewer`
- `can_update_form`
- `can_update_process`
- `can_update_revert`
- `help_url`

### 15. `icon`

- 审批图标枚举
- 默认 `0`

### 16. `i18n_resources`

- 必填
- 用来声明所有 `@i18n@` key 的文案

高频规则：

- `locale`：`zh-CN | en-US | ja-JP`
- `is_default=true` 的默认语言必须覆盖所有 key
- 非默认语言可以缺 key，系统会回退到默认语言

### 17. `process_manager_ids`

- 审批流程管理员 ID 列表
- ID 类型受 `user_id_type` 影响
- 最大长度 `200`

## 查看审批定义

### 查询参数

#### `locale`

- 语言
- 默认是审批定义默认语言
- 可选：`zh-CN | en-US | ja-JP`

#### `with_admin_id`

- 是否返回 `approval_admin_ids`
- 默认 `false`

#### `user_id_type`

- 可选：`open_id | union_id | user_id`
- 默认 `open_id`

### 返回体里重点看什么

- `approval_name`
- `status`
- `form`
- `node_list`
- `viewers`
- `approval_admin_ids`

### `status`

官方可选：

- `ACTIVE`
- `INACTIVE`
- `DELETED`
- `UNKNOWN`

### `form`

- 查询接口返回的是 JSON 字符串
- 可以直接拿来确认：
  - 控件 `id`
  - 控件 `custom_id`
  - 控件 `type`
  - `display_condition`
  - 默认值相关字段

### `node_list`

查询接口高频字段：

- `name`
- `need_approver`
- `node_id`
- `custom_node_id`
- `node_type`
- `approver_chosen_multi`
- `approver_chosen_range`
- `require_signature`

高频结论：

- `need_approver=true` 表示该节点发起实例时要提交人自选审批人
- `require_signature=true` 表示审批同意时需要手写签名

### `viewers`

查询接口返回里的高频字段：

- `type`
- `id`
- `user_id`

注意：

- 查询返回里 `USER` 类型场景下，`id` / `user_id` 的含义要结合当前返回口径看
- 如果你只是为了创建实例或补自选审批人，优先把它当“定义展示信息”，不要直接拿这里的 viewer 结构去反推创建参数格式

### `approval_admin_ids`

- 只有 `with_admin_id=true` 时才返回

## 创建和查看之间最容易混的点

1. 创建接口的 `viewers` 可见类型，不等于查看接口会返回的所有 `viewers.type`。
2. 创建接口的 `node_list[].id`，和查看接口返回的 `node_list[].node_id/custom_node_id` 不是同一层语义。
3. 创建接口里的 `form.form_content` 是“定义结构”；实例创建接口里的 `form` 是“用户值”。
4. 创建接口不支持条件分支，但查看接口里你可能看到已有定义有更复杂结构，这不代表 API 也能创建出来。

## 风险提醒

- `POST /approvals` 传已有 `approval_code` 时是全量覆盖更新
- API 不支持条件分支流程
- 通过 API 创建的审批定义无法从审批后台或 API 停用、删除
- `SEQUENTIAL` 节点只能配 `Free`
- `ccer` 不支持 `Free`
- 所有 `@i18n@` key 都必须在 `i18n_resources` 里有文案
- 表单控件 ID、节点 ID、权限字段引用 ID 必须前后一致

## 常用用途

这个接口组合最常用来做三件事：

1. 确认线上审批定义的真实 `approval_code`
2. 提前拿到控件 `id/custom_id/type`，为创建实例准备表单值
3. 提前拿到节点 `node_id/custom_node_id`，为自选审批人、任务动作或排障做准备

## 官方错误码补充

### 创建/更新

高频错误码：

- `1390001`: 参数错误
- `1390002`: `approval_code` 不存在
- `1390004`: 用户 ID 不存在或类型不匹配
- `1390009`: 无操作权限
- `1390013`: 不支持自定义审批流程
- `1390015`: 审批定义已停用
- `1395001`: 服务错误

### 查看

高频错误码：

- `1390001`: 参数错误
- `1390002`: `approval_code` 不存在
- `1390016`: 审批定义已删除
- `1395001`: 服务错误
