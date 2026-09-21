const api = require('../../services/api.js');
Page({
  data: { showPrivacy: false, hotSchools: [], hotNotices: [] },
  onLoad() {
    try {
      if (!wx.getStorageSync('privacy_agreed')) this.setData({ showPrivacy: true });
    } catch (e) { this.setData({ showPrivacy: true }); }
    this.loadHot();
  },
  async loadHot() {
    const [schools, notices] = await Promise.all([
      api.getSchools({}).then(l => l.slice(0, 5)).catch(() => []),
      api.getNotices({}).then(l => l.slice(0, 3)).catch(() => [])
    ]);
    this.setData({ hotSchools: schools, hotNotices: notices });
  },
  agreePrivacy() {
    try { wx.setStorageSync('privacy_agreed', true); } catch (e) {}
    getApp().globalData.agreedPrivacy = true;
    this.setData({ showPrivacy: false });
  },
  goMap() { wx.switchTab({ url: '/pages/map-explore/index' }); },
  goSearch() { wx.switchTab({ url: '/pages/search-normal/index' }); },
  goSchool(e) { wx.navigateTo({ url: `/pages/school-detail/index?id=${e.currentTarget.dataset.id}` }); }
});
