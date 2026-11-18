Component({
  properties: {
    lines: {
      type: Array,
      value: [],
      observer(val) {
        this.computeBars(val);
      }
    }
  },
  data: {
    bars: []
  },
  lifetimes: {
    attached() {
      this.computeBars(this.data.lines);
    }
  },
  methods: {
    computeBars(lines) {
      const arr = Array.isArray(lines) ? lines : [];
      if (!arr.length) {
        this.setData({ bars: [] });
        return;
      }
      const totals = arr.map(x => Number(x && x.total) || 0).filter(n => n > 0);
      const minT = totals.length ? Math.min.apply(null, totals) : 0;
      const maxT = totals.length ? Math.max.apply(null, totals) : 0;
      const span = maxT - minT;
      const bars = arr.map(item => {
        const t = Number(item && item.total) || 0;
        let barHeight = 56;
        if (t <= 0) {
          barHeight = 16;
        } else if (span > 0) {
          barHeight = Math.round(28 + ((t - minT) / span) * 68);
        }
        return Object.assign({}, item, { barHeight });
      });
      this.setData({ bars });
    }
  }
});
