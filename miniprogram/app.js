// app.js — 全局入口：云开发初始化 + 隐私同意标记
App({
  globalData: {
    cloudReady: false,
    envId: 'search-prod', // 云开发环境ID，见 docs/CLOUD_DB_SETUP.md
    agreedPrivacy: false
  },
  onLaunch() {
    // 本地 seed 降级可用，无云环境也不阻塞启动
    if (wx.cloud) {
      try {
        wx.cloud.init({ env: this.globalData.envId, traceUser: true });
        this.globalData.cloudReady = true;
      } catch (e) {
        console.warn('[cloud] init failed, fallback to seed:', e);
      }
    }
    try {
      this.globalData.agreedPrivacy = !!wx.getStorageSync('privacy_agreed');
    } catch (e) {}
  }
});
