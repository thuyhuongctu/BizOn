(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.BizOnSeedEngine = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';

  function normalizePart(value) {
    return String(value ?? '')
      .trim()
      .toUpperCase()
      .replace(/[^A-Z0-9._-]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 64);
  }

  function createSeed(classId, teamId, scenarioId, engineVersion = '2.0.0-alpha.1') {
    const parts = [classId, teamId, scenarioId, engineVersion].map(normalizePart);
    return parts.filter(Boolean).join(':') || 'BIZON:DEMO';
  }

  // Seed KHÓA THEO LỚP: bỏ teamId để MỌI nhóm trong cùng mã lớp chạy CÙNG kịch bản
  // thị trường (buổi 3–4 so sánh công bằng). Chèn 'COHORT' để không trùng seed cá nhân.
  function createCohortSeed(classId, scenarioId, engineVersion = '2.0.0-alpha.1') {
    const parts = [classId, 'COHORT', scenarioId, engineVersion].map(normalizePart);
    return parts.filter(Boolean).join(':') || 'BIZON:DEMO';
  }

  function hashString(input) {
    let hash = 2166136261;
    const value = String(input);
    for (let i = 0; i < value.length; i += 1) {
      hash ^= value.charCodeAt(i);
      hash = Math.imul(hash, 16777619);
    }
    return hash >>> 0;
  }

  function mulberry32(seed) {
    let a = seed >>> 0;
    return function random() {
      a |= 0;
      a = (a + 0x6D2B79F5) | 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  function randomFromSeed(seed, namespace = 'default') {
    return mulberry32(hashString(`${seed}::${namespace}`));
  }

  function number(seed, namespace, min = 0, max = 1) {
    if (!Number.isFinite(min) || !Number.isFinite(max) || max < min) {
      throw new TypeError('invalid_range');
    }
    return min + randomFromSeed(seed, namespace)() * (max - min);
  }

  function integer(seed, namespace, min, max) {
    if (!Number.isInteger(min) || !Number.isInteger(max) || max < min) {
      throw new TypeError('invalid_integer_range');
    }
    return Math.floor(number(seed, namespace, min, max + 1));
  }

  function pick(seed, namespace, items) {
    if (!Array.isArray(items) || items.length === 0) throw new TypeError('items_required');
    return items[integer(seed, namespace, 0, items.length - 1)];
  }

  function shuffle(seed, namespace, items) {
    if (!Array.isArray(items)) throw new TypeError('items_must_be_array');
    const result = items.slice();
    const random = randomFromSeed(seed, namespace);
    for (let i = result.length - 1; i > 0; i -= 1) {
      const j = Math.floor(random() * (i + 1));
      [result[i], result[j]] = [result[j], result[i]];
    }
    return result;
  }

  return Object.freeze({
    normalizePart,
    createSeed,
    createCohortSeed,
    hashString,
    randomFromSeed,
    number,
    integer,
    pick,
    shuffle
  });
});
