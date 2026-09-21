// pages/search-normal — 常规模式：关键词 + 省/学硕专硕/年份筛选
const api = require('../../services/api.js');
const { PROVINCES, STUDY_TYPES, YEARS } = require('../../utils/constants.js');
Page({
  data: {
    keyword: '', province: '', studyType: '', year: '',
    provinces: ['全部'].concat(PROVINCES), studyTypes: ['全部'].concat(STUDY_TYPES),
    years: ['全部'].concat(YEARS.map(String)), results: [], history: []
  },
  onLoad() {
    try { this.setData({ history: wx.getStorageSync('search_history') || [] }); } catch (e) {}
    this.doSearch();
  },
  onInput(e) { this.setData({ keyword: e.detail.value }); },
  pickP(e) { const v = this.data.provinces[e.detail.value]; this.setData({ province: v === '全部' ? '' : v }, () => this.doSearch()); },
  pickT(e) { const v = this.data.studyTypes[e.detail.value]; this.setData({ studyType: v === '全部' ? '' : v }, () => this.doSearch()); },
  async doSearch() {
    const { keyword, province, studyType } = this.data;
    const schools = await api.getSchools({ keyword, province }).catch(() => []);
    // 专硕/学硕筛选需结合分数行：有该类型分数线才保留（seed 演示简化）
    let results = schools;
    if (studyType) {
      const kept = [];
      for (const s of schools) {
        const lines = await api.getScores({ schoolId: s.schoolId, studyType }).catch(() => []);
        if (lines.length) kept.push(s);
      }
      results = kept;
    }
    this.setData({ results });
    if (keyword) {
      const h = [keyword].concat(this.data.history).filter((v, i, a) => v && a.indexOf(v) === i).slice(0, 10);
      this.setData({ history: h });
      try { wx.setStorageSync('search_history', h); } catch (e) {}
    }
  },
  clearHistory() { this.setData({ history: [] }); try { wx.removeStorageSync('search_history'); } catch (e) {} },
  goSchool(e) { wx.navigateTo({ url: `/pages/school-detail/index?id=${e.currentTarget.dataset.id}` }); }
});
