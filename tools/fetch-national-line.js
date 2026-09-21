// tools/fetch-national-line.js — 拉国家线（研招网 yz.chsi.com.cn）
// 用法：npm run crawl:national
// 输出：database/_incoming/national-{year}.json（待人工核验后导入 national_lines 集合）
const fs = require('fs');
const path = require('path');

const YEARS = [2025, 2024, 2023];
const SOURCE = 'https://yz.chsi.com.cn/kyzx/kydt/ （研招网国家线栏目，每年3月更新）';

async function main() {
  const outDir = path.join(__dirname, '..', 'database', '_incoming');
  fs.mkdirSync(outDir, { recursive: true });
  console.log('[national] 数据源：' + SOURCE);
  console.log('[national] 研招网为动态页 + 反爬，本骨架不直接硬爬全文，只生成待填模板。');
  console.log('[national] 请人工打开研招网国家线，按模板填入 total/politics/english 后再导入。');
  for (const year of YEARS) {
    const tpl = {
      year, source: SOURCE, verified: false,
      note: '模板：按学科门类填，示例为工学',
      lines: [{ category: '工学(学硕)', total: null, politics: null, english: null, mathOrPro: null }]
    };
    const f = path.join(outDir, `national-${year}.json`);
    if (!fs.existsSync(f)) fs.writeFileSync(f, JSON.stringify(tpl, null, 2));
    console.log('[national] wrote', f);
  }
}
main();
