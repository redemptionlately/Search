// tools/geo-build.js — 由学校坐标生成地图聚合文件（省->市->区县计数）
const fs = require('fs');
const path = require('path');

function main() {
  const schools = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'database', 'seed', 'schools.sample.json'), 'utf8'));
  const byProvince = {}, byCity = {};
  for (const s of schools) {
    byProvince[s.province] = (byProvince[s.province] || 0) + 1;
    const k = `${s.province}/${s.city}`;
    byCity[k] = (byCity[k] || 0) + 1;
  }
  const out = { updated: new Date().toISOString(), total: schools.length, byProvince, byCity };
  const outDir = path.join(__dirname, '..', 'database', '_incoming');
  fs.mkdirSync(outDir, { recursive: true });
  fs.writeFileSync(path.join(outDir, 'geo-agg.json'), JSON.stringify(out, null, 2));
  console.log('[geo] 聚合完成：', JSON.stringify(out.byProvince));
  console.log('[geo] 正式数据：省市县简化边界放 miniprogram/assets/geo/（单文件<200KB），全量边界运行时按需拉取。');
}
main();
