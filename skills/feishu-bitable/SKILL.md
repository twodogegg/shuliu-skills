---
name: feishu-bitable
description: 飞书多维表格操作。记录 CRUD、字段管理、视图、权限、公式、关联。
required_permissions:
  - bitable:app
  - bitable:app:readonly
---

# 飞书多维表格

通过 Bitable API 操作数据、字段、视图和权限。优先保持主技能简洁；只有在任务明确涉及字段类型、字段属性 `property`、字段新增/更新/删除时，再读取 [`references/fields.md`](references/fields.md)。

**Base URL**: `https://open.feishu.cn/open-apis/bitable/v1`

**关键参数**:
- `app_token`: 多维表格 URL 中 `/base/` 后的字符串
- `table_id`: 调用列表 API 获取

---

## 记录操作

| API | 端点 | 说明 |
|-----|------|------|
| 新增单条 | `POST /apps/{app_token}/tables/{table_id}/records` | - |
| 批量新增 | `POST .../records/batch_create` | 最多 500 条，支持 Upsert |
| 更新 | `PUT .../records/{record_id}` | - |
| 批量更新 | `POST .../records/batch_update` | 最多 500 条 |
| 批量删除 | `POST .../records/batch_delete` | 最多 500 条 |
| 查询 | `POST .../records/search` | 支持 filter/sort/分页 |


⚠️ 数值不要传字符串，日期必须是 13 位毫秒时间戳。

**飞书官方文档完整实例**:
```json
{
  "fields": {
    "任务名称": "拜访潜在客户",
    "条码": "+$$3170930509104X512356",
    "工时": 10,
    "货币": 3,
    "评分": 3,
    "进度": 0.25,
    "单选": "选项1",
    "多选": [
      "选项1",
      "选项2"
    ],
    "日期": 1674206443000,
    "复选框": true,
    "人员": [
      {
        "id": "ou_2910013f1e6456f16a0ce75ede9abcef"
      },
      {
        "id": "ou_e04138c9633dd0d2ea166d79f54abcef"
      }
    ],
    "群组": [
      {
        "id": "oc_cd07f55f14d6f4a4f1b51504e7e97f48"
      }
    ],
    "电话号码": "1302616xxxx",
    "超链接": {
      "text": "飞书多维表格官网",
      "link": "https://www.feishu.cn/product/base"
    },
    "附件": [
      {
        "file_token": "DRiFbwaKsoZaLax4WKZbEGCccoe"
      },
      {
        "file_token": "BZk3bL1Enoy4pzxaPL9bNeKqcLe"
      },
      {
        "file_token": "EmL4bhjFFovrt9xZgaSbjJk9c1b"
      },
      {
        "file_token": "Vl3FbVkvnowlgpxpqsAbBrtFcrd"
      }
    ],
    "单向关联": [
      "recHTLvO7x",
      "recbS8zb2m"
    ],
    "双向关联": [
      "recHTLvO7x",
      "recbS8zb2m"
    ],
    "地理位置": "116.397755,39.903179"
  }
}
```

**对应接口**：
- `POST /open-apis/bitable/v1/apps/{app_token}/tables/{table_id}/records`
- 常用查询参数：`user_id_type=open_id|union_id|user_id`
- 关键提醒：
  - 人员字段写入时，只传 `[{ "id": "ou_xxx" }]` 这一类结构，且要和 `user_id_type` 一致
  - 附件字段必须先把文件上传到当前多维表格，再写 `file_token`
  - 单选/多选写的是“选项名”，不存在时会自动创建新选项
  - 字段名必须和表里真实字段名完全一致；排查时先走“列出字段”

---

## 字段操作

当任务涉及下面任一场景时，再读取 [`references/fields.md`](references/fields.md)：
- 字段列表、字段新增、字段更新、字段删除
- 判断某个字段应该用什么 `type / ui_type`
- 判断某个字段的 `property` 结构怎么写
- 排查字段接口报错，例如 `FieldTypeValueNotMatch`、某类字段 `property` 错误

**高频提醒**：
- 字段定义是 `field` 对象，不等于记录写入时 `fields` 的值格式
- `Lookup(type=19)` 会出现在字段定义和字段列表里，但不支持走新增/更新字段接口
- `单选/多选` 更新是全量覆盖，不是增量 merge

**先获取表格字段信息再写记录**：

当你不确定字段真实名称、`field_id`、`type`、`ui_type`、`property.options`，或遇到 `FieldNameNotFound` / `FieldTypeValueNotMatch` 时，先调用列出字段接口：

**列出字段接口要点**：
- 路径：`GET /open-apis/bitable/v1/apps/{app_token}/tables/{table_id}/fields`
- 常用查询参数：
  - `view_id`：只看某个视图下的字段
  - `text_field_as_array`：让 `description` 按富文本数组返回
  - `page_size` / `page_token`：分页遍历字段
- 常用返回：`field_id`、`field_name`、`type`、`ui_type`、`is_primary`、`is_hidden`、`property`
- 权限：`base:field:read` 或 `bitable:app` 或 `bitable:app:readonly`
- 分页：默认 `20`，最大 `100`
- `text_field_as_array=true` 时，`description` 会按富文本数组返回，更适合程序处理
- 常见用途：
  - 先确认字段真实名称，避免记录写入时报 `FieldNameNotFound`
  - 先看 `type / ui_type / property`，再决定记录里 `fields` 应该传什么结构
  - 对单选、多选字段，先从 `property.options` 读取已有选项
  - 对人员、关联、日期、公式等复杂字段，先看字段定义，不要直接按页面展示猜值结构

---

## 数据表管理

| API | 端点 | 说明 |
|-----|------|------|
| 创建多维表格 | `POST /apps` | `{"name":"数据库名称"}` |
| 列出数据表 | `GET /apps/{app_token}/tables` | - |
| 新增数据表 | `POST /apps/{app_token}/tables` | `{"table":{"name":"表名"}}` |
| 批量新增表 | `POST .../tables/batch_create` | 最多 10 张表 |
| 删除数据表 | `DELETE .../tables/{table_id}` | - |
| 复制数据表 | `POST .../tables/{table_id}/copy` | - |

⚠️ **权限管理（重要）**：
- 通过 API 创建的表格默认只对机器人可见
- 创建后需添加用户为协作者：
```
POST /permissions/{app_token}/members
{
  "member_type": "user",
  "member_id": "ou_xxx",
  "perm": "full_access"
}
```
- 权限类型：`view` / `edit` / `full_access`

---

## 视图管理

| API | 端点 | 说明 |
|-----|------|------|
| 列出视图 | `GET .../tables/{table_id}/views` | - |
| 创建视图 | `POST .../tables/{table_id}/views` | `{"view_name":"新视图","view_type":"grid"}` |
| 删除视图 | `DELETE .../views/{view_id}` | - |

**视图类型**: `grid`(表格) / `kanban`(看板) / `gallery`(画册) / `gantt`(甘特图)

---

## 权限管理

| API | 端点 | 说明 |
|-----|------|------|
| 创建协作者 | `POST /apps/{app_token}/roles/{role_id}/members/batch_create` | - |
| 删除协作者 | `POST .../members/batch_delete` | - |
| 更新权限 | `PUT /apps/{app_token}/roles/{role_id}` | - |

**角色类型**: `owner` / `editor` / `reader`

---

## 最佳实践

1. **批量操作优先**（减少 API 调用）
2. **字段类型严格匹配**（避免写入失败）
3. **日期用毫秒时间戳**（Python: `int(datetime.timestamp() * 1000)`）
4. **关联字段实现关系型能力**
5. **金额默认两位小数**
6. **创建表格后立即添加用户为协作者**（避免不可见）
7. **单选字段自动创建选项**（直接写入选项文本即可）
8. **当创建多维表格涉及到编号时，尽量使用 `自动更新` 字段**
9. **多维表格创建在同一个 base 下面** (这样更方便管理)
10. **新创建的多维表格有个默认的字段 `多行文本` 或者 `文本`，需要在创建完成以后，用 put 接口根据业务需要对他进行修改**
11. **数量请使用 `整数类型`，不保留小数**
12. **推荐使用视图功能，将不同状态进行区分，视图不用太多，一般不超过 5 个**
---
