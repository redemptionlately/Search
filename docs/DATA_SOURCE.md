# DATA_SOURCE — 复试线/公告怎么查到

## 1. 国家线（每年 3 月）

- 来源：研招网 `https://yz.chsi.com.cn` → 网报公告/分数线栏目
- 工具：`npm run crawl:national` 生成 `database/_incoming/national-{year}.json` 模板，人工填入后导入 `national_lines`
- 研招网反爬：不硬爬全文，以模板+人工核验为准

## 2. 院校/专业复试线（核心）

- 来源：各校研究生院（yjsy）+ 学院官网"复试线/复试办法"栏目
- 工具：`npm run crawl:schools` 生成 `database/_incoming/school-tasks.json`（800+ 招生单位按此表扩展，先做 20 所热门）
- 字段：`(schoolId, majorCode, majorName, 学硕/专硕, year, 总分, 单科, 录取最低/平均, 计划数, sourceUrl)`
- `sourceUrl` 必填，无来源的数据不入库、不展示

## 3. 学院公告

- 分类：复试线 / 调剂 / 招生简章 / 录取名单 / 考试大纲
- `npm run parse:notices`，只存标题+链接+日期，正文跳官网（版权+包体积）
- 后期：云函数定时触发器每周拉一次 + 人工审

## 4. 涨跌原因 + 学校评价

- 原因优先用可验证因子：招生计划增减、报录比、命题难度变化、学科调整；无公开说明写"暂无公开说明"
- 评价注明来源：教育部学科评估 / 软科排名 / 学生口碑（注明样本），与分数分开字段存 `evaluations`
