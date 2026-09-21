// tools/sync-seed.js — database/seed -> miniprogram/data（小程序只打包 miniprogram/ 内文件）
const fs = require('fs');
const path = require('path');
const files = ['schools.sample.json', 'score_lines.sample.json', 'score_lines_verified.json', 'notices.sample.json', 'evaluations.sample.json', 'national_lines.json', 'regions.json'];
const src = path.join(__dirname, '..', 'database', 'seed');
const dst = path.join(__dirname, '..', 'miniprogram', 'data');
fs.mkdirSync(dst, { recursive: true });
for (const f of files) fs.copyFileSync(path.join(src, f), path.join(dst, f));
console.log('[sync] seed 已同步到 miniprogram/data/');
