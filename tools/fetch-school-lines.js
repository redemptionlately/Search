// tools/fetch-school-lines.js — 按学校清单拉院校/专业复试线
// 用法：npm run crawl:schools
// 策略：各校研招网结构差异大，脚本生成“待采任务表”，人工/半自动核验 sourceUrl 后入库
// 不把未核验分数直接写入 seed，这是上架合规要求。
const fs = require('fs');
const path = require('path');

const SCHOOLS = [
  { schoolId: '10001', name: '北京大学', yjsy: 'https://admission.pku.edu.cn/' },
  { schoolId: '10003', name: '清华大学', yjsy: 'https://yz.tsinghua.edu.cn/' },
  { schoolId: '10335', name: '浙江大学', yjsy: 'https://grs.zju.edu.cn/' },
  { schoolId: '10486', name: '武汉大学', yjsy: 'https://gs.whu.edu.cn/' },
  { schoolId: '10487', name: '华中科技大学', yjsy: 'https://gs.hust.edu.cn/' },
  { schoolId: '10246', name: '复旦大学', yjsy: 'https://gs.fudan.edu.cn/' }
];

function main() {
  const outDir = path.join(__dirname, '..', 'database', '_incoming');
  fs.mkdirSync(outDir, { recursive: true });
  const tasks = SCHOOLS.map(s => ({
    ...s,
    keyword: '复试分数线 / 复试基本要求',
    years: [2025, 2024, 2023],
    status: 'todo',
    tip: `打开 ${s.yjsy} 搜“复试线”，把 (专业, 学硕/专硕, 年, 总分, 单科, 计划数, 来源URL) 填入 score_lines 待审表`
  }));
  fs.writeFileSync(path.join(__dirname, 'school-list.json'), JSON.stringify(SCHOOLS, null, 2));
  fs.writeFileSync(path.join(outDir, 'school-tasks.json'), JSON.stringify(tasks, null, 2));
  console.log('[schools] 待采任务表已生成：database/_incoming/school-tasks.json，共', tasks.length, '校');
  console.log('[schools] 全国 800+ 招生单位按此表扩展，先做 20 所热门院校再全量。');
}
main();
