// pages/major-pick — 先选专业：门类 -> 专业 -> 国家线参考 + 有分数线的学校（只显示该专业）
const api = require('../../services/api.js');

// 专业所属门类 -> 国家线行匹配（门类级参考线）
function matchNational(national, major) {
  const cat = major.category;
  const dtOk = (r) => major.degreeType === '学硕' ? (r.degreeType === '学硕' || r.degreeType === '统一') : (r.degreeType === '专硕' || r.degreeType === '统一');
  const hit = (r) => {
    const t = (r.category || '') + (r.sub || '');
    if (t.includes(cat)) return true;
    if (cat === '工学') return /工科/.test(t);
    if (cat === '管理学') return /管理|工商|会计|图书|审计/.test(t);
    if (cat === '医学') return /医学|临床|中医|口腔|护理|药/.test(t);
    if (cat === '教育学') return /教育|体育|心理|中文/.test(t);
    if (cat === '法学') return /法|社工|警务|知识/.test(t);
    if (cat === '文学') return /文|翻译|新闻|出版/.test(t);
    if (cat === '农学') return /农|兽医|园林|林业/.test(t);
    if (cat === '艺术学') return /艺术/.test(t);
    if (cat === '历史学') return /历史|文物|考古/.test(t);
    if (cat === '交叉学科') return /交叉/.test(t);
    return false;
  };
  return national.filter(r => dtOk(r) && hit(r));
}

// 专业码双向归属：0854 含 085404，081200 精确
function matchMajor(row, code) {
  const mc = row.majorCode || '';
  if (!mc) return row.majorName && false;
  return mc === code || mc.startsWith(code) || code.startsWith(mc);
}

Page({
  data: {
    categories: [], catIdx: 0, majors: [], majorList: [],
    cur: null, nationalRef: [], schools: [], tip: ''
  },
  async onLoad() {
    const [majors, national, schools] = await Promise.all([
      api.getMajors({}), api.getNationalLines({}), api.getSchools({})
    ]);
    const cats = [...new Set(majors.map(m => m.category))];
    this._majors = majors; this._national = national || []; this._schools = schools || [];
    const nameMap = {}; for (const s of this._schools) nameMap[s.schoolId] = s.name;
    this._nameMap = nameMap;
    this.setData({ categories: cats }, () => this.pickCat({ detail: { value: 0 } }));
  },
  pickCat(e) {
    const i = Number(e.detail.value);
    const cat = this.data.categories[i];
    const list = this._majors.filter(m => m.category === cat);
    this.setData({ catIdx: i, majorList: list, cur: null, nationalRef: [], schools: [], tip: `“${cat}”共 ${list.length} 个专业，点一个只看该专业` });
  },
  async pickMajor(e) {
    const m = this.data.majorList[e.currentTarget.dataset.idx];
    const ref = matchNational(this._national, m).filter(r => r.year === 2025).slice(0, 8);
    const all = await api.getAllScores().catch(() => []);
    const lines = all.filter(r => matchMajor(r, m.code));
    lines.sort((a, b) => a.year - b.year);
    const bySchool = {};
    for (const l of lines) {
      const k = l.schoolId;
      (bySchool[k] = bySchool[k] || { id: k, name: this._nameMap[k] || k, lines: [] }).lines.push(l);
    }
    const schoolArr = Object.values(bySchool);
    this.setData({
      cur: m, nationalRef: ref, schools: schoolArr,
      tip: schoolArr.length ? `“${m.name}”有分数线记录 ${schoolArr.length} 校` : `“${m.name}”暂无学校分数线入库（建设中），先看门类国家线`
    });
  },
  goSchool(e) { wx.navigateTo({ url: `/pages/school-detail/index?id=${e.currentTarget.dataset.id}` }); }
});
