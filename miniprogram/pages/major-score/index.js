const api = require('../../services/api.js');
const { calcTrend } = require('../../utils/trend.js');
Page({
  data: { schoolId: '', majorName: '', lines: [], trendText: '', school: null },
  async onLoad(q) {
    this.setData({ schoolId: q.id || '', majorName: decodeURIComponent(q.major || '') });
    const params = { schoolId: this.data.schoolId };
    if (q.code) params.majorCode = q.code;
    let lines = await api.getScores(params).catch(() => []);
    // 按专业名过滤（code 为空时）
    if (this.data.majorName) lines = lines.filter(x => !q.code || x.majorCode === q.code);
    if (this.data.majorName && !q.code) {
      // seed 演示：同名专业聚合
      const all = await api.getScores({ schoolId: this.data.schoolId }).catch(() => []);
      lines = all.filter(x => x.majorName === this.data.majorName);
    }
    lines = lines.sort((a, b) => a.year - b.year);
    const trendText = calcTrend(lines.map(x => ({ year: x.year, total: x.total }))).text;
    const d = await api.getSchoolDetail(this.data.schoolId).catch(() => null);
    this.setData({ lines, trendText, school: d && d.school });
  },
  copySource(e) {
    wx.setClipboardData({ data: e.currentTarget.dataset.url || '', success: () => wx.showToast({ title: '来源链接已复制', icon: 'none' }) });
  }
});
