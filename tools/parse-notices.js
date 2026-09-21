// tools/parse-notices.js — 学院公告解析：只存标题+链接+日期
const fs = require('fs');
const path = require('path');

function main() {
  const outDir = path.join(__dirname, '..', 'database', '_incoming');
  fs.mkdirSync(outDir, { recursive: true });
  const tpl = [
    { id: 'todo-1', schoolId: '10487', schoolName: '华中科技大学', college: '计算机学院', title: '待填标题', publishDate: '2025-03-15', url: 'https://待填官网链接', category: '复试线' }
  ];
  fs.writeFileSync(path.join(outDir, 'notices-todo.json'), JSON.stringify(tpl, null, 2));
  console.log('[notices] 模板已生成：database/_incoming/notices-todo.json');
  console.log('[notices] 合规：只存标题/链接/日期，正文一律跳官网原文，不入库全文。');
}
main();
