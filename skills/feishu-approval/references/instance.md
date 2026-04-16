# 审批实例速查

本页用于回答审批实例的 `create/get`，以及实例 `form` 该怎么传值。内容已按飞书官方文档补齐高频字段；如果需要 100% 对齐原文，优先再查看官方 Markdown：

- 创建审批实例：`https://open.feishu.cn/document/server-docs/approval-v4/instance/create.md`
- 获取单个审批实例详情：`https://open.feishu.cn/document/server-docs/approval-v4/instance/get.md`

## 基础概念

- 审批实例基于审批定义创建。
- 创建实例前，必须先有 `approval_code`。
- 创建成功后会返回 `instance_code`。
- 查询实例详情时，路径参数 `instance_id` 通常传 `instance_code`。
- 如果创建实例时传了 `uuid`，查询详情时也可以直接用这个 `uuid` 当 `instance_id`。

## 官方接口

| API | 端点 | 说明 |
|-----|------|------|
| 创建审批实例 | `POST /open-apis/approval/v4/instances` | 发起审批 |
| 获取单个审批实例详情 | `GET /open-apis/approval/v4/instances/{instance_id}` | 看状态、表单、任务、评论、动态 |

**官方频率限制**：
- 创建实例：`100 次/分钟`
- 查询实例详情：`1000 次/分钟`、`50 次/秒`

**权限要求**：
- 创建实例：`approval:approval` 或 `approval:instance`
- 查询实例：`approval:approval` / `approval:approval:readonly` / `approval:instance`
- 查询实例时如果想拿返回里的 `user_id` 敏感字段，还要有 `contact:user.employee_id:readonly`

**鉴权**：
- 两个接口官方文档都写的是 `tenant_access_token`
- Header:
  - `Authorization: Bearer <tenant_access_token>`
- 创建接口还需要：
  - `Content-Type: application/json; charset=utf-8`

## 创建审批实例最小骨架

```json
{
  "approval_code": "APPROVAL_CODE",
  "open_id": "ou_xxx",
  "form": "[{\"id\":\"reason\",\"type\":\"input\",\"value\":\"测试\"}]"
}
```

## 创建实例请求里的关键字段

### 必填字段

#### `approval_code`

- 必填
- 指向已有审批定义

#### `form`

- 必填
- 是 JSON 数组压缩转义后的字符串
- 数组内元素表示每个控件的“值”
- 各控件值结构要和审批定义里的控件类型对应

### 发起人相关

#### `user_id` / `open_id`

- 二选一
- 如果都传，`user_id` 优先
- 这是审批发起人，不是审批人列表

#### `department_id`

- 发起人所属部门 ID
- 用户只属于一个部门时可以不填
- 用户属于多个部门时，不填默认取部门列表第一个
- 不支持填根部门
- 需要传 `department_id` 类型的部门 ID

### 自选审批人 / 抄送人

如果审批定义里的某个节点是发起人自选，则实例创建时需要补下面这些字段：

- `node_approver_user_id_list`
- `node_approver_open_id_list`
- `node_cc_user_id_list`
- `node_cc_open_id_list`

这些字段里的 `key` 可以是：

- `node_id`
- `custom_node_id`

高频规则：

- `node_approver_user_id_list` 和 `node_approver_open_id_list` 如果同时传，官方文档写的是“取并集生效”
- `node_cc_user_id_list` 和 `node_cc_open_id_list` 如果同时传，官方文档写的是“取并集生效”
- `node_cc_*_list` 最大长度 `20`

### 幂等与实例行为控制

#### `uuid`

- 审批实例幂等键
- 单个企业内必须唯一
- 同一个 `uuid` 只能成功创建一个实例
- 如果冲突会返回错误码 `60012`
- 官方建议格式类似 UUID，但不强制；长度 `1~64`

#### `allow_resubmit`

- 是否展示“提交”按钮
- 适用于审批人退回后，发起人在同一个实例内修改并再次提交

#### `allow_submit_again`

- 是否展示“再次提交”按钮
- 适用于周期性提单场景
- 行为是按当前表单内容再次创建一个新的审批实例

#### `forbid_revoke`

- 是否禁止撤销审批实例
- 默认 `false`

#### `cancel_bot_notification`

- 取消指定 Bot 推送通知
- 官方枚举：
  - `1`：取消通过通知
  - `2`：取消拒绝通知
  - `4`：取消取消通知
- 支持位运算叠加，例如 `3` 表示取消 1 和 2

#### `node_auto_approval_list`

- 设置自动通过的节点
- 最大长度 `10`
- 结构里包含：
  - `node_id_type`: `CUSTOM | NON_CUSTOM`
  - `node_id`

### 国际化与展示

#### `i18n_resources`

- 创建实例时也支持国际化资源
- 官方文档特别说明：目前只支持为表单的单行、多行文本控件赋值
- 结构包含：
  - `locale`: `zh-CN | en-US | ja-JP`
  - `texts`
  - `is_default`

#### `title`

- 审批实例展示名称
- 如果传了，则审批列表中的审批名称使用实例 title
- 如果不传，则使用审批定义名称
- 这里传的是 `@i18n@xxx` key，不是直接传中文

#### `title_display_method`

- 审批详情页 title 展示模式
- `0`：定义 title 和实例 title 都有时，全部展示，用竖线分隔
- `1`：定义和实例都有时，只展示实例 title
- 默认 `0`

## 常见控件值结构

如果定义里包含图片或附件控件，先不要急着组实例 `form`。需要先调用审批文件上传接口，拿到文件 `code` 后，再把 `code` 放进对应控件的 `value`。

### 单行文本 / 多行文本 / 地址

```json
{
  "id": "reason",
  "type": "input",
  "value": "测试"
}
```

补充：

- `textarea` 和 `input` 的值都是字符串
- `address` 也是字符串，官方示例格式类似：
  - `China/Beijing/Beijing/Chaoyang Qu/chang an jie`

### 数字 / 金额 / 公式

```json
{
  "id": "amount",
  "type": "number",
  "value": 1234.56
}
```

补充：

- 官方查询示例里 `number` / `amount` / `formula` 都按数值返回
- 官方创建请求示例里也出现过数字写成字符串的例子，但实战里仍建议按字段语义传数值

### 日期

```json
{
  "id": "apply_time",
  "type": "date",
  "value": "2019-10-01T08:12:01+08:00"
}
```

补充：

- 官方要求 RFC3339 格式

### 日期区间

```json
{
  "id": "period",
  "type": "dateInterval",
  "value": {
    "start": "2019-10-01T08:12:01+08:00",
    "end": "2019-10-02T08:12:01+08:00",
    "interval": 2.0
  }
}
```

### 联系人

```json
{
  "id": "contact_user",
  "type": "contact",
  "value": ["f8ca557e"],
  "open_ids": ["ou_12345"]
}
```

说明：

- 官方文档写明 `value` 放的是用户 `user_id`
- `open_ids` 放的是用户 `open_id`

### 部门

```json
{
  "id": "department_field",
  "type": "department",
  "value": [
    {
      "open_id": "od-xxx"
    }
  ]
}
```

### 单选 / 多选

```json
{
  "id": "tags",
  "type": "checkboxV2",
  "value": ["option_1"]
}
```

补充：

- `radio/radioV2`：`value` 对应选项文本；如果关联外部选项，则传选项 ID
- `checkbox/checkboxV2`：`value` 对应选项文本数组；如果关联外部选项，则传选项 ID 数组

### 图片

```json
{
  "id": "receipt_image",
  "type": "image",
  "value": ["D93653C3-2609-4EE0-8041-61DC1D84F0B5"]
}
```

注意：

- 创建实例时，`value` 里放的是上传接口返回的文件 `code`
- 不是本地路径
- 不是文件 URL

### 附件

```json
{
  "id": "receipt_file",
  "type": "attachmentV2",
  "value": ["D93653C3-2609-4EE0-8041-61DC1D84F0B5"]
}
```

注意：

- 实例控件类型跟定义里的控件类型一致，通常是 `attachmentV2`
- 上传文件接口里的 `type` 则要传 `attachment`

### 明细 / 表格

```json
{
  "id": "detail_list",
  "type": "fieldList",
  "value": [
    [
      {
        "id": "detail_item_type",
        "type": "checkbox",
        "value": ["item_a"]
      }
    ]
  ]
}
```

说明：

- `fieldList` 的 `value` 是二维数组
- 里面按明细行逐项放子控件值

### 关联审批

```json
{
  "id": "related_instance",
  "type": "connect",
  "value": ["81D31358-93AF-92D6-7425-01A5D67C4E71"]
}
```

说明：

- `connect` 的值是被关联审批实例的 `instance_code`

### 文档

```json
{
  "id": "doc_field",
  "type": "document",
  "value": {
    "token": "doxcx7B8OzLFHExkiwYuPGAwf",
    "type": "doc",
    "title": "title",
    "url": "https://xxx.xxx.xxx/docx/doxcx7B8OzLFHExkiwYuPGAwf"
  }
}
```

### 请假 / 补卡类控件组

这些控件组官方也列在实例详情文档中：

- `leaveGroup`
- `leaveGroupV2`
- `remedyGroup`

如果用户明确问这些控件组的值结构，优先回到官方文档原文确认，不要凭通用控件经验猜。

## 查询审批实例

### 路径参数

#### `instance_id`

- 通常传 `instance_code`
- 如果创建实例时传了 `uuid`，也可以传 `uuid`

### 查询参数

#### `locale`

- 语言
- 可选：`zh-CN | en-US | ja-JP`
- 默认是审批定义 `i18n_resources` 里 `is_default=true` 的语言

#### `user_id`

- 发起审批的用户 ID
- 它的类型由 `user_id_type` 决定

#### `user_id_type`

- 可选：`open_id | union_id | user_id`
- 默认 `open_id`
- 如果传 `user_id`，官方文档要求对应字段权限

## 查询实例详情时重点看什么

优先关注：

- `status`
- `form`
- `task_list`
- `comment_list`
- `timeline`
- `approval_code`
- `instance_code`
- `files`
- `cc_user_list`
- `serial_number`
- `reverted`

### 常见状态

- `PENDING`
- `APPROVED`
- `REJECTED`
- `CANCELED`
- `DELETED`

## 返回体里高频字段

### 实例级字段

- `approval_name`: 审批名称
- `approval_code`: 审批定义 Code
- `instance_code`: 审批实例 Code
- `uuid`: 审批实例唯一标识
- `serial_number`: 审批单编号
- `start_time`: 创建时间，毫秒时间戳
- `end_time`: 完成时间，毫秒时间戳；未完成为 `0`
- `status`: 审批实例状态
- `department_id`: 发起人部门 ID
- `user_id` / `open_id`: 发起人 ID
- `form`: 审批表单控件 JSON 字符串
- `files`: 审批附件
- `modified_instance_code`: 修改的原实例 Code，仅在查询修改实例时返回
- `reverted_instance_code`: 撤销的原实例 Code，仅在查询撤销实例时返回
- `reverted`: 单据是否被撤销

### `task_list`

高频字段：

- `id`: 任务 ID
- `user_id` / `open_id`: 审批人
- `status`: 任务状态
- `node_id`
- `custom_node_id`
- `node_name`
- `type`: `AND | OR | AUTO_PASS | AUTO_REJECT | SEQUENTIAL`
- `start_time`
- `end_time`

任务状态常见值：

- `PENDING`
- `APPROVED`
- `REJECTED`
- `TRANSFERRED`
- `DONE`

### `comment_list`

高频字段：

- `id`
- `user_id` / `open_id`
- `comment`
- `create_time`
- `files`

### `timeline`

高频字段：

- `type`
- `create_time`
- `user_id` / `open_id`
- `user_id_list` / `open_id_list`
- `task_id`
- `comment`
- `cc_user_list`
- `ext`
- `node_key`
- `files`

官方文档里常见动态类型包括：

- `START`
- `PASS`
- `REJECT`
- `AUTO_PASS`
- `AUTO_REJECT`
- `REMOVE_REPEAT`
- `TRANSFER`
- `ADD_APPROVER_BEFORE`
- `ADD_APPROVER`
- `ADD_APPROVER_AFTER`
- `DELETE_APPROVER`
- `ROLLBACK_SELECTED`
- `ROLLBACK`
- `CANCEL`
- `DELETE`
- `CC`

排查任务动作时：

- `reject` / `approve` / `resubmit` 优先看 `task_list[*].id`
- `specified_rollback` 除了 `task_id`，还要结合 `timeline` / 节点信息找可回退节点

## 高频坑

- 直接把定义阶段的控件配置塞到实例 `form` 里
- `form` 没压成字符串
- 日期控件把定义里的格式字符串和实例里的 RFC3339 时间混了
- 自选审批节点没补 `node_approver_*`
- 多选 / 外部选项提交的是文本还是 ID 没分清
- 图片 / 附件控件提交的是本地路径、文件 URL 或文件名，而不是上传接口返回的 `code`
- 发起人属于多个部门却没传 `department_id`，结果实例挂到了错误部门
- 需要幂等却没传 `uuid`
- 把实例查询里的 `user_id_type` 当成创建接口也支持的公共参数
- 只拿 `instance_code` 就直接猜 `task_id`

## 错误码补充

官方创建实例文档里重点列了这些错误码：

- `1390001`: 参数错误；如果报错里带控件 ID，先定位控件定义或实例表单值
- `1390015`: 审批定义已停用
- `1390013`: 不支持自定义审批流程
- `1395001`: 服务异常，先检查参数与频率，再重试
- `60012`: `uuid` 幂等冲突
