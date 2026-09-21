// 云函数 schools：学校列表/详情（含坐标省市县过滤，地图模式用）
const cloud = require('wx-server-sdk');
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });
const db = cloud.database();

exports.main = async (event) => {
  const { action = 'list', schoolId, province, city, keyword } = event;
  try {
    if (action === 'list') {
      const q = {};
      if (province) q.province = province;
      if (city) q.city = city;
      let cmd = db.collection('schools');
      let r;
      if (keyword) {
        r = await cmd.where(db.command.or([{ name: db.RegExp({ regexp: keyword, options: 'i' }) }])).limit(50).get();
        // 省市过滤在内存做（演示简化，数据量大时改复合索引查询）
        let list = r.data;
        if (province) list = list.filter(x => x.province === province);
        if (city) list = list.filter(x => x.city === city);
        return { ok: true, data: list };
      }
      r = await cmd.where(q).limit(100).get();
      return { ok: true, data: r.data };
    }
    if (action === 'detail') {
      const s = await db.collection('schools').where({ schoolId }).limit(1).get();
      const scores = await db.collection('score_lines').where({ schoolId }).orderBy('year', 'asc').limit(100).get();
      const notices = await db.collection('notices').where({ schoolId }).orderBy('publishDate', 'desc').limit(5).get();
      const evaluations = await db.collection('evaluations').where({ schoolId }).limit(20).get();
      return { ok: true, data: { school: s.data[0] || null, scores: scores.data, notices: notices.data, evaluations: evaluations.data } };
    }
    return { ok: false, error: 'unknown action' };
  } catch (e) { return { ok: false, error: String(e) }; }
};
