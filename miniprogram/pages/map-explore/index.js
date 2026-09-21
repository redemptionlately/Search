// pages/map-explore — 地图模式：省->市两级 picker 下钻 + 院校 marker
const api = require('../../services/api.js');
const geo = require('../../utils/geo.js');
const REGIONS = require('../../data/regions.json');
const PROVINCES = Object.keys(REGIONS);
Page({
  data: {
    scale: 4, level: 'country', latitude: 35.0, longitude: 105.0,
    provinces: PROVINCES, cities: [],
    provIdx: -1, cityIdx: -1, curProvince: '', curCity: '',
    bubbles: [], markers: [], schools: [], tip: '先选省，再选市，放大到市级可见院校定位'
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
    const scale = (e.detail && e.detail.scale) || this.data.scale;
    this.setData({ scale, level: geo.levelForScale(scale) }, () => this.reload());
  },
  pickProvince(e) {
    const i = Number(e.detail.value);
    const prov = PROVINCES[i];
    this.setData({
      provIdx: i, cityIdx: -1, curProvince: prov, curCity: '',
      cities: REGIONS[prov] || [], level: 'province', scale: 7
    }, () => this.reload());
  },
  pickCity(e) {
    const i = Number(e.detail.value);
    const city = (this.data.cities || [])[i] || '';
    this.setData({ cityIdx: i, curCity: city, level: 'city', scale: 10 }, () => this.reload());
  },
  reset() {
    this.setData({ provIdx: -1, cityIdx: -1, curProvince: '', curCity: '', cities: [], level: 'country', scale: 4 }, () => this.reload());
  },
  goSchool(e) { wx.navigateTo({ url: `/pages/school-detail/index?id=${e.currentTarget.dataset.id}` }); },
  onMarkerTap(e) {
    const id = String(e.detail.markerId);
    wx.navigateTo({ url: `/pages/school-detail/index?id=${id}` });
  }
});
