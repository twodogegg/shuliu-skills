# 审批任务动作速查

本页用于回答审批实例撤回、审批任务拒绝、退回、重新提交，以及“打回”到底该映射成哪个接口。

官方文档直链：

- 撤回审批实例：`https://open.feishu.cn/document/server-docs/approval-v4/instance/cancel.md`
- 拒绝审批任务：`https://open.feishu.cn/document/server-docs/approval-v4/task/reject.md`
- 退回审批任务：`https://open.feishu.cn/document/server-docs/approval-v4/task/specified_rollback.md`
- 重新提交审批任务：`https://open.feishu.cn/document/server-docs/approval-v4/task/resubmit.md`

## 先回答身份问题

这几个接口，官方文档写的请求头都是：

- `Authorization: Bearer <tenant_access_token>`

也就是说：

- **调用身份是系统身份**，不是 `user_access_token`
- 但**动作归属人**仍然通过请求里的 `user_id` 决定

可以把它理解成：

- `tenant_access_token`：代表“当前应用有权调用这个接口”
- 请求体里的 `user_id`：代表“当前是哪一个用户在执行撤回 / 驳回 / 退回 / 重提”

所以实战里不要把这两件事混成一件事：

- 不是用用户 token 去做任务动作
- 也不是只拿系统 token、不传操作者 `user_id`

## 通用规则

### 通用鉴权

- 全部使用 `tenant_access_token`
- `Content-Type: application/json; charset=utf-8`

### 通用 `user_id_type`

这几个动作接口都支持查询参数 `user_id_type`：

- `open_id`
- `union_id`
- `user_id`

默认值：

- `open_id`

注意：

- 请求体里的 `user_id` 字段，实际类型由查询参数 `user_id_type` 决定
- 如果 `user_id_type=user_id`，官方文档要求有 `contact:user.employee_id:readonly`

### 通用权限

- `cancel`：`approval:approval` / `approval:approval:readonly` / `approval:instance`
- `reject` / `specified_rollback` / `resubmit`：`approval:approval` / `approval:approval:readonly` / `approval:task`

### 先做动作判断

用户说：

- “撤销审批”
- “打回”
- “驳回”
- “退回上一步”

不要直接给接口，先判断他要的是哪一种：

| 诉求 | 推荐接口 | 语义 |
| --- | --- | --- |
| 作废整单 | `cancel` | 撤回审批实例 |
| 驳回当前审批并结束或退回发起人 | `reject` | 拒绝审批任务 |
| 退回到上一步或指定已审批节点 | `specified_rollback` | 退回审批任务 |
| 发起人修改后再次提交 | `resubmit` | 重新提交审批任务 |

## 1. 撤回审批实例 `cancel`

**接口**：

- `POST /open-apis/approval/v4/instances/cancel`

**频率限制**：

- `100 次/分钟`

**是谁操作**：

- 请求体里的 `user_id` 是**审批提交人**
- 不是当前审批人

**最小请求体**：

```json
{
  "approval_code": "APPROVAL_CODE",
  "instance_code": "INSTANCE_CODE",
  "user_id": "提交人ID"
}
```

**关键点**：

- 操作对象是实例，不是任务
- 需要提交人的 `user_id`
- 审批定义里要允许撤销审批中的申请，或允许撤销 x 天内通过的审批
- 官方特别说明：
  - 撤回审批中的实例，流程结束
  - 撤回已通过实例，实例会变成“审批中”

## 2. 拒绝审批任务 `reject`

**接口**：

- `POST /open-apis/approval/v4/tasks/reject`

**频率限制**：

- `100 次/分钟`

**是谁操作**：

- 请求体里的 `user_id` 是**当前审批任务的审批人**
- 不是提交人

**最小请求体**：

```json
{
  "approval_code": "APPROVAL_CODE",
  "instance_code": "INSTANCE_CODE",
  "user_id": "当前审批人ID",
  "task_id": "当前待处理任务ID",
  "comment": "资料不符合规则，请修改后重新提交"
}
```

**关键点**：

- 操作对象是任务，不是实例
- 需要当前审批人的 `user_id`
- 需要当前待处理的 `task_id`
- 官方文档补充了一点很重要：
  - 如果审批定义流程里有条件分支，`reject` 时可能还需要额外传 `form`
  - 否则会影响后续分支条件流转
- `form` 的用法和实例创建时一样，都是 JSON 数组转字符串
- 如果审批定义里 `settings.reject_option = 1`，则会退回发起人，发起人可编辑后重新提交
- 如果 `reject_option = 0`，默认是拒绝后流程终止

## 3. 退回审批任务 `specified_rollback`

**接口**：

- `POST /open-apis/approval/v4/instances/specified_rollback`

**频率限制**：

- `1000 次/分钟`
- `50 次/秒`

**是谁操作**：

- 请求体里的 `user_id` 是**当前 PENDING 任务的审批人**

**最小请求体**：

```json
{
  "user_id": "当前审批人ID",
  "task_id": "当前待处理任务ID",
  "reason": "申请事项填写不具体，请重新填写",
  "task_def_key_list": ["START"]
}
```

**关键点**：

- `task_def_key_list` 不是随便写
- 要从实例详情的 `timeline` 里找动态类型为 `PASS` 的节点 `node_key`
- 官方文档允许一次退回到一个或多个节点
- `task_def_key_list` 长度范围是 `1~100`
- 官方示例里可以退回到 `START`
- `extra` 字段是灰度参数，暂未开放，默认不要用

## 4. 重新提交审批任务 `resubmit`

**接口**：

- `POST /open-apis/approval/v4/tasks/resubmit`

**频率限制**：

- `100 次/分钟`

**是谁操作**：

- 请求体里的 `user_id` 是**操作人**，通常就是退回后的发起人

**最小请求体**：

```json
{
  "approval_code": "APPROVAL_CODE",
  "instance_code": "INSTANCE_CODE",
  "user_id": "发起人ID",
  "task_id": "退回后的任务ID",
  "form": "[{\"id\":\"reason\",\"type\":\"input\",\"value\":\"已修改\"}]"
}
```

**关键点**：

- `form` 必填
- `form` 用法和创建审批实例时一致
- 传值时仍然是 JSON 数组转字符串
- 不是把旧实例自动恢复，还是要重新传控件值
- 官方文档还补充了一个容易漏的点：
  - `comment` 也支持传
  - 但它本身是 JSON 字符串，不是普通纯文本
  - 里面可以带 `text` 和附件信息

## `task_id` 和回退节点怎么拿

只要涉及任务动作，都优先提醒：

1. 调用实例详情接口
2. 从 `task_list` 里找当前 `PENDING` 的任务，拿 `task_id`
3. 如果是 `specified_rollback`，再从 `timeline` 里找动态类型为 `PASS` 的 `node_key`

补充：

- `reject` / `resubmit` 官方都明确要求 `task_id`
- `specified_rollback` 同时要求 `task_id` 和 `task_def_key_list`

## `reject_option` 怎么回答

如果用户问“驳回后能不能修改重提”，直接给这个结论：

- `settings.reject_option = 0`
  - 拒绝后流程终止
- `settings.reject_option = 1`
  - 退回至发起人，发起人可编辑流程后重新提交

## 高频坑

- 把“打回”误答成 `cancel`
- 只有 `instance_code`，没有 `task_id` 就开始拼 `reject`
- 拿提交人的 ID 去做 `reject` / `specified_rollback`，而不是当前审批人的 ID
- `specified_rollback` 的 `task_def_key_list` 不是从 `timeline` 里拿的
- 以为 `reject` 后一定能重新提交，但实际上定义里没开 `reject_option = 1`
- 用 `user_access_token` 调任务动作接口，而不是 `tenant_access_token`
- 传了 `tenant_access_token`，却忘了请求体里的 `user_id` 仍然要对应真实操作者
- `user_id_type` 没和请求体里的 `user_id` 保持一致
- `resubmit` 忘了重新传完整 `form`
- `reject` 场景有条件分支却没补 `form`

## 官方错误码补充

### `cancel`

高频错误码：

- `1390001`: 参数错误
- `1390002`: `approval_code` 不存在
- `1390003`: `instance_code` 不存在
- `1390018`: 不支持手写签名，需到客户端处理
- `1395001`: 服务错误

### `reject`

高频错误码：

- `1390001`: 参数错误
- `1390002`: `approval_code` 不存在
- `1390003`: `instance_code` 不存在
- `1390010`: `task_id` 不存在
- `1390018`: 不支持手写签名
- `1395001`: 服务错误

### `specified_rollback`

高频错误码：

- `1390001`: 参数错误

### `resubmit`

高频错误码：

- `1390001`: 参数错误
- `1390002`: `approval_code` 不存在
- `1390003`: `instance_code` 不存在
- `1390010`: `task_id` 不存在
- `1390018`: 不支持手写签名
- `1395001`: 服务错误
