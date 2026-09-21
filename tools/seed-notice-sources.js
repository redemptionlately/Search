// tools/seed-notice-sources.js — 生成 notice_sources 集合的导入模板
// 用法：node tools/seed-notice-sources.js，然后在云开发控制台导入 database/_incoming/notice-sources.json
const fs = require('fs');
const path = require('path');

const SOURCES = [
  { schoolId: '10487', schoolName: '华中科技大学', college: '研究生院', listUrl: 'https://gszs.hust.edu.cn/zsjyjs/zsxx.htm', enabled: true, note: '示例：以官网实际栏目URL为准' },
  { schoolId: '10486', schoolName: '武汉大学', college: '研究生院', listUrl: 'https://gs.whu.edu.cn/zsjy.htm', enabled: true, note: '示例：以官网实际栏目URL为准' }
];

const outDir = path.join(__dirname, '..', 'database', '_incoming');
fs.mkdirSync(outDir, { recursive: true });
fs.writeFileSync(path.join(outDir, 'notice-sources.json'), JSON.stringify(SOURCES, null, 2));
console.log('[sources] 模板已生成：database/_incoming/notice-sources.json（核对栏目URL后导入 notice_sources 集合）');
