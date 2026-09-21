// utils/trend.js — 涨跌计算（前端算，不入库）
function calcTrend(scores) {
  // scores: [{year, total}] 按年份升序
  if (!scores || scores.length < 2) return { dir: 'flat', diff: 0, pct: 0, text: '数据不足' };
  const a = scores[scores.length - 2].total;
  const b = scores[scores.length - 1].total;
  const diff = b - a;
  const dir = diff > 0 ? 'up' : diff < 0 ? 'down' : 'flat';
  const pct = a ? +(diff / a * 100).toFixed(1) : 0;
  const arrow = dir === 'up' ? '▲' : dir === 'down' ? '▼' : '—';
  return { dir, diff, pct, text: `${arrow} ${Math.abs(diff)}分 (${pct}%)` };
}

function trendOf3(y2023, y2024, y2025) {
  return calcTrend([{ year: 2023, total: y2023 }, { year: 2024, total: y2024 }, { year: 2025, total: y2025 }].filter(s => s.total != null));
}

module.exports = { calcTrend, trendOf3 };
