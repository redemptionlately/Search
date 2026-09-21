// pages/national-line — 国家线查询：年份/A/B区/学硕专硕 + 同比涨跌
const api = require('../../services/api.js');
Page({
  data: {
    years: [2025, 2024, 2023], year: 2025,
    regions: ['A区（一区）', 'B区（二区）'], regionIdx: 0,
    degrees: ['全部', '学硕', '专硕', '统一'], degree: '全部',
    all: [], rows: []
  },
  async onLoad() {
    const all = await api.getNationalLines({}).catch(() => []);
    this.setData({ all }, () => this.apply());
  },
  pickYear(e) { this.setData({ year: this.data.years[e.detail.value] }, () => this.apply()); },
  pickRegion(e) { this.setData({ regionIdx: e.detail.value }, () => this.apply()); },
  pickDegree(e) { this.setData({ degree: this.data.degrees[e.detail.value] }, () => this.apply()); },
  apply() {
    const { all, year, regionIdx, degree } = this.data;
    const region = regionIdx === 0 ? 'A' : 'B';
    const cur = all.filter(r => r.year === year && (degree === '全部' || r.degreeType === degree));
    const rows = cur.map(r => {
      const total = region === 'A' ? r.totalA : r.totalB;
      const s100 = region === 'A' ? r.s100A : r.s100B;
      const s150 = region === 'A' ? r.s150A : r.s150B;
      // 找上一年同口径对比（2023学硕/专硕各自对比，2024/2025统一口径对比）
      const prev = all.find(p => p.year === year - 1 && p.degreeType === r.degreeType && p.category === r.category && (p.sub || '') === (r.sub || ''));
      let diff = null;
      if (prev) {
        const pt = region === 'A' ? prev.totalA : prev.totalB;
        diff = total - pt;
      }
      return { ...r, total, s100, s150, diff };
    });
    this.setData({ rows });
  },
  copySource(e) {
    wx.setClipboardData({ data: e.currentTarget.dataset.url || '', success: () => wx.showToast({ title: '研招网来源已复制', icon: 'none' }) });
  }
});
