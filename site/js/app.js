/* 路由与共享渲染：hash 导航，按需注入各页面脚本。
   页面内容全部来自结构化数据：window.DSH_ARCH（笔记）+ window.DSH_ARCH_ZH（中文）+ window.DSH_ARCH_CONTENT（content/narrative.json）。 */
(function () {
  'use strict';
  var D = window.DSH_ARCH;
  var C = window.DSH_ARCH_CONTENT || { site: {}, glossary: [], phases: [], regions: [] };
  var FILES = { overview: 'pages/overview.js', map: 'pages/map.js', ledger: 'pages/ledger.js', phases: 'pages/phases.js', about: 'pages/about.js' };
  var TITLES = { overview: '总览', map: '架构', ledger: '账簿', phases: '阶段', about: '体例' };
  var pages = {};
  var injected = {};
  var current = null;

  var MON = ['一', '二', '三', '四', '五', '六', '七', '八', '九', '十', '十一', '十二'];
  var MARK = { a: '◦', i: '●', r: '◇' };
  var CLS = { a: 'a', i: 'i', r: 'r' };
  var STATUS = { a: '已封存', i: '现行', r: '仅远端' };

  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function byMonth() {
    var m = {};
    D.notes.forEach(function (x) {
      var k = x.d.slice(0, 7);
      (m[k] = m[k] || []).push(x);
    });
    return m;
  }
  function monthKey(k) { return MON[Number(k.slice(5, 7)) - 1] + '月'; }
  function legendHtml() {
    return '<p class="legend"><span><i class="i k">●</i> 现行（implemented）</span>' +
      '<span><i class="a k">◦</i> 已封存（archived，永久冻结）</span>' +
      '<span><i class="r k">◇</i> 仅存在于远端</span></p>';
  }
  function refCounts() {
    var c = {};
    D.notes.forEach(function (x) {
      (x.out || []).forEach(function (s) { c[s] = (c[s] || 0) + 1; });
    });
    return c;
  }
  function lang() {
    try { return localStorage.getItem('arch-lang') || 'zh'; } catch (e) { return 'zh'; }
  }
  function setLang(v) {
    try { localStorage.setItem('arch-lang', v); } catch (e) { /* 私有模式下忽略 */ }
  }
  /* Markdown -> HTML；marked 缺席时退化为转义文本 */
  var BOLD_BEFORE_CJK = /\*\*(?=[\u4e00-\u9fff\u3040-\u30ff\uac00-\ud7af])/g;
  function renderMarkdown(md) {
    if (!md) return '';
    // CommonMark 的 right-flanking 规则会让「**……。**后接汉字」的粗体失效；
    // 在紧邻 CJK 的 ** 前插入零宽空格（不可见），使闭合定界符"前面不是标点"而成立
    md = md.replace(BOLD_BEFORE_CJK, '\u200B**');
    if (typeof window.marked === 'object' && typeof window.marked.parse === 'function') {
      try { return window.marked.parse(md); } catch (e) { /* 落到下方纯文本 */ }
    }
    return '<p>' + esc(md) + '</p>';
  }
  /* content 文案中的 {占位符} 以提取元数据填充 */
  function fill(str) {
    return String(str || '').replace(/\{(\w+)\}/g, function (_, k) {
      return D.meta[k] !== undefined ? D.meta[k] : '';
    });
  }

  var phaseMap = {};
  C.phases.forEach(function (p) { phaseMap[p.key] = p; });

  var api = {
    data: D,
    zh: window.DSH_ARCH_ZH || {},
    content: C,
    site: C.site,
    phasesList: C.phases,
    phaseOf: function (k) { return phaseMap[k] || null; },
    regions: C.regions,
    glossary: C.glossary,
    esc: esc,
    md: renderMarkdown,
    fill: fill,
    byMonth: byMonth,
    monthKey: monthKey,
    legendHtml: legendHtml,
    refCounts: refCounts,
    lang: lang,
    setLang: setLang,
    rerender: function () { if (current && pages[current]) paint(current); },
    MON: MON,
    MARK: MARK,
    CLS: CLS,
    STATUS: STATUS
  };

  function route() {
    var m = location.hash.match(/^#\/([a-z]+)/);
    var name = m && FILES[m[1]] ? m[1] : 'overview';
    var qm = location.hash.match(/\?q=([^&]+)/);
    D.presetQuery = qm ? decodeURIComponent(qm[1]) : '';
    current = name;
    paintNav();
    if (pages[name]) { paint(name); return; }
    if (injected[name]) return;
    injected[name] = true;
    document.getElementById('page').innerHTML = '<p class="loading" role="status">载入中…</p>';
    var s = document.createElement('script');
    s.src = FILES[name];
    s.onload = function () { if (current === name && pages[name]) paint(name); };
    s.onerror = function () {
      if (current === name) document.getElementById('page').innerHTML =
        '<p class="load-error">页面加载失败：' + esc(FILES[name]) + '</p>';
    };
    document.head.appendChild(s);
  }
  function paint(name) {
    var main = document.getElementById('page');
    main.innerHTML = '';
    pages[name].render(main, api);
    document.title = '架构决策编年 · ' + TITLES[name];
    window.scrollTo(0, 0);
  }
  function paintNav() {
    Array.prototype.forEach.call(document.querySelectorAll('#nav a'), function (a) {
      var name = (a.getAttribute('href') || '').replace('#/', '');
      if (name === current) a.setAttribute('aria-current', 'page');
      else a.removeAttribute('aria-current');
    });
  }

  window.DSH_ARCH.pages = {
    register: function (name, def) {
      pages[name] = def;
      if (current === name) paint(name);
    }
  };
  /* 骨架槽位：index.html 只留容器，文案由 content/narrative.json 填充 */
  function fillSkeleton() {
    var sub = document.getElementById('slot-subtitle');
    if (sub) sub.textContent = C.site['副标题'] || '';
    var foot = document.getElementById('slot-footer');
    if (foot) {
      foot.innerHTML = (C.site['页脚'] || []).map(fill).filter(Boolean)
        .map(esc).join('<br>');
    }
  }
  window.addEventListener('hashchange', route);
  fillSkeleton();
  route();
})();
