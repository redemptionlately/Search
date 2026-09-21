# CLOUD_DB_SETUP — 云端库搭建（10 分钟）

首选 **微信云开发**（小程序原生，免服务器）。

## 1. 建环境

1. 微信开发者工具 → 云开发 → 新建环境 `search-prod`（按量计费，有免费额度）
2. `miniprogram/app.js` 的 `envId` 改成你的环境 ID
3. 云函数目录右键 `cloudfunctions/scores|school|notices` → 上传并部署

## 2. 建集合（数据库 → 添加集合）

` schools / score_lines / national_lines / notices / evaluations`，字段按 `database/schema/*.schema.json`。

索引建议：
- `score_lines`：`schoolId + majorCode + year`、`schoolId + studyType + year`
- `schools`：`province + city`、`name`（文本/正则查询）
- `notices`：`schoolId + publishDate desc`

权限：读公开、写仅管理员（通过云函数写，关闭客户端直接写）。

## 3. 导入数据

- 开发期：`database/seed/*.sample.json` 直接导入（示例数据）
- 正式：`tools/` 跑出 `database/_incoming/*.json`，人工核验 `sourceUrl` 后导入
- >1MB 的 geo/图片放云存储，不进数据库

## 4. 备选方案

- LeanCloud / Supabase：需在小程序后台 → 服务器域名 → request 合法域名加白 + `api.js` 切 REST 分支
- 首版不建议自建服务器（要备案域名 + 过审类目证明，更慢）
