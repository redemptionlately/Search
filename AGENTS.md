# AGENTS.md — 考研查分小程序 (Search)

> Agent / 协作者必读。改代码前先读完本文件 + `docs/ARCHITECTURE.md`。

## 1. 项目是什么

微信小程序，上架用。查全国考研研究生：

- 各专业近三年分数（国家线 / 院校复试线 / 专业复试线 / 录取最低分/平均分）
- 学院公告（研招网 / 各校研招办 / 学院官网）
- 学校信息：涨跌趋势 + 原因分析 + 学校评价
- 两种模式：
  1. `地图模式`：中国地图 省 → 市 → 区县逐级放大，显示当地考研院校 marker，点击进学校详情
  2. `常规模式`：按学校 / 专业 / 年份 / 学硕专硕 / 地区搜索、对比、看趋势

## 2. 技术栈（已定，不要擅自换）

- 前端：原生微信小程序 (`miniprogram/`，WXML/WXSS/JS)，不用 uni-app / taro，保持可上架最小体积
- 图表：`wx-charts` / `echarts-for-weixin`（二选一，当前骨架用轻量自绘 `components/score-trend`，后期可换 echarts）
- 地图：`<map>` 组件 + 腾讯位置服务（坐标系 GCJ-02）。禁止用高德/百度原始坐标直接入库，入库前必须转 GCJ-02
- 云端数据库：**微信云开发 CloudBase**（首选，免服务器、免域名备案、小程序原生鉴权）
  - 备选：LeanCloud / Supabase REST（需在小程序后台配合法 request 域名，见 `docs/CLOUD_DB_SETUP.md`）
  - 本地降级：`miniprogram/services/api.js` 无云环境时自动读 `database/seed/*.json`，保证开发者工具可直接预览
- 云函数：`cloudfunctions/{scores,schools,notices}/`，Node.js 16+，只做查询聚合，不做爬虫（爬虫在 `tools/` 本地跑，人工核验后导入）

## 3. 目录结构

```
project.config.json / sitemap.json     # 小程序工程配置
miniprogram/
  app.js app.json app.wxss
  pages/home/            # 双模式入口
  pages/map-explore/     # 地图模式：省市区下钻 + 院校 markers
  pages/search-normal/   # 常规模式：搜索/筛选/排序
  pages/school-detail/   # 学校详情：涨跌 + 原因 + 评价 + 公告
  pages/major-score/     # 专业详情：近三年分数线表 + 趋势图
  pages/notice-list/     # 学院公告列表 (+详情页可后续加)
  components/school-card/ score-trend/ notice-card/
  services/api.js        # 统一数据入口（云函数优先，seed 降级）
  utils/geo.js trend.js constants.js
cloudfunctions/scores|schools|notices/ # 查询接口
database/
  schema/*.schema.json   # 集合结构（唯一事实来源）
  seed/*.sample.json     # 示例数据（必须标 sample，上线前替换）
tools/                   # 爬虫/解析脚本（本地跑，不进小程序包）
docs/                    # ARCHITECTURE / DATA_SOURCE / MAP_MODE / CLOUD_DB_SETUP
```

## 4. 数据约定（改 schema 前先改 `database/schema/`）

- 主键：`schoolId` = 教育部院校代码字符串（如 `10001` 北大）；`majorCode` = 6位专业代码（如 `081200`）；年份 `year` 数字
- 分数行 `score_lines` 一条 = (schoolId, majorCode|NULL, studyType 学硕/专硕, year)：`total, politics, english, mathOrPro, reason, sourceUrl`
- 涨跌：前端算，不入库。`utils/trend.js:calcTrend()` 输出 `up|down|flat + diff + pct`
- 原因/评价：`evaluations` 集合，字段 `type: trend_reason|school_review`，必须带 `source`（官网/研招网/人工整理），禁止编造原因
- 公告 `notices`：`schoolId, college, title, publishDate, url, category: 复试线/调剂/招生简章/录取名单`
- 坐标：`schools` 的 `lng/lat` 必须 GCJ-02，`province/city/county` 三级标准名（按国家统计局）
- 示例数据文件名一律 `*.sample.json`，正式数据走云开发导入，不进 git 大文件（>1MB 放云存储）

## 5. 常用命令

```bash
# 小程序：用微信开发者工具导入 C:\Project\Search（测试号即可），预览 pages/home
# 云开发：开发者工具 -> 云开发 -> 建环境 search-prod，把 database/schema 按 docs/CLOUD_DB_SETUP.md 建集合

# 本地工具脚本（Node 18+，根目录执行）
npm install
npm run crawl:national   # 拉国家线 -> database/_incoming/national.json
npm run crawl:schools    # 按 tools/school-list.json 拉院校复试线（需人工核验）
npm run parse:notices    # 解析学院公告页 -> notices 待审
npm run geo:build        # 由省市县表 + 学校坐标生成地图聚合文件
npm run check            # JSON schema 校验 seed + _incoming
```

## 6. 地图模式约定（见 docs/MAP_MODE.md）

- 三级下钻：全国（省聚合气泡，显示院校数）→ 省（市聚合）→ 市（区县 + 学校 markers），缩放阈值在 `utils/geo.js:ZOOM_LEVELS`
- markers 一次不超过 150 个，超出按距离聚合；`school-card` 点击进 `school-detail?id=xxx`
- 省市县 geo 只保留简化边界（`assets/geo/`，单文件 <200KB），详细边界运行时按需拉取，不打包
- 定位是可选权限，拒绝也要能手动选省市

## 7. 分数/公告采集约定（见 docs/DATA_SOURCE.md）

1. 国家线：研招网 `yz.chsi.com.cn`，每年 3 月更新，`tools/fetch-national-line.js`
2. 院校/专业复试线 + 学院公告：各校研招网/学院官网，`tools/fetch-school-lines.js` + `parse-notices.js`，**必须人工核验 sourceUrl 后才能入库**
3. 涨跌原因：先给 `招生人数/报录比/命题难度/学科评估` 等可验证因子，写不清就写"暂无公开说明"，不许用 AI 编原因
4. 学校评价：注明来源（教育部学科评估/软科/学生口碑-注明样本），评价与分数分开字段

## 8. 上架合规（微信审核必查）

- `sitemap.json`、隐私弹窗（`pages/home` 首次展示）、《用户协议》三件套缺一不可，删之前先问
- 公告内容只存标题+链接+日期，正文跳官网原文，不爬全文存库（版权）
- 不收集身份证/手机号以外的敏感信息；搜索历史只存本地 `wx.setStorageSync`
- 包体积：`miniprogram/` < 2MB 主包，geo/图片放云存储 + 分包（已在 `app.json` 预留 `subpackages` 注释位）

## 9. 提交规范

- 中文 commit：`feat(map): 省市下钻聚合` / `fix(search): 专硕筛选` / `data: 导入2024复试线(待审)` / `docs: ...`
- 分数数据 PR 必须带 `sourceUrl` 截图或链接，否则不合
- 先 `npm run check` 通过再提交；云函数改动要注明是否需重新部署

## 10. 当前 TODO（按顺序做）

1. [ ] 云开发环境 + 集合建成（按 docs/CLOUD_DB_SETUP.md，新增 `national_lines` 集合）
2. [x] 国家线 2023-2025 入库（`database/seed/national_lines.json`，研招网已核验，`pages/national-line` 可查同比涨跌）
3. [x] 21 所热门院校基础信息（含坐标，`database/seed/schools.sample.json`）→ 下一步：各校专业复试线逐校核验替换（`school-tasks.json` 21 校）
4. [ ] 地图省市聚合联调 + 真机定位测试
5. [ ] 公告定时拉取（云函数定时触发器）
6. [ ] 上架：类目选"教育-在线教育"，备好《信息来源说明》
