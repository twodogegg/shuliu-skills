---
name: apifox-doc-import
description: 将本地或在线需求文档、PRD、接口说明转换为 OpenAPI 3.0 接口定义和至少一份 Apifox 项目 Markdown 说明文档，并通过 Apifox CLI 完成质量检查、导入和回读验证。用于处理 Markdown、TXT、HTML、PDF、DOCX、公开网页 URL、需登录的在线文档，或用户提出“从文档生成 Apifox 接口”“把 PRD 导入 Apifox”“在线文档转接口文档”等请求。
---

# 文档转 Apifox 接口

把来源文档归一化为事实清单，生成 OpenAPI 3.0 JSON 和项目说明文档，检查完整性，再按用户请求或偏好配置导入 Apifox。不要把推测写成确定事实。

## 用户偏好

每次执行时先读取 `~/.shuliu-skills/apifox-doc-import/EXTEND.md`。显式请求高于偏好文件，偏好文件高于临时推断。

- 从文件读取默认项目名、项目 ID、分支、模块和 Apifox 接口目录；不要把个人项目偏好写进公开 Skill。
- 用 `apifox project list` 校验项目名与项目 ID。名称与 ID 不一致时按名称重新解析，不静默写入旧项目。
- 项目或接口目录缺失时向用户询问；取得答案后，询问是否保存到 `EXTEND.md` 供以后使用。
- 只有用户明确同意保存偏好时才创建或更新该文件；保留文件中与本次无关的现有内容。
- “目录”默认指 Apifox 接口目录，不得解释成本地文件夹。只有用户明确要求本地副本时才询问本地保存路径。

偏好文件至少应提供“项目名称或项目 ID”和“默认接口目录”；缺少任一项就询问用户。分支未提供时使用目标项目的主分支，模块未提供时使用默认模块。推荐格式：

```markdown
# Apifox 文档导入偏好

- 项目名称：项目名称
- 项目 ID：123456
- 默认分支：main
- 默认模块：默认模块（ID：123456）
- 默认接口目录：接口目录名称
```

## 工作流

1. 读取用户偏好，确认输入来源、目标项目、目标分支、Apifox 接口目录和交付范围。若偏好完整且无冲突，默认完成接口与说明文档的生成、校验、导入和回读，不重复询问写入许可。
2. 按 [source-extraction.md](references/source-extraction.md) 读取本地文件或在线文档。
3. 若输入已经是 OpenAPI 或 Swagger，保留原文件并直接进入质量检查；YAML 另存等价 JSON 副本供检查脚本使用，不要重新解释接口含义。
4. 从文档提取接口事实，先按 [constraint-coverage.md](references/constraint-coverage.md) 建立参数与约束清单，再按 [openapi-mapping.md](references/openapi-mapping.md) 生成 OpenAPI 3.0.3 JSON。不得只提取字段名和类型。
5. 运行质量检查：

   ```bash
   node <skill-directory>/scripts/check-openapi.mjs /path/to/openapi.json
   ```

6. 逐项核对来源约束清单与 OpenAPI：可机器表达的限制必须写入 Schema，无法可靠机器表达的媒体属性、条件必填、组合与互斥规则必须完整写入对应字段 `description`。出现遗漏、结构错误、明显路由骨架、缺失关键鉴权或大量推测时，先修正文档或向用户确认，不要导入最终项目。
7. 首次使用 Apifox CLI 时运行 `apifox --version`、`apifox --help` 和 `apifox import --help`，以当前帮助为准。
8. 导入前按 [import-safety.md](references/import-safety.md) 检查接口、Schema、鉴权组件、环境名称冲突及 `servers` 带来的环境新增。目标信息来自显式请求或已校验偏好时无需重复确认；破坏性冲突仍须暂停。
9. 目标偏好已校验且冲突已处理后执行：

   ```bash
   apifox import --project <projectId> --branch <branchName> --format openapi --file /path/to/openapi.json
   ```

10. 读取导入结果及 `agentHints.nextSteps`，按 [import-safety.md](references/import-safety.md) 回读接口、环境、Schema 和鉴权绑定。抽查至少一个读接口和一个写接口，不要只依据导入成功判断完成。
11. 按 [apifox-project-doc.md](references/apifox-project-doc.md) 生成至少一份项目 Markdown 说明文档。先运行 `apifox doc list` 检查同名冲突，再获取并校验 `doc-create` 或 `doc-update` Schema，写入目标接口目录后用 `apifox doc get` 回读。

## 生成规则

- 默认输出 `openapi.json`，避免引入 YAML 解析依赖；不要覆盖用户已有文件。
- 为每个 operation 提供业务化 `tags`、`summary`、稳定的 `operationId` 和明确响应。
- 从原文映射路径参数、查询参数、Header、Cookie、请求体、响应体、状态码、鉴权、示例和约束。
- 复用结构写入 `components.schemas`，用 `$ref` 引用；不要复制大量匿名对象。
- 文档未说明的必填性、枚举、默认值、格式、状态码或鉴权不得擅自补全。必要推测写入 `description` 并加 `x-apifox-doc-import-confidence: inferred`。
- 保留来源中的全部参数限制，包括必填/条件必填、枚举、默认值、长度与数值范围、数组数量、文件格式与大小、尺寸、比例、时长、帧率、输入组合、依赖和互斥关系。不要把长说明压缩成一句摘要。
- 将来源 URL 或文件路径写入顶层 `externalDocs` 或 `x-apifox-doc-import-sources`，不得写入访问令牌、Cookie 或私密查询参数。
- 若同一字段在多个位置冲突，列出冲突并暂停对应接口的最终导入。

## 质量门禁

必须报告脚本输出的 `paths`、`operations`、`schemas`、`writes`、`withBody`、`emptyObjectBodies`、`withResponses` 和 `tagged`。

- 写接口很多但 `withBody` 很少，或 `emptyObjectBodies` 很多：判定为疑似路由骨架。
- operations 很多但 schemas 极少：结合接口类型复查 DTO 和响应结构，不能仅凭路径数量判断完整。
- tags 仅为 `api`、`v1`、`rest` 等技术目录：导入前改成业务域分组。
- 导入结果出现大量 `ignoreCount`：不得直接宣告成功；检查目标项目是否已有旧版本或匹配策略是否错误。
- 导入创建了鉴权组件但接口 `auth` 为空：判定为未完成，按参考流程校验并补绑；不得写入真实密钥。
- OpenAPI 包含 `servers`：导入前报告可能新增的环境，导入后核对实际环境数量和 base URL。
- 接口已导入但目标目录没有说明文档：判定为未完成。
- 来源明确列出参数限制，但 OpenAPI 或 Apifox 回读缺少对应机器约束或字段说明：判定为未完成，即使结构检查为 valid。

## 安全边界

- 需要登录的在线文档只在用户授权的浏览器会话中读取；不记录凭据。
- 遇到验证码、无权访问或禁止导出时停止，要求用户授权或提供导出文件。
- 不自动创建项目、AI 分支、覆盖导入、批量修改、合并或发起合并请求。
- 不把文档正文、接口密钥或登录态发送到未经用户授权的第三方服务。

## 最终交付

返回 OpenAPI 文件路径、来源、质量指标、推测与冲突清单、目标项目、分支和接口目录、导入计数、说明文档 ID、回读抽查结果及遗留风险。完成条件是接口和至少一份说明文档均已写入 Apifox 并回读验证；若因缺少偏好或冲突而未导入，明确标注“尚未写入 Apifox”。
