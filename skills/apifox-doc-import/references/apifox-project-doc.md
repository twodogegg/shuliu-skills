# Apifox 项目说明文档

每次接口导入至少创建一份项目 Markdown 文档，并放入本次接口所在的 Apifox API 目录。若用户指定其他文档目录，以用户要求为准。

## 最低内容

- 文档用途和接口能力概览
- 服务基础地址
- 鉴权方式，但不包含真实密钥
- method、path、名称组成的接口清单
- 关键参数、状态流转或业务限制
- 主要成功和错误响应
- 原始文档 URL 或文件来源

## 写入流程

1. 运行 `apifox doc list --project <projectId> --branch <branchName>` 检查同名文档。
2. 同名文档存在时先 `doc get` 回读，不得默认覆盖；让用户选择更新或使用新名称。
3. 创建前运行 `apifox cli-schema get doc-create`，生成包含 `name`、`content`、`folderId` 和 `moduleId` 的 JSON。
4. 运行 `apifox cli-schema validate doc-create --file <path>`，通过后执行 `apifox doc create`。
5. 用 `apifox doc get <docId>` 回读名称、正文、目录和模块。

说明文档应面向接口使用者，不写导入过程、质量统计、CLI 日志或本地文件路径。
