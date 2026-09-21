// utils/geo.js — 地图模式三级下钻逻辑
// 全国 -> 省 -> 市 -> 区县+学校markers
const ZOOM_LEVELS = { COUNTRY: 4, PROVINCE: 7, CITY: 10, COUNTY: 12 };
const MAX_MARKERS = 150;

function levelForScale(scale) {
  if (scale >= ZOOM_LEVELS.COUNTY) return 'county';
  if (scale >= ZOOM_LEVELS.CITY) return 'city';
  if (scale >= ZOOM_LEVELS.PROVINCE) return 'province';
  return 'country';
}

// 按当前级别聚合学校为气泡/marker（超量截断，保证性能）
function aggregate(schools, level) {
  const key = level === 'country' ? 'province' : level === 'province' ? 'city' : 'county';
  const groups = {};
  for (const s of schools) {
    const k = s[key] || '未知';
    (groups[k] = groups[k] || []).push(s);
  }
  const bubbles = Object.entries(groups).map(([name, list]) => ({ name, count: list.length }));
  // 市/区县级且学校少时直接返回 markers
  let markers = [];
  if ((level === 'city' || level === 'county') && schools.length <= MAX_MARKERS) {
    markers = schools.map(s => ({
      id: s.schoolId, latitude: s.lat, longitude: s.lng,
      title: s.name, province: s.province, city: s.city
    }));
  }
  return { bubbles, markers };
}

module.exports = { ZOOM_LEVELS, MAX_MARKERS, levelForScale, aggregate };
