// pages/school-detail — 学校详情：涨跌 + 原因 + 评价 + 公告
const api = require('../../services/api.js');
const { calcTrend } = require('../../utils/trend.js');
Page({
  data: { id: '', school: null, scores: [], notices: [], evaluations: [], trendText: '' },
  async onLoad(q) {
    this.setData({ id: q.id || '' });
    await this.load();
  },
  async load() {
    const d = await api.getSchoolDetail(this.data.id).catch(() => null);
    if (!d || !d.school) { this.setData({ school: null }); return; }
    // 按专业聚合算一个代表趋势（取第一条专业近三年总分）
    const byMajor = {};
    for (const s of d.scores) { (byMajor[s.majorCode || s.majorName] = byMajor[s.majorCode || s.majorName] || []).push(s); }
    const firstKey = Object.keys(byMajor)[0];
    let trendText = '暂无趋势';
    if (firstKey) {
      const arr = byMajor[firstKey].sort((a, b) => a.year - b.year);
      trendText = calcTrend(arr.map(x => ({ year: x.year, total: x.total }))).text;
    }
    this.setData({ school: d.school, scores: d.scores, notices: d.notices || [], evaluations: d.evaluations || [], trendText });
  },
  goMajor(e) {
    const { major, code } = e.currentTarget.dataset;
    wx.navigateTo({ url: `/pages/major-score/index?id=${this.data.id}&major=${encodeURIComponent(major)}&code=${code || ''}` });
  },
  openNotice(e) {
    const url = e.currentTarget.dataset.url;
    wx.setClipboardData({ data: url, success: () => wx.showToast({ title: '官网链接已复制', icon: 'none' }) });
  }
});
