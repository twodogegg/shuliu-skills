# OpenAPI 映射规则

## 基础结构

- 使用 OpenAPI `3.0.3`。
- `info.title` 和 `info.version` 必填；文档没有版本时使用可识别的草稿版本，如 `0.1.0-draft`，并报告该推测。
- 使用业务域作为 operation `tags`，不要按 `/api/v1` 等技术路径机械分组。
- `operationId` 使用稳定 camelCase 名称，同一文件内不得重复。

## 参数与请求体

- 路径模板字段映射到 `in: path` 且 `required: true`。
- 查询、Header、Cookie 参数分别映射到对应 `in`。
- JSON 请求体写入 `requestBody.content.application/json.schema`。
- 表单、文件上传和非 JSON 内容必须保留实际 media type，不要强制改成 JSON。
- 多接口复用对象放入 `components.schemas`，通过 `$ref` 使用。
- 将长度、数值、数量和格式限制映射为 `minLength`、`maxLength`、`minimum`、`maximum`、`minItems`、`maxItems`、`enum`、`pattern`、`format` 等 JSON Schema 关键字。
- 将“数组必须包含某类元素”映射为 `contains` / `minContains`；仅在来源规则无歧义且目标 OpenAPI 版本支持时使用条件 Schema。
- 文件格式、文件大小、媒体尺寸、时长、帧率以及跨元素组合等无法由普通 URL 字段验证的限制，完整保留在最接近的字段 `description`。
- 条件必填、字段依赖和互斥规则优先使用 `oneOf`、`anyOf`、`allOf`、`not`、`if/then` 表达，同时保留面向用户的中文说明。

## 响应与鉴权

- 每个 operation 至少有一个 `responses`；只写原文明确或可可靠推导的状态码。
- 响应示例放在 media type 的 `example` 或 `examples`，字段模型放在 `schema`。
- Bearer、API Key、Basic、OAuth2 等映射到 `components.securitySchemes`，并在顶层或 operation 引用。
- 文档未说明鉴权时不要默认添加 Bearer Token。

## 不确定性

- 确定事实无需扩展字段。
- 必须保留但来自合理推测的对象或 operation 添加：

  ```json
  "x-apifox-doc-import-confidence": "inferred"
  ```

- 冲突信息不要强行二选一；在交付清单中列出来源位置和冲突值，等待用户确认。
