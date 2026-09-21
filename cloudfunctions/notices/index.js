// 云函数 notices：学院公告查询（只存标题+链接+日期，正文跳官网）
const cloud = require('wx-server-sdk');
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });
const db = cloud.database();

exports.main = async (event) => {
  const { action = 'list', schoolId, category, keyword } = event;
  try {
    const q = {};
    if (schoolId) q.schoolId = schoolId;
    if (category) q.category = category;
    const r = await db.collection('notices').where(q).orderBy('publishDate', 'desc').limit(50).get();
    let list = r.data;
    if (keyword) list = list.filter(x => (x.title || '').includes(keyword));
    return { ok: true, data: list };
  } catch (e) { return { ok: false, error: String(e) }; }
};
