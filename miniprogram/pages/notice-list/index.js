const api = require('../../services/api.js');
const { NOTICE_CATS } = require('../../utils/constants.js');
Page({
  data: { keyword: '', category: '', cats: ['全部'].concat(NOTICE_CATS), list: [] },
  onLoad() { this.load(); },
  onInput(e) { this.setData({ keyword: e.detail.value }); },
  pickCat(e) { const v = this.data.cats[e.detail.value]; this.setData({ category: v === '全部' ? '' : v }, () => this.load()); },
  async load() {
    const { keyword, category } = this.data;
    const list = await api.getNotices({ keyword, category }).catch(() => []);
    this.setData({ list });
  },
  open(e) {
    wx.setClipboardData({ data: e.currentTarget.dataset.url, success: () => wx.showToast({ title: '官网原文链接已复制', icon: 'none' }) });
  }
});
