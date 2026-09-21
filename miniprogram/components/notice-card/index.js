Component({
  properties: { notice: { type: Object, value: {} } },
  methods: {
    open() {
      const url = this.data.notice.url;
      if (url) wx.setClipboardData({ data: url, success: () => wx.showToast({ title: '官网链接已复制', icon: 'none' }) });
    }
  }
});
