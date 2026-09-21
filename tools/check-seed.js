// tools/check-seed.js — 校验 seed + _incoming JSON 可解析、必填字段齐全
const fs = require('fs');
const path = require('path');

function must(file, keys) {
  const arr = JSON.parse(fs.readFileSync(file, 'utf8'));
  const list = Array.isArray(arr) ? arr : [arr];
  for (const [i, o] of list.entries()) {
    for (const k of keys) {
      if (o[k] === undefined || o[k] === null || o[k] === '') {
        // score_lines.reason 允许空字符串，其他必填
        if (!(file.includes('score_lines') && k === 'reason')) {
          throw new Error(`${file}[${i}] 缺字段 ${k}`);
        }
      }
    }
  }
  console.log('[ok]', file, `(${list.length}条)`);
}

try {
  const root = path.join(__dirname, '..', 'database', 'seed');
  must(path.join(root, 'schools.sample.json'), ['schoolId', 'name', 'province', 'city', 'lng', 'lat']);
  must(path.join(root, 'score_lines.sample.json'), ['schoolId', 'majorName', 'studyType', 'year', 'total', 'sourceUrl']);
  must(path.join(root, 'notices.sample.json'), ['id', 'schoolId', 'title', 'publishDate', 'url', 'category']);
  must(path.join(root, 'evaluations.sample.json'), ['schoolId', 'type', 'content', 'source']);
  console.log('[check] 全部通过');
} catch (e) { console.error('[check] FAIL:', e.message); process.exit(1); }
