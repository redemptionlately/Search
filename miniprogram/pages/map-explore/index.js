// pages/map-explore — 地图模式：省->市->区县下钻 + 院校 marker
const api = require('../../services/api.js');
const geo = require('../../utils/geo.js');
const { PROVINCES } = require('../../utils/constants.js');
Page({
  data: {
    scale: 4, level: 'country', latitude: 35.0, longitude: 105.0,
    provinces: PROVINCES, curProvince: '', curCity: '',
    bubbles: [], markers: [], schools: [], tip: '左右滑动缩放，下钻到市可看到院校'
  },
  async onLoad() { await this.reload(); },
  async reload() {
    const params = {};
    if (this.data.curProvince) params.province = this.data.curProvince;
    if (this.data.curCity) params.city = this.data.curCity;
    const schools = await api.getSchools(params).catch(() => []);
    const agg = geo.aggregate(schools, this.data.level);
    this.setData({ schools, bubbles: agg.bubbles, markers: agg.markers });
  },
  onRegionChange(e) {
    // map 缩放结束时按 scale 判定层级（machine demo 简化：手动按钮也可切换）
    const scale = (e.detail && e.detail.scale) || this.data.scale;
    this.setData({ scale, level: geo.levelForScale(scale) }, () => this.reload());
  },
  pickProvince(e) {
    this.setData({ curProvince: e.detail.value, curCity: '', level: 'province', scale: 7 }, () => this.reload());
  },
  pickCity(e) {
    const city = e.detail.value;
    this.setData({ curCity: city, level: 'city', scale: 10 }, () => this.reload());
  },
  reset() {
    this.setData({ curProvince: '', curCity: '', level: 'country', scale: 4 }, () => this.reload());
  },
  goSchool(e) { wx.navigateTo({ url: `/pages/school-detail/index?id=${e.currentTarget.dataset.id}` }); },
  onMarkerTap(e) {
    const id = String(e.detail.markerId);
    wx.navigateTo({ url: `/pages/school-detail/index?id=${id}` });
  }
});
