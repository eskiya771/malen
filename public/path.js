(function () {
  'use strict';

  const BASE = String(window.MALEN_BASE || '').replace(/\/+$/, '');

  function u(path) {
    const value = String(path == null ? '' : path);
    if (/^https?:\/\//i.test(value) || value.startsWith('//')) return value;
    if (!BASE) return value;
    if (value.startsWith('/')) {
      if (value === BASE || value.startsWith(`${BASE}/`)) return value;
      return `${BASE}${value}`;
    }
    return value;
  }

  window.MALEN_BASE = BASE;
  window.u = u;
  window.MALEN_ORIGIN = location.origin;
})();
