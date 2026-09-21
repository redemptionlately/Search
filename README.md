# 考研查分 Search · 微信小程序

查全国研究生各专业近三年复试线 + 学院公告。双模式：**地图模式**（省→市→区县下钻找学校）/ **常规模式**（搜索筛选对比）。

## 快速开始

1. 微信开发者工具 → 导入 `C:\Project\Search`（AppID 用测试号即可）
2. 预览 `miniprogram/pages/home`，无云环境会自动读 `database/seed/*.sample.json`
3. 接云端库按 `docs/CLOUD_DB_SETUP.md` 建 `search-prod` 环境（推荐微信云开发，免服务器）
4. 分数来源与采集见 `docs/DATA_SOURCE.md`，地图逻辑见 `docs/MAP_MODE.md`，协作规范见 `AGENTS.md`

## 目录

- `miniprogram/` 小程序前端（原生 WXML/WXSS/JS）
- `cloudfunctions/` 云函数（scores / schools / notices 查询接口）
- `database/schema/` 集合结构，`database/seed/` 示例数据
- `tools/` 本地采集脚本（国家线/院校线/公告/地图聚合）
- `docs/` 架构 / 云库搭建 / 数据来源 / 地图模式说明

## 数据状态

当前 `database/seed/` 为**示例数据**（已标 `sample`），上线前须用 `tools/` 采集并人工核验 `sourceUrl` 后替换。禁止把未核验分数当真实数据发布。

## 命令

```bash
npm install
npm run check            # 校验 seed / _incoming JSON
npm run crawl:national   # 国家线 -> database/_incoming/
npm run crawl:schools    # 院校复试线（待人工核验）
npm run parse:notices
npm run geo:build
```
