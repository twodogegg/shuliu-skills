# Endpoints

## 根目录 / 系统
- `GET /api/setup` — 获取初始化状态：🔓 无需鉴权
- `POST /api/setup` — 初始化系统：🔓 无需鉴权
- `GET /api/status` — 获取系统状态：🔓 无需鉴权
- `GET /api/status/test` — 测试系统状态：👨‍💼 需要管理员权限（Admin）
- `GET /api/uptime/status` — 获取Uptime Kuma状态：🔓 无需鉴权
- `GET /api/notice` — 获取公告：🔓 无需鉴权
- `GET /api/user-agreement` — 获取用户协议：🔓 无需鉴权
- `GET /api/privacy-policy` — 获取隐私政策：🔓 无需鉴权
- `GET /api/about` — 获取关于信息：🔓 无需鉴权
- `GET /api/home_page_content` — 获取首页内容：🔓 无需鉴权
- `GET /api/pricing` — 获取定价信息：🔓 无需鉴权（可选登录）
- `GET /api/models` — 获取模型列表：🔐 需要登录（User权限）
- `GET /api/ratio_config` — 获取倍率配置：🔓 无需鉴权
## 根目录 / 用户登陆注册
- `GET /api/verification` — 发送邮箱验证码：🔓 无需鉴权
- `GET /api/reset_password` — 发送密码重置邮件：🔓 无需鉴权
- `POST /api/user/reset` — 重置密码：🔓 无需鉴权
- `POST /api/user/register` — 用户注册：🔓 无需鉴权
- `POST /api/user/login` — 用户登录：🔓 无需鉴权
- `POST /api/user/login/2fa` — 两步验证登录：🔓 无需鉴权（登录流程）
- `GET /api/user/logout` — 用户登出：🔓 无需鉴权
- `GET /api/user/groups` — 获取用户分组列表：🔓 无需鉴权
- `POST /api/user/passkey/login/begin` — 开始Passkey登录：🔓 无需鉴权
- `POST /api/user/passkey/login/finish` — 完成Passkey登录：🔓 无需鉴权
## 根目录 / OAuth
- `GET /api/oauth/github` — GitHub OAuth登录：🔓 无需鉴权（OAuth回调）
- `GET /api/oauth/discord` — Discord OAuth登录：🔓 无需鉴权（OAuth回调）
- `GET /api/oauth/oidc` — OIDC登录：🔓 无需鉴权（OAuth回调）
- `GET /api/oauth/linuxdo` — LinuxDO OAuth登录：🔓 无需鉴权（OAuth回调）
- `GET /api/oauth/state` — 生成OAuth State：🔓 无需鉴权
- `GET /api/oauth/wechat` — 微信OAuth登录：🔓 无需鉴权（OAuth回调）
- `GET /api/oauth/wechat/bind` — 绑定微信：🔓 无需鉴权
- `GET /api/oauth/email/bind` — 绑定邮箱：🔓 无需鉴权
- `GET /api/oauth/telegram/login` — Telegram登录：🔓 无需鉴权（OAuth回调）
- `GET /api/oauth/telegram/bind` — 绑定Telegram：🔓 无需鉴权
## 根目录 / 用户管理
- `GET /api/user/self/groups` — 获取当前用户分组：🔐 需要登录（User权限）
- `GET /api/user/self` — 获取当前用户信息：🔐 需要登录（User权限）
- `PUT /api/user/self` — 更新当前用户信息：🔐 需要登录（User权限）
- `DELETE /api/user/self` — 注销当前用户：🔐 需要登录（User权限）
- `GET /api/user/models` — 获取用户可用模型：🔐 需要登录（User权限）
- `GET /api/user/token` — 生成访问令牌：🔐 需要登录（User权限）
- `GET /api/user/passkey` — 获取Passkey状态：🔐 需要登录（User权限）
- `DELETE /api/user/passkey` — 删除Passkey：🔐 需要登录（User权限）
- `POST /api/user/passkey/register/begin` — 开始注册Passkey：🔐 需要登录（User权限）
- `POST /api/user/passkey/register/finish` — 完成注册Passkey：🔐 需要登录（User权限）
- `POST /api/user/passkey/verify/begin` — 开始验证Passkey：🔐 需要登录（User权限）
- `POST /api/user/passkey/verify/finish` — 完成验证Passkey：🔐 需要登录（User权限）
- `GET /api/user/aff` — 获取邀请码：🔐 需要登录（User权限）
- `POST /api/user/aff_transfer` — 转换邀请额度：🔐 需要登录（User权限）
- `PUT /api/user/setting` — 更新用户设置：🔐 需要登录（User权限）
- `GET /api/user/topup` — 获取所有充值记录：👨‍💼 需要管理员权限（Admin）
- `GET /api/user/` — 获取所有用户：👨‍💼 需要管理员权限（Admin）
- `POST /api/user/` — 创建用户：👨‍💼 需要管理员权限（Admin）
- `PUT /api/user/` — 更新用户：👨‍💼 需要管理员权限（Admin）
- `POST /api/user/topup/complete` — 管理员完成充值：👨‍💼 需要管理员权限（Admin）
- `GET /api/user/search` — 搜索用户：👨‍💼 需要管理员权限（Admin）
- `GET /api/user/{id}` — 获取指定用户：👨‍💼 需要管理员权限（Admin）
- `DELETE /api/user/{id}` — 删除用户：👨‍💼 需要管理员权限（Admin）
- `DELETE /api/user/{id}/reset_passkey` — 管理员重置用户Passkey：👨‍💼 需要管理员权限（Admin）
- `DELETE /api/user/{id}/2fa` — 管理员禁用用户2FA：👨‍💼 需要管理员权限（Admin）
- `POST /api/user/manage` — 管理用户状态：👨‍💼 需要管理员权限（Admin）
## 根目录 / 充值
- `GET /api/user/topup/info` — 获取充值信息：🔐 需要登录（User权限）
- `GET /api/user/topup/self` — 获取用户充值记录：🔐 需要登录（User权限）
- `POST /api/user/topup` — 使用兑换码：🔐 需要登录（User权限）
- `POST /api/user/pay` — 发起易支付：🔐 需要登录（User权限）
- `POST /api/user/amount` — 获取支付金额：🔐 需要登录（User权限）
- `POST /api/user/stripe/pay` — 发起Stripe支付：🔐 需要登录（User权限）
- `POST /api/user/stripe/amount` — 获取Stripe支付金额：🔐 需要登录（User权限）
- `POST /api/user/creem/pay` — 发起Creem支付：🔐 需要登录（User权限）
- `GET /api/user/epay/notify` — 易支付回调：🔓 无需鉴权（支付回调）
- `POST /api/stripe/webhook` — Stripe Webhook：🔓 无需鉴权（Webhook回调）
- `POST /api/creem/webhook` — Creem Webhook：🔓 无需鉴权（Webhook回调）
## 根目录 / 两步验证
- `GET /api/user/2fa/status` — 获取2FA状态：🔐 需要登录（User权限）
- `POST /api/user/2fa/setup` — 设置2FA：🔐 需要登录（User权限）
- `POST /api/user/2fa/enable` — 启用2FA：🔐 需要登录（User权限）
- `POST /api/user/2fa/disable` — 禁用2FA：🔐 需要登录（User权限）
- `POST /api/user/2fa/backup_codes` — 重新生成备用码：🔐 需要登录（User权限）
- `GET /api/user/2fa/stats` — 获取2FA统计：👨‍💼 需要管理员权限（Admin）
## 根目录 / 安全验证
- `POST /api/verify` — 通用安全验证：🔐 需要登录（User权限）
- `GET /api/verify/status` — 获取验证状态：🔐 需要登录（User权限）
## 根目录 / 渠道管理
- `GET /api/channel/` — 获取所有渠道：👨‍💼 需要管理员权限（Admin）
- `POST /api/channel/` — 添加渠道：👨‍💼 需要管理员权限（Admin）
- `PUT /api/channel/` — 更新渠道：👨‍💼 需要管理员权限（Admin）
- `GET /api/channel/search` — 搜索渠道：👨‍💼 需要管理员权限（Admin）
- `GET /api/channel/models` — 获取渠道模型列表：👨‍💼 需要管理员权限（Admin）
- `GET /api/channel/models_enabled` — 获取已启用模型列表：👨‍💼 需要管理员权限（Admin）
- `GET /api/channel/{id}` — 获取指定渠道：👨‍💼 需要管理员权限（Admin）
- `DELETE /api/channel/{id}` — 删除渠道：👨‍💼 需要管理员权限（Admin）
- `POST /api/channel/{id}/key` — 获取渠道密钥：👑 需要超级管理员权限（Root）+ 安全验证
- `GET /api/channel/test` — 测试所有渠道：👨‍💼 需要管理员权限（Admin）
- `GET /api/channel/test/{id}` — 测试指定渠道：👨‍💼 需要管理员权限（Admin）
- `GET /api/channel/update_balance` — 更新所有渠道余额：👨‍💼 需要管理员权限（Admin）
- `GET /api/channel/update_balance/{id}` — 更新指定渠道余额：👨‍💼 需要管理员权限（Admin）
- `DELETE /api/channel/disabled` — 删除已禁用渠道：👨‍💼 需要管理员权限（Admin）
- `POST /api/channel/batch` — 批量删除渠道：👨‍💼 需要管理员权限（Admin）
- `POST /api/channel/fix` — 修复渠道能力：👨‍💼 需要管理员权限（Admin）
- `GET /api/channel/fetch_models/{id}` — 获取上游模型列表：👨‍💼 需要管理员权限（Admin）
- `POST /api/channel/fetch_models` — 获取模型列表：👨‍💼 需要管理员权限（Admin）
- `POST /api/channel/batch/tag` — 批量设置渠道标签：👨‍💼 需要管理员权限（Admin）
- `GET /api/channel/tag/models` — 获取标签模型：👨‍💼 需要管理员权限（Admin）
- `POST /api/channel/tag/disabled` — 禁用标签渠道：👨‍💼 需要管理员权限（Admin）
- `POST /api/channel/tag/enabled` — 启用标签渠道：👨‍💼 需要管理员权限（Admin）
- `PUT /api/channel/tag` — 编辑标签渠道：👨‍💼 需要管理员权限（Admin）
- `POST /api/channel/copy/{id}` — 复制渠道：👨‍💼 需要管理员权限（Admin）
- `POST /api/channel/multi_key/manage` — 管理多密钥：👨‍💼 需要管理员权限（Admin）
## 根目录 / 令牌管理
- `GET /api/token/` — 获取所有令牌：🔐 需要登录（User权限）
- `POST /api/token/` — 创建令牌：🔐 需要登录（User权限）
- `PUT /api/token/` — 更新令牌：🔐 需要登录（User权限）
- `GET /api/token/search` — 搜索令牌：🔐 需要登录（User权限）
- `GET /api/token/{id}` — 获取指定令牌：🔐 需要登录（User权限）
- `DELETE /api/token/{id}` — 删除令牌：🔐 需要登录（User权限）
- `POST /api/token/batch` — 批量删除令牌：🔐 需要登录（User权限）
- `GET /api/usage/token/` — 获取令牌使用情况：🔑 需要令牌认证（TokenAuth）
## 根目录 / 兑换码
- `GET /api/redemption/` — 获取所有兑换码：👨‍💼 需要管理员权限（Admin）
- `POST /api/redemption/` — 创建兑换码：👨‍💼 需要管理员权限（Admin）
- `PUT /api/redemption/` — 更新兑换码：👨‍💼 需要管理员权限（Admin）
- `GET /api/redemption/search` — 搜索兑换码：👨‍💼 需要管理员权限（Admin）
- `GET /api/redemption/{id}` — 获取指定兑换码：👨‍💼 需要管理员权限（Admin）
- `DELETE /api/redemption/{id}` — 删除兑换码：👨‍💼 需要管理员权限（Admin）
- `DELETE /api/redemption/invalid` — 删除无效兑换码：👨‍💼 需要管理员权限（Admin）
## 根目录 / 日志
- `GET /api/log/` — 获取所有日志：👨‍💼 需要管理员权限（Admin）
- `DELETE /api/log/` — 删除历史日志：👨‍💼 需要管理员权限（Admin）
- `GET /api/log/stat` — 获取日志统计：👨‍💼 需要管理员权限（Admin）
- `GET /api/log/self/stat` — 获取个人日志统计：🔐 需要登录（User权限）
- `GET /api/log/self` — 获取个人日志：🔐 需要登录（User权限）
- `GET /api/log/token` — 通过令牌获取日志：🔓 无需鉴权（通过令牌查询）
## 根目录 / 数据统计
- `GET /api/data/` — 获取所有额度数据：👨‍💼 需要管理员权限（Admin）
- `GET /api/data/self` — 获取个人额度数据：🔐 需要登录（User权限）
## 根目录 / 分组
- `GET /api/group/` — 获取所有分组：👨‍💼 需要管理员权限（Admin）
- `GET /api/prefill_group/` — 获取预填分组：👨‍💼 需要管理员权限（Admin）
- `POST /api/prefill_group/` — 创建预填分组：👨‍💼 需要管理员权限（Admin）
- `PUT /api/prefill_group/` — 更新预填分组：👨‍💼 需要管理员权限（Admin）
- `DELETE /api/prefill_group/{id}` — 删除预填分组：👨‍💼 需要管理员权限（Admin）
## 根目录 / 任务
- `GET /api/mj/` — 获取所有Midjourney任务：👨‍💼 需要管理员权限（Admin）
- `GET /api/mj/self` — 获取个人Midjourney任务：🔐 需要登录（User权限）
- `GET /api/task/` — 获取所有任务：👨‍💼 需要管理员权限（Admin）
- `GET /api/task/self` — 获取个人任务：🔐 需要登录（User权限）
## 根目录 / 供应商
- `GET /api/vendors/` — 获取所有供应商：👨‍💼 需要管理员权限（Admin）
- `POST /api/vendors/` — 创建供应商：👨‍💼 需要管理员权限（Admin）
- `PUT /api/vendors/` — 更新供应商：👨‍💼 需要管理员权限（Admin）
- `GET /api/vendors/search` — 搜索供应商：👨‍💼 需要管理员权限（Admin）
- `GET /api/vendors/{id}` — 获取指定供应商：👨‍💼 需要管理员权限（Admin）
- `DELETE /api/vendors/{id}` — 删除供应商：👨‍💼 需要管理员权限（Admin）
## 根目录 / 模型管理
- `GET /api/models/` — 获取所有模型元数据：👨‍💼 需要管理员权限（Admin）
- `POST /api/models/` — 创建模型元数据：👨‍💼 需要管理员权限（Admin）
- `PUT /api/models/` — 更新模型元数据：👨‍💼 需要管理员权限（Admin）
- `GET /api/models/search` — 搜索模型：👨‍💼 需要管理员权限（Admin）
- `GET /api/models/{id}` — 获取指定模型：👨‍💼 需要管理员权限（Admin）
- `DELETE /api/models/{id}` — 删除模型：👨‍💼 需要管理员权限（Admin）
- `GET /api/models/sync_upstream/preview` — 预览上游模型同步：👨‍💼 需要管理员权限（Admin）
- `POST /api/models/sync_upstream` — 同步上游模型：👨‍💼 需要管理员权限（Admin）
- `GET /api/models/missing` — 获取缺失模型：👨‍💼 需要管理员权限（Admin）
## 根目录 / 系统设置
- `GET /api/option/` — 获取系统选项：👑 需要超级管理员权限（Root）
- `PUT /api/option/` — 更新系统选项：👑 需要超级管理员权限（Root）
- `POST /api/option/rest_model_ratio` — 重置模型倍率：👑 需要超级管理员权限（Root）
- `POST /api/option/migrate_console_setting` — 迁移控制台设置：👑 需要超级管理员权限（Root）
- `GET /api/ratio_sync/channels` — 获取可同步渠道：👑 需要超级管理员权限（Root）
- `POST /api/ratio_sync/fetch` — 获取上游倍率：👑 需要超级管理员权限（Root）