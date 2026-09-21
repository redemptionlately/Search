# ARCHITECTURE

## 总览

原生微信小程序 + 微信云开发。`miniprogram/services/api.js` 是唯一数据入口：

```
页面 -> api.js -> 云函数(scores/schools/notices) -> 云数据库
              └-> (无云环境) 本地 database/seed/*.sample.json
```

## 云端数据库（为什么选微信云开发）

| 方案 | 结论 |
|---|---|
| 微信云开发 CloudBase | **首选**：小程序原生鉴权、免服务器/免域名备案、按量免费额度够冷启动、审核最顺 |
| LeanCloud | 备选，REST 需配 request 合法域名 |
| Supabase / 自建 MySQL | 备选，需自备服务器+备案域名，首版不推荐 |

集合：`schools / score_lines / national_lines / notices / evaluations`，结构见 `database/schema/`。

## 双模式

- 地图模式 `pages/map-explore`：全国(省气泡) → 省(市气泡) → 市(区县+学校marker)，聚合逻辑 `utils/geo.js`，markers 上限 150
- 常规模式 `pages/search-normal`：关键词 + 省 + 学硕/专硕筛选，结果进 `school-detail` → `major-score`

## 分数与评价

- 涨跌前端算（`utils/trend.js`），不入库，避免口径漂移
- 原因/评价存 `evaluations`，必须带 `source`；写不清写"暂无公开说明"，禁止编造
