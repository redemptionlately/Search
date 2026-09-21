// 云函数 scores：按 (schoolId, majorCode, studyType) 查近三年复试线
const cloud = require('wx-server-sdk');
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });
const db = cloud.database();

exports.main = async (event) => {
  const { action = 'list', schoolId, majorCode, studyType, year } = event;
  try {
    if (action === 'list') {
      const q = {};
      if (schoolId) q.schoolId = schoolId;
      if (majorCode) q.majorCode = majorCode;
      if (studyType) q.studyType = studyType;
      if (year) q.year = year;
      const r = await db.collection('score_lines').where(q).orderBy('year', 'asc').limit(100).get();
      return { ok: true, data: r.data };
    }
    if (action === 'national') {
      const r = await db.collection('national_lines').where(year ? { year } : {}).limit(100).get();
      return { ok: true, data: r.data };
    }
    if (action === 'majors') {
      const r = await db.collection('majors').limit(300).get();
      return { ok: true, data: r.data };
    }
    if (action === 'all') {
      const r = await db.collection('score_lines').orderBy('year', 'asc').limit(500).get();
      return { ok: true, data: r.data };
    }
    return { ok: false, error: 'unknown action' };
  } catch (e) { return { ok: false, error: String(e) }; }
};
