# MAP_MODE — 地图模式

## 交互

全国（省聚合气泡，显示院校数）→ 点击/放大到省（市聚合）→ 市（区县 + 学校 markers）→ 点击 marker 进学校详情。

- 缩放阈值：`utils/geo.js:ZOOM_LEVELS = { COUNTRY:4, PROVINCE:7, CITY:10, COUNTY:12 }`
- markers 上限 150，超出按距离聚合；定位是可选权限，拒绝则手动选省市
- 坐标系一律 GCJ-02（腾讯/高德标准），百度系入库前必须转换

## 数据

- 学校坐标存 `schools.lng/lat + province/city/county`（国家统计局标准名）
- 省市县简化边界放 `miniprogram/assets/geo/`（单文件 <200KB），全量边界运行时按需从云存储拉
- 聚合预览：`npm run geo:build` → `database/_incoming/geo-agg.json`

## 全国覆盖做法

1. 先用教育部招生单位名单建 `schools`（院校代码+省市），v1 已收录 608 所高校 / 31 省（`database/seed/schools.json`，双一流 146 所、985 39 所全覆盖；研究院所/党校/港澳台另计未收）
2. 再补坐标（腾讯位置服务逆解析 + 人工校准，当前为 `approx` 近似，一个学校只保留主校区坐标+文字说明分校区）
3. 区县级只在放大到市后加载，避免首屏包体积爆炸
4. 920/900 开头为军队院校，如需屏蔽可在查询层过滤
