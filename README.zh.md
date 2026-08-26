# shuliu-skills

[English](./README.md) | 中文

参考 `jimliu/baoyu-skills` 形式构建的本地技能市场。

## 安装

```bash
npx skills add https://github.com/twodogegg/shuliu-skills --skill ecommerce-images
npx skills add https://github.com/twodogegg/shuliu-skills --skill multi-image-consistency
npx skills add https://github.com/twodogegg/shuliu-skills --skill visual-style-extractor
npx skills add https://github.com/twodogegg/shuliu-skills --skill douyin-share-info
npx skills add https://github.com/twodogegg/shuliu-skills --skill douyin-video-fetch
npx skills add https://github.com/twodogegg/shuliu-skills --skill video-analysis
npx skills add https://github.com/twodogegg/shuliu-skills --skill wechat-mp-scraper
npx skills add https://github.com/twodogegg/shuliu-skills --skill feishu-bitable
npx skills add https://github.com/twodogegg/shuliu-skills --skill feishu-approval
npx skills add https://github.com/twodogegg/shuliu-skills --skill newapi
npx skills add https://github.com/twodogegg/shuliu-skills --skill newapi-admin
npx skills add https://github.com/twodogegg/shuliu-skills --skill short-drama
npx skills add https://github.com/twodogegg/shuliu-skills --skill apifox-doc-import
npx skills add https://github.com/twodogegg/shuliu-skills --skill issue-to-pr
```

## 更新技能

当仓库中的技能更新后，重新执行安装命令即可拉取最新版本：

```bash
npx skills add https://github.com/twodogegg/shuliu-skills --skill ecommerce-images
npx skills add https://github.com/twodogegg/shuliu-skills --skill multi-image-consistency
npx skills add https://github.com/twodogegg/shuliu-skills --skill visual-style-extractor
npx skills add https://github.com/twodogegg/shuliu-skills --skill douyin-share-info
npx skills add https://github.com/twodogegg/shuliu-skills --skill douyin-video-fetch
npx skills add https://github.com/twodogegg/shuliu-skills --skill video-analysis
npx skills add https://github.com/twodogegg/shuliu-skills --skill wechat-mp-scraper
npx skills add https://github.com/twodogegg/shuliu-skills --skill feishu-bitable
npx skills add https://github.com/twodogegg/shuliu-skills --skill feishu-approval
npx skills add https://github.com/twodogegg/shuliu-skills --skill newapi
npx skills add https://github.com/twodogegg/shuliu-skills --skill newapi-admin
npx skills add https://github.com/twodogegg/shuliu-skills --skill short-drama
npx skills add https://github.com/twodogegg/shuliu-skills --skill apifox-doc-import
npx skills add https://github.com/twodogegg/shuliu-skills --skill issue-to-pr
```

## 可用插件

| 插件 | 说明 | 包含技能 |
|------|------|----------|
| **image-generation-skills** | 图片生成工作流 | [ecommerce-images](#ecommerce-images)、[multi-image-consistency](#multi-image-consistency)、[visual-style-extractor](#visual-style-extractor) |
| **douyin-tools** | 抖音视频解析与下载工具 | [douyin-share-info](#douyin-share-info)、[douyin-video-fetch](#douyin-video-fetch) |
| **video-analysis-tools** | 视频分析与转录工具 | [video-analysis](#video-analysis) |
| **wechat-tools** | 微信公众号文章抓取工具 | [wechat-mp-scraper](#wechat-mp-scraper) |
| **feishu-tools** | 飞书原生审批与多维表格工具 | [feishu-bitable](#feishu-bitable)、[feishu-approval](#feishu-approval) |
| **newapi-tools** | NewAPI 用户侧查询与后台管理工具 | [newapi](#newapi)、[newapi-admin](#newapi-admin) |
| **short-drama-tools** | 微短剧全流程创作工作流 | [short-drama](#short-drama) |
| **apifox-tools** | 将本地或在线文档转换为 Apifox 接口文档 | [apifox-doc-import](#apifox-doc-import) |
| **development-tools** | Issue 驱动的开发、验证、提交与 PR 工作流 | [issue-to-pr](#issue-to-pr) |

## 可用技能

### douyin-share-info

通过 TikHub Douyin Web API 根据抖音分享链接获取作品基础信息，并提取封面/音频/视频的首个可用地址。

```bash
npx -y bun skills/douyin-share-info/scripts/main.ts --share-url "https://v.douyin.com/xxxx/" --json
```

环境变量：

- `TIKHUB_API_KEY`（必填）

### douyin-video-fetch

用于抖音视频页、精选页或分享链接的浏览器抓取，支持按子命令提取视频、音频、封面或全部资源。

```bash
python3 skills/douyin-video-fetch/scripts/fetch_douyin_video.py \
  video \
  --url "https://www.douyin.com/video/7624937951562091782" \
  --output /tmp/douyin-7624937951562091782.mp4
```

主要输出：

- `aweme_id`
- `desc`
- `author`
- `normalized_url`
- `cover_url`
- `audio_url`
- `play_url`
- `download_url`
- `downloaded_paths`

更多示例：

```bash
python3 skills/douyin-video-fetch/scripts/fetch_douyin_video.py \
  audio \
  --url "https://www.douyin.com/jingxuan?modal_id=7603361114428050722" \
  --output /tmp/douyin-7603361114428050722.mp3
```

```bash
python3 skills/douyin-video-fetch/scripts/fetch_douyin_video.py \
  all \
  --url "https://v.douyin.com/xxxx/" \
  --output-dir /tmp/douyin-assets
```

### video-analysis

用于把公网视频 URL 送进 GeekAI/OpenAI 兼容视频接口，返回视频观点分析、转录和摘要结果。

```bash
python3 skills/video-analysis/scripts/analyze_video.py \
  --video-url "https://example.com/video.mp4" \
  --model "qwen3.6-plus"
```

也支持直接读取 `douyin-video-fetch` 的输出 JSON：

```bash
python3 skills/video-analysis/scripts/analyze_video.py \
  --video-info-json /tmp/douyin-detail.json
```

环境变量：

- `GEEKAI_API_KEY`（必填）
- `GEEKAI_BASE_URL`（可选，默认 `https://geekai.co/api/v1`）

注意：

- 这个 skill 依赖上游模型服务主动下载视频 URL
- 抖音临时直链有时会被第三方服务拦截，遇到这种情况需要换成稳定公网 URL

### wechat-mp-scraper

用于抓取和拆解公开可访问的微信公众号文章页，输出 HTML、正文、资源列表、报告与素材文件。

```bash
python3 skills/wechat-mp-scraper/scripts/scrape_wechat_mp.py \
  "https://mp.weixin.qq.com/s/xxxx" \
  --output-dir ~/wechat-mp-scraper-runs
```

如果只需要正文 Markdown 和 JSON，不下载素材：

```bash
python3 skills/wechat-mp-scraper/scripts/scrape_wechat_mp.py \
  "https://mp.weixin.qq.com/s/xxxx" \
  --mode markdown \
  --output-dir ~/wechat-mp-scraper-runs
```

主要输出：

- `article.html`
- `content.md`
- `content.json`
- `report.md`
- `urls.json`
- 下载后的素材与动画线索文件

### ecommerce-images

用于电商商品主图与详情图生成的工作流技能，输入用户提供的商品原图。

- 支持模式：`main` / `detail` / `both`
- 详情图为整套图，执行前会先询问用户需要几张
- 默认比例：主图 `1:1`，详情图 `3:4`
- 使用 `baoyu-image-gen`
- 支持中文风格名（如“白底极简主图”“参数规格详情图”）

以自然语言触发即可，例如：
- “基于 `/path/product.png` 生成主图和详情图”
- “生成详情图，做 5 张，参数规格风格”

### multi-image-consistency

用于多图项目的一致性提示词工作流，适合需要一组图片保持连续视觉身份的场景。

- 先创建 master style anchor，再生成后续匹配提示词
- 适用于 UI 界面组、漫画、分镜、campaign 系列、角色设定图和插画组图
- 跨图片保持角色、场景、配色、字体气质、道具和整体 visual language 一致

以 PRD、分镜、脚本、campaign brief 或图片清单触发即可，例如：
- “把这个分镜脚本转成一组风格一致的生图提示词”
- “根据这个 PRD 生成 8 张一致的产品 UI 截图提示词”

### visual-style-extractor

从单张或多张参考图片中提取可复用的视觉规则，并生成可直接复制的中文提示词。

- 区分可替换主体与可复用的构图、配色、光线、材质、字体和氛围
- 支持通用风格提取、新图提示词、多参考图组合和“其他保持不变”的精确改图
- 自带静态 SVG 图标和简洁输出示例

可以直接用自然语言触发，例如：

- “提取这张海报的可复用风格，让主体可以替换”
- “沿用图 1 的构图和图 2 的金属质感，写一段提示词”
- “只把草地改成专业足球场，其他全部保持不变”

### feishu-bitable

用于飞书多维表格操作的工作流 skill，覆盖记录 CRUD、字段管理、视图、权限、公式和关联字段等场景。

- 以自然语言触发即可，例如：
  - “创建一个新的多维表格，并把我加成协作者”
  - “往这张表批量插入 20 条记录”
  - “新增一个货币字段和一个关联字段”
- 主说明保留在 `SKILL.md`；只有当任务涉及 `type / ui_type / property` 判断时，才进一步读取 `references/fields.md`。

### feishu-approval

用于飞书原生审批的文档型 skill，覆盖审批定义、表单控件、外部选项、审批实例和排障。

- 以自然语言触发即可，例如：
  - “飞书审批定义的 form_content 怎么写”
  - “帮我写一个 radioV2 外部选项控件”
  - “创建审批实例时 dateInterval 要怎么传”
  - “approval code not found 是什么问题”
- 这个 skill 不自带脚本，重点是把官方审批文档按定义、控件、实例、排障分层整理，方便直接回答和拼接 JSON。

### newapi

用于开源统一网关 `new-api` 的文档加脚本型 skill。

- 覆盖用户侧模型、分组、余额、令牌等查询与管理
- 自带安全 token 工具，可复制到剪贴板、注入配置文件，或在命令执行时安全替换，不暴露真实 `sk-`
- 强制优先复用 skill 自带脚本，不手写 `curl`

常用动作：

```bash
/newapi models
/newapi balance
/newapi tokens
/newapi create-token my-key --group=default
/newapi copy-token 12
/newapi apply-token 12 ~/.codex/auth.json
/newapi exec-token 12 openai api models.list
```

注意：

- 首次使用先看 `skills/newapi/docs/setup.md`
- 不要在聊天、日志、文件或命令参数里打印 token 明文
- 需要查看配置结构时，用 `scan-config` 获取尽力脱敏后的结果

### newapi-admin

用于 NewAPI 后台管理的 skill，覆盖渠道、用户、模型、分组、额度、日志、系统配置、认证和充值等接口。

- 统一通过 `scripts/api.js` 调后台，自动处理登录、session 复用、字段脱敏和 `New-Api-User` 头
- 只在明确需要后台管理时使用
- 支持直接在仓库里调试，也支持安装后调用

示例命令：

```bash
node skills/newapi-admin/scripts/api.js GET /api/channel/
node skills/newapi-admin/scripts/api.js GET /api/user/self
node skills/newapi-admin/scripts/api.js GET /api/pricing
node skills/newapi-admin/scripts/api.js POST /api/channel/test '{"id":3,"model":"gpt-image-2"}'
```

注意：

- 在 skill 目录下 `.env` 配置 `NEWAPI_ADMIN_BASE_URL`、`NEWAPI_ADMIN_USERNAME`、`NEWAPI_ADMIN_PASSWORD`、`NEWAPI_ADMIN_USER_ID`，以及可选的 `NEWAPI_ADMIN_ACCESS_TOKEN`
- 不要暴露密码、session、access token 或渠道 key
- 更新渠道前先取完整对象，再只改必要字段，避免覆盖其它配置

### short-drama

覆盖微短剧全流程的编剧工作流。

- 支持选题立项、故事策划、角色设计、分集大纲、单集剧本、质量审查、合规审核、海外本地化和整剧导出
- 可从项目文件恢复创作进度，并只加载当前阶段需要的参考资料
- 支持自然语言、`$short-drama`，也兼容 `/start`、`/plan`、`/episode 1` 等旧命令

示例：

```text
使用 $short-drama 创作一部面向女频观众的 60 集都市复仇短剧。
```

### apifox-doc-import

将 Markdown、TXT、HTML、PDF、DOCX 或在线文档转换为 OpenAPI 3.0 和至少一份项目 Markdown 使用说明，逐项保留必填、枚举、范围、文件与组合限制，完成接口完整性检查后通过 Apifox CLI 一起导入。默认从 `~/.shuliu-skills/apifox-doc-import/EXTEND.md` 读取目标项目、分支和 Apifox 接口目录；偏好缺失时会询问并确认是否保存。

```text
使用 $apifox-doc-import 把这份在线 PRD 转换为 Apifox 接口文档。
```

### issue-to-pr

围绕 GitHub issue 完成从领取到 Pull Request 的端到端开发工作流：读取 issue 和评论、检查仓库状态、创建隔离分支、实现 bug 修复或需求、执行自验证、提交代码、推送分支并发起 PR。不会自动合并 PR；遇到需求歧义、权限不足或验证失败会明确停下并报告。

```text
使用 $issue-to-pr 领取并完成 issue #123，验证后发起 PR。
```
