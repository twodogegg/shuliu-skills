# Apifox 导入安全检查

## 导入前

1. 运行 `apifox project get`、`endpoint list`、`schema list`、`security-scheme list` 和 `environment list`，全部指定同一项目与分支。
2. 检查以下冲突：
   - 接口的 method + path
   - `components.schemas` 名称
   - `components.securitySchemes` 名称
   - `servers[].url` 对应的环境名称或 base URL
   - 项目 Markdown 说明文档名称
3. Schema 名称过于通用或已经存在时，优先改为产品或业务前缀，例如把 `ErrorResponse` 改成 `MiniMaxVideoGenerationErrorResponse`。不要让导入器猜测匹配对象。
4. method + path 已存在时，停止并让用户确认更新、改名、换项目或使用 AI 分支。不要默认覆盖。
5. 明确告知用户：OpenAPI `servers` 可能在 Apifox 自动创建环境。

## 导入后

1. 检查接口、目录、Schema、响应组件、鉴权组件和环境的 create/update/ignore/error/delete 计数。
2. 用 `endpoint list/get` 回读新增接口，确认 tags、请求体、响应状态、示例和 Schema 引用。
3. 用 `schema get` 抽查请求和响应模型；用 `environment list` 核对新增 base URL。
4. 用 `security-scheme list/get` 确认鉴权组件存在，再检查 endpoint 的 `auth` 和 `securityScheme` 是否实际绑定。
5. 若鉴权组件已创建但 endpoint 的 `auth` 为空：
   - 先 `endpoint get` 获取完整接口，并参考同项目已绑定接口的结构。
   - 运行 `apifox cli-schema get endpoint-update`。
   - 生成只包含完整 `auth` 与 `securityScheme` 对象的更新文件，不写入 API Key。
   - 运行 `apifox cli-schema validate endpoint-update --file <path>`。
   - 校验通过后执行 `endpoint update`，再 `endpoint get` 回读确认。
6. 用 `doc list/get` 确认至少一份项目 Markdown 说明文档位于目标接口目录，且包含接口清单、鉴权、环境和来源。
7. 汇报新增和更新内容、接口 ID、说明文档 ID、目标项目与分支、鉴权状态、环境变化及遗留风险。
