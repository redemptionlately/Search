// services/api.js — 统一数据入口：云函数优先，本地 seed 降级
// 保证：没建云环境也能在开发者工具里预览全流程
const trend = require('../utils/trend.js');

let seedCache = null;
function loadSeed() {
  if (seedCache) return seedCache;
  // seed 打包在 miniprogram/data/ 下（由 database/seed 同步而来，见 tools/sync-seed.js）
  // 命名约定：*.sample.json = 示例数据（待替换）；national_lines.json = 已核验真实数据
  const schools = require('../data/schools.json');
  const sampleScores = require('../data/score_lines.sample.json');
  let verifiedScores = [];
  try { verifiedScores = require('../data/score_lines_verified.json'); } catch (e) { /* 核验库未到货前为空 */ }
  const scores = sampleScores.concat(verifiedScores);
  const notices = require('../data/notices.sample.json');
  const evaluations = require('../data/evaluations.sample.json');
  const national = require('../data/national_lines.json');
  seedCache = { schools, scores, notices, evaluations, national };
  return seedCache;
}

async function callFn(name, data) {
  const app = getApp();
  if (app.globalData.cloudReady && wx.cloud && wx.cloud.callFunction) {
    try {
      const r = await wx.cloud.callFunction({ name, data });
      if (r && r.result && r.result.ok) return r.result.data;
    } catch (e) { console.warn(`[api] ${name} fallback to seed:`, e); }
  }
  throw new Error('no-cloud');
}

function seedFilter(fnName, params) {
  const s = loadSeed();
  if (fnName === 'schools') {
    let list = s.schools;
    if (params.province) list = list.filter(x => x.province === params.province);
    if (params.city) list = list.filter(x => x.city === params.city);
    if (params.keyword) list = list.filter(x => x.name.includes(params.keyword));
    return list;
  }
  if (fnName === 'scores') {
    let list = s.scores.filter(x => x.schoolId === params.schoolId);
    if (params.majorCode) list = list.filter(x => x.majorCode === params.majorCode);
    if (params.studyType) list = list.filter(x => x.studyType === params.studyType);
    return list.sort((a, b) => a.year - b.year);
  }
  if (fnName === 'notices') {
    let list = s.notices;
    if (params.schoolId) list = list.filter(x => x.schoolId === params.schoolId);
    if (params.category) list = list.filter(x => x.category === params.category);
    if (params.keyword) list = list.filter(x => x.title.includes(params.keyword));
    return list.sort((a, b) => (b.publishDate > a.publishDate ? 1 : -1));
  }
  if (fnName === 'national') {
    let list = s.national;
    if (params.year) list = list.filter(x => x.year === params.year);
    if (params.degreeType) list = list.filter(x => x.degreeType === params.degreeType);
    if (params.category) list = list.filter(x => x.category === params.category);
    return list;
  }
  return [];
}

module.exports = {
  trend,
  async getSchools(params = {}) {
    try { return await callFn('schools', { action: 'list', ...params }); }
    catch (e) { return seedFilter('schools', params); }
  },
  async getSchoolDetail(schoolId) {
    try { return await callFn('schools', { action: 'detail', schoolId }); }
    catch (e) {
      const s = loadSeed();
      const school = s.schools.find(x => x.schoolId === schoolId);
      const scores = seedFilter('scores', { schoolId });
      const notices = seedFilter('notices', { schoolId }).slice(0, 5);
      const evals = s.evaluations.filter(x => x.schoolId === schoolId);
      return { school, scores, notices, evaluations: evals };
    }
  },
  async getScores(params) {
    try { return await callFn('scores', { action: 'list', ...params }); }
    catch (e) { return seedFilter('scores', params); }
  },
  async getNotices(params = {}) {
    try { return await callFn('notices', { action: 'list', ...params }); }
    catch (e) { return seedFilter('notices', params); }
  },
  async getNationalLines(params = {}) {
    try { return await callFn('scores', { action: 'national', ...params }); }
    catch (e) { return seedFilter('national', params); }
  }
};
