// 云函数 notice-fetcher：定时拉取学院公告（标题+链接+日期），去重写入 notices
// 部署后在云开发控制台启用定时触发器（每周一 08:00），来源配置见 notice_sources 集合
const cloud = require('wx-server-sdk');
const https = require('https');
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });
const db = cloud.database();

function fetchText(url, timeout = 15000) {
  return new Promise((resolve, reject) => {
    const req = https.get(url, { timeout, headers: { 'User-Agent': 'Mozilla/5.0 (kaoyan-search notice fetcher)' } }, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return resolve(fetchText(new URL(res.headers.location, url).href, timeout));
      }
      if (res.statusCode !== 200) return reject(new Error('HTTP ' + res.statusCode));
      const chunks = [];
      res.on('data', (c) => chunks.push(c));
      res.on('end', () => {
        const buf = Buffer.concat(chunks);
        const ct = (res.headers['content-type'] || '').toLowerCase();
        // 只处理 utf-8 站点，GBK 站点跳过（避免乱码入库）
        if (/gbk|gb2312|gb18030/.test(ct)) return reject(new Error('GBK charset skipped: ' + url));
        resolve(buf.toString('utf8'));
      });
    });
    req.on('timeout', () => { req.destroy(); reject(new Error('timeout')); });
    req.on('error', reject);
  });
}

// 通用提取：<a href> + 周边日期（YYYY-MM-DD / MM-DD），各校站结构不同，宁可漏抓不许错抓
function extractLinks(html, base) {
  const out = [];
  const re = /<a[^>]+href=["']([^"']+)["'][^>]*>([^<]{4,80})<\/a>/gi;
  let m;
  while ((m = re.exec(html))) {
    const title = m[2].replace(/\s+/g, '').trim();
    if (!/复试|调剂|招生|录取|大纲|拟录取|分数线/.test(title)) continue;
    let href = m[1];
    if (/^(javascript|#|mailto)/i.test(href)) continue;
    try { href = new URL(href, base).href; } catch (e) { continue; }
    const dm = html.slice(Math.max(0, m.index - 200), m.index + 200).match(/(20\d{2}[-/.年]\d{1,2}[-/.月]\d{1,2})/);
    out.push({ title, url: href, date: dm ? dm[1].replace(/[./年月]/g, '-').replace(/日$/, '') : '' });
  }
  return out;
}

exports.main = async () => {
  const stats = { sources: 0, found: 0, inserted: 0, skipped: [] };
  let sources = [];
  try {
    const r = await db.collection('notice_sources').where({ enabled: true }).limit(100).get();
    sources = r.data;
  } catch (e) { return { ok: false, error: 'notice_sources not ready: ' + e.message }; }
  for (const s of sources) {
    stats.sources++;
    let html;
    try { html = await fetchText(s.listUrl); }
    catch (e) { stats.skipped.push(`${s.schoolId} ${e.message}`); continue; }
    const links = extractLinks(html, s.listUrl);
    stats.found += links.length;
    for (const l of links) {
      const id = `${s.schoolId}_${Buffer.from(l.url).toString('base64').replace(/[^a-zA-Z0-9]/g, '').slice(0, 24)}`;
      try {
        const has = await db.collection('notices').where({ id }).limit(1).get();
        if (has.data.length) continue;
        await db.collection('notices').add({
          data: {
            id, schoolId: s.schoolId, schoolName: s.schoolName || '',
            college: s.college || '', title: l.title,
            publishDate: l.date || '', url: l.url,
            category: /调剂/.test(l.title) ? '调剂' : /复试|分数线/.test(l.title) ? '复试线' : /简章/.test(l.title) ? '招生简章' : /录取|拟录取/.test(l.title) ? '录取名单' : '复试线',
            autoFetched: true
          }
        });
        stats.inserted++;
      } catch (e) { stats.skipped.push(`${l.url} ${e.message}`); }
    }
  }
  return { ok: true, data: stats };
};
